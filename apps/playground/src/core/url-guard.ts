import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// CIDR ranges that must never be reachable from a user-supplied demo URL.
// Blocking these prevents SSRF against loopback, private networks, and the
// cloud metadata endpoint (169.254.169.254).
const BLOCKED_IPV4_RANGES: Array<readonly [string, number]> = [
  ["0.0.0.0", 8], // "this" network
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local (incl. cloud metadata)
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // TEST-NET-1
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // TEST-NET-2
  ["203.0.113.0", 24], // TEST-NET-3
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved
  ["255.255.255.255", 32], // broadcast
];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }
  let value = 0;
  for (const part of parts) {
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
      return null;
    }
    value = (value << 8) | octet;
  }
  return value >>> 0;
}

function isBlockedIpv4(ip: string): boolean {
  const value = ipv4ToInt(ip);
  if (value === null) {
    return true; // fail closed on anything we cannot parse
  }
  for (const [range, bits] of BLOCKED_IPV4_RANGES) {
    const rangeInt = ipv4ToInt(range);
    if (rangeInt === null) {
      continue;
    }
    const mask = bits === 0 ? 0 : (0xff_ff_ff_ff << (32 - bits)) >>> 0;
    if ((value & mask) === (rangeInt & mask)) {
      return true;
    }
  }
  return false;
}

function isBlockedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase().split("%")[0]; // strip zone id
  if (normalized === "::1" || normalized === "::") {
    return true; // loopback / unspecified
  }

  // IPv4-mapped addresses (::ffff:a.b.c.d) — validate the embedded IPv4.
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) {
    return isBlockedIpv4(mapped[1]);
  }

  const firstHextet = normalized.split(":")[0] || "0";
  const firstWord = Number.parseInt(firstHextet.padStart(4, "0"), 16);
  if (Number.isNaN(firstWord)) {
    return true; // fail closed
  }
  if (firstWord >>> 9 === 0x7e) {
    return true; // fc00::/7 unique-local
  }
  if (firstWord >>> 6 === 0x3fa) {
    return true; // fe80::/10 link-local
  }
  if (firstWord >>> 8 === 0xff) {
    return true; // ff00::/8 multicast
  }
  return false;
}

function isBlockedAddress(address: string): boolean {
  return isIP(address) === 6
    ? isBlockedIpv6(address)
    : isBlockedIpv4(address);
}

/**
 * Reject a user-supplied URL that is not safe to drive a headless browser to:
 * non-http(s) schemes, and any host that resolves to a private, loopback,
 * link-local, or otherwise reserved address (SSRF protection). Fails closed.
 */
export async function assertPublicUrl(rawUrl: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, ""); // strip IPv6 brackets

  let addresses: string[];
  if (isIP(hostname)) {
    addresses = [hostname];
  } else {
    try {
      const results = await lookup(hostname, { all: true });
      addresses = results.map((entry) => entry.address);
    } catch {
      throw new Error(`Could not resolve host: ${hostname}`);
    }
    if (addresses.length === 0) {
      throw new Error(`Could not resolve host: ${hostname}`);
    }
  }

  for (const address of addresses) {
    if (isBlockedAddress(address)) {
      throw new Error(
        `URL host resolves to a blocked (private/internal) address: ${address}`
      );
    }
  }
}
