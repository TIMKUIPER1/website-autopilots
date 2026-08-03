export const AUTOPILOTS_SUPABASE_PROJECT_REF = "wurycoodzcybaxcgqxps";

export function assertAutopilotsMigrationTarget(databaseUrl) {
  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL is geen geldige PostgreSQL-URL.");
  }
  if (!new Set(["postgres:", "postgresql:"]).has(parsed.protocol)) {
    throw new Error("DATABASE_URL gebruikt geen PostgreSQL-protocol.");
  }

  const hostRef = parsed.hostname.match(/^db\.([a-z0-9]{20})\.supabase\.co$/i)?.[1]?.toLowerCase();
  const userRef = decodeURIComponent(parsed.username).match(/^postgres\.([a-z0-9]{20})$/i)?.[1]?.toLowerCase();
  const discovered = [...new Set([hostRef, userRef].filter(Boolean))];
  if (discovered.length !== 1) {
    throw new Error("Het Supabase-project kon niet eenduidig uit DATABASE_URL worden vastgesteld.");
  }
  if (discovered[0] !== AUTOPILOTS_SUPABASE_PROJECT_REF) {
    throw new Error(`Migraties zijn alleen toegestaan voor Autopilots-project ${AUTOPILOTS_SUPABASE_PROJECT_REF}.`);
  }
  return Object.freeze({ projectRef: discovered[0], protocol: parsed.protocol });
}
