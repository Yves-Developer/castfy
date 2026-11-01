import fs from 'node:fs/promises';
import path from 'node:path';
import { app, safeStorage, shell } from 'electron';

/**
 * The Castfy account the app is signed in to.
 *
 * Sign-in is the device flow (RFC 8628), served by Better Auth behind the
 * website's /api/auth: the app asks for a code, opens /device in the browser,
 * and polls until the user approves there. The app never sees a password or
 * an OAuth redirect, and the same flow works unsigned, in dev and on every OS.
 *
 * What it gets back is a session token, kept encrypted with the OS keychain
 * (safeStorage) and sent as a bearer token on every call.
 */

/** Must match DESKTOP_CLIENT_ID in packages/backend/convex/auth.ts. */
const CLIENT_ID = 'castfy-desktop';
const DEVICE_GRANT = 'urn:ietf:params:oauth:grant-type:device_code';

/** RFC 8628 says to add 5 seconds to the interval on every slow_down. */
const SLOW_DOWN_STEP_MS = 5000;

const PLATFORM_NAMES = { darwin: 'macOS', win32: 'Windows', linux: 'Linux' };

/** Replace the Convex JWT this long before it expires, not at the last second. */
const JWT_EARLY_REFRESH_MS = 60_000;

export class Account {
  /**
   * @param {object} opts
   * @param {string} opts.file      where the encrypted session is kept
   * @param {string} opts.webUrl    the website hosting /api/auth and /device
   * @param {string | null} opts.convexUrl  the Convex backend's .convex.cloud URL
   * @param {(state: object) => void} opts.onChange   account state changed
   * @param {(progress: object) => void} opts.onSignIn  sign-in progress
   */
  constructor({ file, webUrl, convexUrl, onChange, onSignIn }) {
    this.file = file;
    this.webUrl = webUrl.replace(/\/$/, '');
    this.convexUrl = convexUrl?.replace(/\/$/, '') ?? null;
    /** The Convex JWT and when it expires (ms); minted from the session. */
    this.convexJwt = null;
    this.onChange = onChange;
    this.onSignIn = onSignIn;
    this.token = null;
    this.user = null;
    /** The sign-in in progress; replaced, not stacked, when one starts. */
    this.pending = null;
    /** Session id to token, from the last listSessions. */
    this.sessionTokens = null;
    /**
     * Sent with every request. The session is created by /device/token, so
     * this is what the Sessions page shows for the app instead of "node".
     */
    this.userAgent = `Castfy/${app.getVersion()} (${PLATFORM_NAMES[process.platform] ?? process.platform})`;
  }

  state() {
    return this.token && this.user
      ? { status: 'signed-in', user: this.user }
      : { status: 'signed-out', user: null };
  }

  /**
   * Restores the saved session, then checks it is still valid. Offline is not
   * a reason to sign someone out: the saved user stands until the server can
   * actually say the session is gone.
   */
  async load() {
    let saved;
    try {
      saved = JSON.parse(await fs.readFile(this.file, 'utf8'));
    } catch {
      return this.state();
    }
    if (!(saved?.token && safeStorage.isEncryptionAvailable())) {
      return this.state();
    }
    try {
      this.token = safeStorage.decryptString(Buffer.from(saved.token, 'base64'));
      this.user = saved.user ?? null;
    } catch {
      // Encrypted under another OS account or keychain: unusable here.
      await this.forget();
      return this.state();
    }

    this.refresh().catch(() => {
      // Offline or the server is down; keep the saved session.
    });
    return this.state();
  }

