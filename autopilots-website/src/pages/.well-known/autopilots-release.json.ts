export const prerender = true;

export function GET() {
  return new Response(
    JSON.stringify(
      {
        commit:
          process.env.AUTOPILOTS_RELEASE_SHA ??
          process.env.COMMIT_REF ??
          "unknown",
        deployId:
          process.env.AUTOPILOTS_RELEASE_RUN_ID ??
          process.env.DEPLOY_ID ??
          "local",
        environment: process.env.CONTEXT ?? "local",
        builtAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
