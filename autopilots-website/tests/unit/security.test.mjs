import test from "node:test";
import assert from "node:assert/strict";
import {
  clean,
  digest,
  hmac,
  normalizePhone,
  safeEqualHex,
  validEmail,
  verifyStripeSignature,
} from "../../netlify/functions/_shared/security.mjs";

test("normaliseert en valideert formulierdata", () => {
  assert.equal(clean("  Tim\u0000 Kuiper  ", 50), "Tim  Kuiper");
  assert.equal(normalizePhone("+31 (0)6 12-34-56-78"), "+310612345678");
  assert.equal(validEmail("tim@example.com"), true);
  assert.equal(validEmail("geen-email"), false);
  assert.equal(digest("x").length, 64);
});

test("verifieert HMAC en Stripe timestamp", () => {
  const secret = "whsec_test";
  const raw = '{"id":"evt_1"}';
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = hmac(secret, `${timestamp}.${raw}`);
  assert.equal(safeEqualHex(signature, signature), true);
  assert.equal(
    verifyStripeSignature(raw, `t=${timestamp},v1=${signature}`, secret),
    true,
  );
  assert.equal(
    verifyStripeSignature(raw, `t=${timestamp},v1=${"0".repeat(64)}`, secret),
    false,
  );
});