  /** Re-reads the user from the server; signs out if the session is gone. */
  async refresh() {
    if (!this.token) return this.state();
    const response = await this.call('/get-session', { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Could not check the session (${response.status})`);
    }
    const body = await response.json();
    if (!body?.user) {
      // The server no longer knows this session (it was revoked, or made
      // against another backend). The window may already be past sign-in on
      // the saved user, so tell it: otherwise it stays on a signed-in screen
      // with nothing behind it and no way to sign in.
      await this.forget();
      this.onChange(this.state());
      return this.state();
    }
    await this.save(this.token, pickUser(body.user));
    return this.state();
  }

  /**
   * Starts a sign-in: gets a code, opens the browser on it, and polls in the
   * background. Progress arrives through onSignIn; success through onChange.
   */
  async startSignIn() {
    this.cancelSignIn();

    let response;
    try {
      response = await fetch(this.url('/device/code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': this.userAgent },
        body: JSON.stringify({ client_id: CLIENT_ID }),
      });
    } catch {
      throw new Error("Couldn't reach Castfy. Check your internet connection and try again.");
    }
    if (!response.ok) {
      // A response at all means the network is fine; the service is not.
      throw new Error(
        `Castfy's sign-in service isn't available right now (${response.status}). Try again in a moment.`
      );
    }
    const code = await response.json();

    const attempt = {
      cancelled: false,
      userCode: code.user_code,
      verificationUrl: code.verification_uri_complete ?? code.verification_uri,
      expiresAt: Date.now() + code.expires_in * 1000,
    };
    this.pending = attempt;

    await shell.openExternal(attempt.verificationUrl);
    this.onSignIn({
      status: 'waiting',
      userCode: attempt.userCode,
      verificationUrl: attempt.verificationUrl,
    });

    this.poll(attempt, code.device_code, code.interval * 1000);
    return {
      userCode: attempt.userCode,
      verificationUrl: attempt.verificationUrl,
    };
  }

  /** Opens the approval page again, e.g. after the tab was closed. */
  async reopenBrowser() {
    if (this.pending) await shell.openExternal(this.pending.verificationUrl);
  }

  cancelSignIn() {
    if (this.pending) this.pending.cancelled = true;
    this.pending = null;
  }

  async poll(attempt, deviceCode, initialIntervalMs) {
    let intervalMs = initialIntervalMs;

    while (!attempt.cancelled) {
      await delay(intervalMs);
      if (attempt.cancelled) return;
      if (Date.now() > attempt.expiresAt) {
        return this.endSignIn(attempt, { status: 'expired' });
      }

      let body;
      try {
        const response = await fetch(this.url('/device/token'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': this.userAgent },
          body: JSON.stringify({
            grant_type: DEVICE_GRANT,
            device_code: deviceCode,
            client_id: CLIENT_ID,
          }),
        });
        body = await response.json();
      } catch {
        // A dropped request is not a failed sign-in; ask again next tick.
        continue;
      }
      if (attempt.cancelled) return;

      if (body.access_token) {
        await this.completeSignIn(attempt, body.access_token);
        return;
      }
      switch (body.error) {
        case 'authorization_pending':
          break;
        case 'slow_down':
          intervalMs += SLOW_DOWN_STEP_MS;
          break;
        case 'access_denied':
          return this.endSignIn(attempt, { status: 'denied' });
        case 'expired_token':
          return this.endSignIn(attempt, { status: 'expired' });
        default:
          return this.endSignIn(attempt, {
            status: 'error',
            message: body.error_description ?? 'Sign-in failed. Try again.',
          });
      }
    }
  }

  async completeSignIn(attempt, token) {
    this.token = token;
    try {
      await this.refresh();
    } catch (error) {
      this.token = null;
      return this.endSignIn(attempt, { status: 'error', message: error.message });
    }
    this.pending = null;
    this.onSignIn({ status: 'done' });
    this.onChange(this.state());
  }

  endSignIn(attempt, progress) {
    if (this.pending === attempt) this.pending = null;
    this.onSignIn(progress);
  }

  async signOut() {
    this.cancelSignIn();
    if (this.token) {
      this.call('/sign-out', { method: 'POST', body: '{}' }).catch(() => {
        // Revoking server-side is best effort; the local session is gone
        // either way, and an unrevoked one expires on its own.
      });
    }
    await this.forget();
    this.onChange(this.state());
    return this.state();
  }

  /**
   * The account's active sessions, newest first, with this app's own marked.
   * Only what the Sessions page shows; tokens stay in the main process.
   */
  async listSessions() {
    if (!this.token) return [];
    const response = await this.call('/list-sessions', { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Could not load your sessions (${response.status})`);
    }
    const sessions = await response.json();
    this.sessionTokens = new Map(sessions.map((s) => [s.id, s.token]));
    return sessions
      .map((s) => ({
        id: s.id,
        current: s.token === this.token,
        userAgent: s.userAgent ?? '',
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }

  /** Signs out one other session, by the id listSessions returned. */
  async revokeSession(id) {
    const token = this.sessionTokens?.get(id);
    if (!token) throw new Error('That session is no longer listed. Refresh and try again.');
    if (token === this.token) return this.signOut();
    const response = await this.call('/revoke-session', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      throw new Error(`Could not sign out that session (${response.status})`);
    }
    return this.state();
  }

  /**
   * The account's plan, limits and usage: billing.me on the backend. Null
   * when signed out.
   */
  plan() {
    return this.convexQuery('billing:me');
  }

  /**
   * Spends one free demo for an export, unless this demo was exported before:
   * billing.beginExport. Returns { allowed, ... }, or { allowed: false,
   * reason: "limit_reached", limit } when the free demos are used up.
   */
  beginExport(demoId) {
    return this.convexCall('mutation', 'billing:beginExport', { demoId });
  }

  /** Redeems a tester's beta code: { ok } or { ok: false, error }. */
  redeemBetaCode(code) {
    return this.convexCall('mutation', 'billing:redeemBetaCode', { code });
  }

  /** Opens Dodo Payments' customer portal (receipts, refunds) in the browser. */
  async portal() {
    const response = await this.call('/dodopayments/customer/portal', { method: 'GET' });
    if (response.status === 404) {
      throw new Error('Purchases are not available yet.');
    }
    if (!response.ok) {
      throw new Error(`Could not open your purchases (${response.status}). Try again.`);
    }
    const { url } = await response.json();
    await shell.openExternal(url);
  }

  /**
   * Opens Dodo Payments checkout for a plan in the browser. `slug` is a key of
   * @castfy/plans' product set: "lifetime". The signed-in user's id goes with
   * it as the reference, which is how the payment finds its account; the plan
   * lands through Dodo's webhook, and the caller watches plan() to see it.
   */
  async checkout(slug) {
    const response = await this.call('/dodopayments/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ slug, referenceId: this.user?.id }),
    });
    // 404: billing is not configured; "Product not found": its product id is
    // still the placeholder in @castfy/plans.
    const body = await response.json().catch(() => null);
    if (response.status === 404 || body?.message === 'Product not found') {
      throw new Error("Buying Castfy isn't available yet. Start with the free demos for now.");
    }
    if (!(response.ok && body?.url)) {
      throw new Error(`Could not start checkout (${response.status}). Try again.`);
    }
    await shell.openExternal(body.url);
  }

  /** Runs a Convex query as the signed-in user; see convexCall. */
  convexQuery(path, args = {}) {
    return this.convexCall('query', path, args);
  }

  /**
   * Runs a Convex query or mutation as the signed-in user, over Convex's HTTP
   * API with a JWT minted from the session (/api/auth/convex/token).
   */
  async convexCall(kind, path, args = {}) {
    if (!this.token) return null;
    if (!this.convexUrl) {
      throw new Error("Castfy's backend address is not configured (castfy.config.json or CASTFY_CONVEX_URL).");
    }
    const response = await fetch(`${this.convexUrl}/api/${kind}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.convexToken()}`,
      },
      body: JSON.stringify({ path, args, format: 'json' }),
    });
    const body = await response.json().catch(() => null);
    if (body?.status !== 'success') {
      throw new Error(body?.errorMessage ?? `Castfy's backend refused the request (${response.status})`);
    }
    return body.value;
  }

