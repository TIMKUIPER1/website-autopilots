export const FOUNDATION_MIGRATION = "20260803090000_os_foundation.sql";

export const REQUIRED_SCHEMAS = Object.freeze([
  "core",
  "iam",
  "integration",
  "workflow",
  "ledger",
  "audit"
]);

export const REQUIRED_TABLES = Object.freeze([
  "core.legal_entities",
  "core.brands",
  "core.environments",
  "iam.profiles",
  "iam.memberships",
  "integration.connector_definitions",
  "integration.connections",
  "integration.discovered_resources",
  "integration.resource_mappings",
  "integration.sync_runs",
  "integration.health_events",
  "integration.incidents",
  "workflow.commands",
  "workflow.approvals",
  "workflow.tasks",
  "ledger.usage_entries",
  "audit.events"
]);

export const REQUIRED_BRANDS = Object.freeze([
  "autopilots",
  "autoreviews",
  "autoplanner",
  "roofplanner"
]);
