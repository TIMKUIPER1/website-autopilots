import test from "node:test";
import assert from "node:assert/strict";
import { assertTransition, canTransition } from "../src/domain/lifecycle.js";

test("geldige overgang wordt toegestaan", () => assert.equal(canTransition("integration_setup", "ready_to_build"), true));
test("productie kan niet vanuit onboarding worden bereikt", () => assert.equal(canTransition("onboarding", "live"), false));
test("onbekende en ongeldige overgangen worden geblokkeerd", () => assert.throws(() => assertTransition("onboarding", "live"), /Ongeldige statusovergang/));
