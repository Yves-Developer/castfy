import assert from "node:assert/strict";
import { test } from "node:test";
import { assertPublicUrl } from "./url-guard.js";

test("rejects non-http(s) schemes", async () => {
  await assert.rejects(() => assertPublicUrl("file:///etc/passwd"));
  await assert.rejects(() => assertPublicUrl("ftp://example.com"));
});

test("rejects an invalid URL", async () => {
  await assert.rejects(() => assertPublicUrl("not a url"));
});

test("rejects loopback and metadata addresses", async () => {
  await assert.rejects(() => assertPublicUrl("http://127.0.0.1"));
  await assert.rejects(() => assertPublicUrl("http://127.0.0.1:8080/admin"));
  await assert.rejects(() =>
    assertPublicUrl("http://169.254.169.254/latest/meta-data")
  );
  await assert.rejects(() => assertPublicUrl("http://[::1]/"));
});

test("rejects private IPv4 ranges", async () => {
  await assert.rejects(() => assertPublicUrl("http://10.0.0.5"));
  await assert.rejects(() => assertPublicUrl("http://192.168.1.1"));
  await assert.rejects(() => assertPublicUrl("http://172.16.0.1"));
});

test("allows a public IP literal", async () => {
  await assert.doesNotReject(() => assertPublicUrl("http://8.8.8.8/"));
});
