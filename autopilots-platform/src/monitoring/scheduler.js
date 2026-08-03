export class MonitoringScheduler {
  constructor({ enabled, intervalMs, authorityProfileId, brandSlugs, repository, probe, runImmediately = false, clock = () => new Date() }) {
    this.enabled = enabled === true;
    this.intervalMs = intervalMs;
    this.authorityProfileId = authorityProfileId;
    this.brandSlugs = [...new Set(brandSlugs || [])];
    this.repository = repository;
    this.probe = probe;
    this.runImmediately = runImmediately === true;
    this.clock = clock;
    this.timer = null;
    this.running = false;
    this.lastStartedAt = null;
    this.lastCompletedAt = null;
    this.nextRunAt = null;
    this.lastOutcome = this.enabled ? "not_started" : "disabled";
    this.lastCounts = { healthy: 0, degraded: 0, unavailable: 0, failed: 0 };
    if (this.enabled && (!this.repository || typeof this.probe !== "function" || !this.brandSlugs.length)) {
      throw new Error("Monitoring scheduler dependencies missing");
    }
  }

  start() {
    if (!this.enabled || this.timer) return this.status();
    this.nextRunAt = new Date(this.clock().getTime() + this.intervalMs).toISOString();
    this.timer = setInterval(() => void this.runOnce(), this.intervalMs);
    this.timer.unref?.();
    if (this.runImmediately) void this.runOnce();
    return this.status();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.nextRunAt = null;
  }

  async runOnce(now = this.clock()) {
    if (!this.enabled) return { skipped: true, reason: "disabled" };
    if (this.running) return { skipped: true, reason: "overlap_blocked" };
    this.running = true;
    this.lastStartedAt = now.toISOString();
    this.nextRunAt = new Date(now.getTime() + this.intervalMs).toISOString();
    const bucket = Math.floor(now.getTime() / this.intervalMs);
    try {
      const settled = await Promise.allSettled(this.brandSlugs.map(async (slug) => {
        const health = await this.probe(slug);
        const evidence = await this.repository.recordProductHealth(
          this.authorityProfileId,
          health,
          `scheduled_${bucket}_${slug}`
        );
        return { slug, status: health.status, replayed: evidence.replayed === true };
      }));
      const counts = { healthy: 0, degraded: 0, unavailable: 0, failed: 0 };
      const results = settled.map((item, index) => {
        if (item.status === "rejected") {
          counts.failed += 1;
          return { slug: this.brandSlugs[index], status: "failed", errorCode: "MONITORING_CAPTURE_FAILED" };
        }
        counts[item.value.status] = (counts[item.value.status] || 0) + 1;
        return item.value;
      });
      this.lastCounts = counts;
      this.lastOutcome = counts.failed ? "partial" : "succeeded";
      return { skipped: false, outcome: this.lastOutcome, counts, results };
    } finally {
      this.running = false;
      this.lastCompletedAt = this.clock().toISOString();
    }
  }

  status() {
    return {
      enabled: this.enabled,
      running: this.running,
      intervalSeconds: Math.floor(this.intervalMs / 1000),
      lastStartedAt: this.lastStartedAt,
      lastCompletedAt: this.lastCompletedAt,
      nextRunAt: this.nextRunAt,
      lastOutcome: this.lastOutcome,
      counts: { ...this.lastCounts },
      externalWrites: false
    };
  }
}
