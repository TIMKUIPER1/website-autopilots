const customerActions = new Set([
  "requirement.confirm",
  "onboarding.toggle",
  "legal.accept",
  "payment.complete",
  "dataroom.field",
  "dataroom.document",
  "dataroom.secret",
  "product.select",
  "integration.connect",
  "integration.test"
]);

const internalActions = new Set([
  "integration.connect",
  "integration.test",
  "task.resolve",
  "agent.toggle",
  "agent.kill",
  "lifecycle.advance",
  "approval.decide",
  "demo.reset"
]);

export const actionPolicy = Object.freeze({
  "requirement.confirm": { risk: "R1", reversible: true },
  "onboarding.toggle": { risk: "R1", reversible: true },
  "legal.accept": { risk: "R3", reversible: true },
  "payment.complete": { risk: "R3", reversible: false },
  "dataroom.field": { risk: "R1", reversible: true },
  "dataroom.document": { risk: "R1", reversible: true },
  "dataroom.secret": { risk: "R3", reversible: true },
  "product.select": { risk: "R1", reversible: true },
  "integration.connect": { risk: "R2", reversible: true },
  "integration.test": { risk: "R0", reversible: true },
  "task.resolve": { risk: "R1", reversible: true },
  "agent.toggle": { risk: "R1", reversible: true },
  "agent.kill": { risk: "R2", reversible: false },
  "lifecycle.advance": { risk: "R1", reversible: true },
  "approval.decide": { risk: "R3", reversible: false },
  "demo.reset": { risk: "R2", reversible: false }
});

export function canExecute(role, action) {
  if (!actionPolicy[action]) return false;
  return role === "internal" ? internalActions.has(action) : role === "customer" && customerActions.has(action);
}

export function assertCommandAuthorized(context, action) {
  if (!context?.organizationId) throw forbidden("Organisatiescope ontbreekt");
  if (!canExecute(context.role, action)) throw forbidden("Actie niet toegestaan voor deze rol");
}

export function routeAllowed(role, pathname) {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/control-center")) return role === "internal";
  return role === "customer" || role === "internal";
}

function forbidden(message) {
  const error = new Error(message);
  error.status = 403;
  return error;
}
