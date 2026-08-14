# Deploying the playground worker

Target: one DigitalOcean Droplet, **Basic 4 GiB / 2 vCPU / 80 GB**, running the
worker and Caddy under Docker Compose.

The worker takes no inbound API traffic — jobs arrive over an outbound Convex
subscription. The only reason it is reachable from the internet at all is to
serve rendered videos from `/output`. Once artifacts move to object storage,
this box needs no public ingress whatsoever.

---

## 0. Before you touch the droplet

Four things will block you at the end if you skip them now.

| Prerequisite | Why |
|---|---|
| **Anthropic credits** | An empty balance fails every job with a 400 at the first model call. Check the balance before deploying, not after. |
| **A Convex Cloud deployment** | The local anonymous deployment (`127.0.0.1:3210`) is unreachable from a droplet. Run `npx convex login` then `npx convex deploy` in `packages/backend`. |
| **A domain + DNS A record** | The dashboard is HTTPS, so artifact URLs must be HTTPS or browsers block every video as mixed content. Point e.g. `media.yourdomain.com` at the droplet's IP **before** starting Caddy — it needs to answer an ACME challenge on port 80. |
| **Repo access from the droplet** | The image is 3.99 GB, so it is built on the box rather than pushed through a registry. A read-only deploy key is the tidy way in. |

Also set the worker secret on the Convex deployment — the same value that goes
in `.env` below:

```sh
cd packages/backend
npx convex env set PLAYGROUND_WORKER_SECRET "$(openssl rand -hex 24)" --prod
```

---

## 1. Provision

Create the droplet: **Ubuntu 24.04 LTS**, Basic / Regular SSD, 4 GB / 2 vCPU,
SSH key auth. Then, as root:

```sh
# Firewall. Nothing but SSH and HTTP(S) is ever needed from outside.
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

> **Docker publishes ports past `ufw`.** Rules on published container ports are
> not enforced the way you'd expect, because Docker writes its own iptables
> chains. This stack sidesteps the problem rather than fighting it: the worker
> uses `expose` (compose-network only), so port 3001 is never published. Only
> Caddy publishes anything, and only 80/443.

**Add swap before building.** A 4 GB box building a 4 GB image with pnpm can
run out of memory mid-install, and the failure looks like an unexplained
killed process:

```sh
fallocate -l 4G /swapfile && chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 2. Docker

```sh
curl -fsSL https://get.docker.com | sh
docker compose version   # expect v2.x — the build secret syntax needs it
```

---

## 3. Code and configuration

```sh
git clone <your-repo-url> /srv/castfy
cd /srv/castfy/apps/playground/deploy
cp env.example .env
```

Edit `.env` — every value is documented in place. The four that matter most:

- `CONVEX_URL` — the **production** deployment, not the local one
- `PLAYGROUND_WORKER_SECRET` — must match what you set on Convex above
- `BASE_URL` — `https://media.yourdomain.com`, matching the Caddyfile
- `ALLOWED_ORIGINS` — your dashboard's origin

Then set the hostname in `Caddyfile` (replace `media.example.com` in both the
site block and your DNS).

---

## 4. Build and start

`NODE_AUTH_TOKEN` is read from the shell, not from `.env` — it is a build
secret and must never reach a layer:

```sh
export NODE_AUTH_TOKEN=<github-packages-token>
docker compose up -d --build
```

First build pulls the ~900 MB Playwright base and installs the workspace;
expect several minutes. Caddy will obtain a certificate on first start,
which requires DNS to already resolve.

---

## 5. Verify

```sh
# Health, through Caddy and TLS
curl https://media.yourdomain.com/ping

# Worker connected to Convex?
docker compose logs worker | tail -20
#   → "[worker] <id> started; concurrency 2"
```

Then enqueue a job whose URL is loopback (`http://127.0.0.1/`). The SSRF guard
rejects it in the worker before any browser starts, so it exercises the whole
path — claim, run, fail, event — for free. It should reach `failed` in under a
second with a "blocked (private/internal) address" error.

Confirm no direct exposure:

```sh
curl --max-time 5 http://<droplet-ip>:3001/ping   # must fail
```

---

## 6. Day-two operations

**Update:**

```sh
cd /srv/castfy && git pull
cd apps/playground/deploy
export NODE_AUTH_TOKEN=...
docker compose up -d --build
```

> **Do not redeploy during a recording.** A restarted worker loses its lease,
> the reaper requeues the job, and the agent loop is re-billed from scratch.
> Check `docker compose logs worker | tail` for in-flight jobs, or watch the
> dashboard's Recordings page, and wait for idle. Compose's 90 s
> `stop_grace_period` lets the drain finish, but the drain aborts the run — it
> does not resume it.

**Logs:** `docker compose logs -f worker` (capped at 10 MB × 5 files).

**Disk:** rendered demos accumulate in the `output` volume at ~35 MB each — the
80 GB disk holds roughly 2,200. Watch with `docker system df -v`, and prune
build cache with `docker builder prune` when it grows.

**Backups:** enable droplet snapshots. The `output` volume is the only
irreplaceable state on the box until artifacts move to object storage.

---

## Known gaps at time of writing

- **`enqueue` is unauthenticated.** The Convex deployment URL ships in the
  dashboard's client bundle, so anyone who reads it can queue jobs and spend
  your Anthropic credits. The only brake is a 25-job queue-depth cap in
  `packages/backend/convex/jobs.ts`. Close this before the dashboard is
  publicly reachable.
- **Artifacts are local.** This box is the only place a rendered video exists,
  so it cannot be scaled past one instance and the videos die with the droplet.
- **No metrics or alerting.** Queue depth, token spend, and failure rate are
  all invisible until Phase 3.
