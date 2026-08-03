import crypto from "node:crypto";

export class MonitoringScheduler {
  constructor({ enabled, intervalMs, leaseSeconds = 120, staleAfterSeconds = 900, authorityProfileId, brandSlugs, repository, probe, runImmediately = false, clock = () => new Date(), instanceId = crypto.randomUUID() }) {
    this.enabled = enabled === true;
    this.intervalMs = intervalMs;
    this.leaseSeconds = leaseSeconds;
    this.staleAfterSeconds = staleAfterSeconds;
    this.authorityProfileId = authorityProfileId;
    this.instanceId = instanceId;
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
    this.lastLease = null;
    this.freshness = null;
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
    let activeRun = null;
    let completed = false;
    try {
      const lease = await this.repository.claimMonitoringRun(this.authorityProfileId, {
        leaseKey: "product_health_portfolio",
        bucket,
        holderId: this.instanceId,
        intervalSeconds: Math.floor(this.intervalMs / 1000),
        leaseSeconds: this.leaseSeconds
      });
      activeRun = lease.claimed ? lease : null;
      this.lastLease = { runId: lease.runId, bucket, reason: lease.reason, attemptCount: lease.attemptCount };
      if (!lease.claimed) {
        this.lastOutcome = "skipped";
        try {
          this.freshness = await this.repository.monitoringFreshness(this.authorityProfileId, this.staleAfterSeconds);
        } catch {
          this.freshness = { contract: "autopilots.monitoring-freshness.v1", status: "unavailable", brands: [], externalWrites: false };
        }
        return { skipped: true, reason: lease.reason, runId: lease.runId, bucket };
      }
      if (!await this.repository.heartbeatMonitoringRun(lease.runId, this.instanceId, this.leaseSeconds)) {
        throw new Error("MONITORING_LEASE_LOST");
      }
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
      if (!await this.repository.heartbeatMonitoringRun(lease.runId, this.instanceId, this.leaseSeconds)) {
        throw new Error("MONITORING_LEASE_LOST");
      }
      await this.repository.completeMonitoringRun(lease.runId, this.instanceId, this.lastOutcome, counts);
      completed = true;
      try {
        this.freshness = await this.repository.monitoringFreshness(this.authorityProfileId, this.staleAfterSeconds);
      } catch {
        this.freshness = { contract: "autopilots.monitoring-freshness.v1", status: "unavailable", brands: [], externalWrites: false };
      }
      return { skipped: false, runId: lease.runId, bucket, outcome: this.lastOutcome, counts, results };
    } catch {
      this.lastOutcome = "failed";
      this.lastCounts = { healthy: 0, degraded: 0, unavailable: 0, failed: this.brandSlugs.length };
      if (activeRun && !completed) {
        try {
          await this.repository.completeMonitoringRun(
            activeRun.runId,
            this.instanceId,
            "failed",
            this.lastCounts,
            "MONITORING_RUN_FAILED"
          );
        } catch {
          // The expired holder cannot close a run it no longer owns.
        }
      }
      return {
        skipped: false,
        outcome: "failed",
        counts: { ...this.lastCounts },
        results: this.brandSlugs.map((slug) => ({ slug, status: "failed", errorCode: "MONITORING_RUN_FAILED" }))
      };
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
      durableLease: this.lastLease ? { ...this.lastLease } : null,
      freshness: this.freshness,
      externalWrites: false
    };
  }
}