  /** A Convex JWT for this session, reused until a minute before it expires. */
  async convexToken() {
    if (this.convexJwt && this.convexJwt.expiresAt - JWT_EARLY_REFRESH_MS > Date.now()) {
      return this.convexJwt.token;
    }
    const response = await this.call('/convex/token', { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Could not authorize with Castfy's backend (${response.status})`);
    }
    const { token } = await response.json();
    this.convexJwt = { token, expiresAt: jwtExpiry(token) };
    return token;
  }

  /** A call to Better Auth as the signed-in user. */
  call(route, init = {}) {
    return fetch(this.url(route), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': this.userAgent,
        Authorization: `Bearer ${this.token}`,
        ...init.headers,
      },
    });
  }

  url(route) {
    return `${this.webUrl}/api/auth${route}`;
  }

  async save(token, user) {
    this.token = token;
    this.user = user;
    if (!safeStorage.isEncryptionAvailable()) {
      // No keychain: the session lasts until the app quits rather than being
      // written to disk in the clear.
      return;
    }
    const encrypted = safeStorage.encryptString(token).toString('base64');
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, `${JSON.stringify({ token: encrypted, user }, null, 2)}\n`, {
      encoding: 'utf8',
      mode: 0o600,
    });
  }

  async forget() {
    this.token = null;
    this.user = null;
    this.convexJwt = null;
    await fs.rm(this.file, { force: true });
  }
}

/** Only what the app shows; the full Better Auth user stays server-side. */
function pickUser(user) {
  return {
    id: user.id,
    name: user.name ?? '',
    email: user.email,
    image: user.image ?? null,
  };
}

/**
 * When a JWT expires, from its own exp claim. Not verified: the backend does
 * that; this only decides when to ask for a new one.
 */
function jwtExpiry(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return payload.exp * 1000;
  } catch {
    return 0;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
