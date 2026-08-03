import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const sql = await fs.readFile(new URL("../supabase/migrations/20260804013000_retire_monitoring_v1_rpcs.sql", import.meta.url), "utf8");

test("all superseded monitoring v1 RPC grants are revoked from the server role", () => {
  for (const signature of [
    "autopilots_claim_monitoring_run\\(uuid, text, bigint, uuid, integer, integer\\)",
    "autopilots_heartbeat_monitoring_run\\(uuid, uuid, integer\\)",
    "autopilots_complete_monitoring_run\\(uuid, uuid, text, jsonb, text\\)",
    "autopilots_monitoring_freshness\\(uuid, integer\\)"
  ]) {
    assert.match(sql, new RegExp(`revoke execute on function public\\.${signature} from service_role`, "i"));
  }
  assert.doesNotMatch(sql, /drop\s+function|delete\s+from|truncate/i);
});
