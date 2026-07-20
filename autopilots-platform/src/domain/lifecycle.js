export const IMPLEMENTATION_STATES = Object.freeze([
  "lead", "consult_scheduled", "consult_recorded", "transcript_ready",
  "requirements_draft", "customer_validation", "demo_ready", "proposal_sent",
  "contract_pending", "payment_pending", "onboarding", "integration_setup",
  "ready_to_build", "building", "automated_testing", "human_review", "staging",
  "customer_acceptance", "production_approval", "deploying", "live", "monitoring",
  "optimizing", "blocked", "failed", "cancelled", "paused", "incident",
  "rollback_in_progress"
]);

const transitions = {
  lead: ["consult_scheduled", "cancelled"],
  consult_scheduled: ["consult_recorded", "cancelled", "paused"],
  consult_recorded: ["transcript_ready", "blocked"],
  transcript_ready: ["requirements_draft", "blocked"],
  requirements_draft: ["customer_validation", "blocked"],
  customer_validation: ["demo_ready", "requirements_draft", "blocked"],
  demo_ready: ["proposal_sent", "customer_validation", "cancelled"],
  proposal_sent: ["contract_pending", "cancelled", "paused"],
  contract_pending: ["payment_pending", "blocked", "cancelled"],
  payment_pending: ["onboarding", "blocked", "cancelled"],
  onboarding: ["integration_setup", "blocked", "paused"],
  integration_setup: ["ready_to_build", "blocked", "paused"],
  ready_to_build: ["building", "blocked"],
  building: ["automated_testing", "failed", "blocked"],
  automated_testing: ["human_review", "building", "failed"],
  human_review: ["staging", "building", "blocked"],
  staging: ["customer_acceptance", "rollback_in_progress", "failed"],
  customer_acceptance: ["production_approval", "building", "blocked"],
  production_approval: ["deploying", "blocked"],
  deploying: ["live", "rollback_in_progress", "failed"],
  live: ["monitoring", "incident", "rollback_in_progress"],
  monitoring: ["optimizing", "incident", "paused"],
  optimizing: ["building", "monitoring"],
  blocked: ["paused", "cancelled"],
  paused: ["blocked", "cancelled"],
  failed: ["building", "rollback_in_progress", "cancelled"],
  incident: ["monitoring", "rollback_in_progress"],
  rollback_in_progress: ["staging", "monitoring", "failed"],
  cancelled: []
};

export function canTransition(from, to) {
  return Boolean(transitions[from]?.includes(to));
}

export function assertTransition(from, to) {
  if (!IMPLEMENTATION_STATES.includes(from) || !IMPLEMENTATION_STATES.includes(to)) {
    throw new Error("Onbekende implementatiestatus.");
  }
  if (!canTransition(from, to)) {
    throw new Error(`Ongeldige statusovergang: ${from} → ${to}`);
  }
}

export function allowedTransitions(from) {
  return [...(transitions[from] || [])];
}
