export type RoiPackageKey = "inbox" | "telefoniste" | "leadopvolger" | "complete";

export interface RoiInput {
  packageKey: RoiPackageKey;
  volume: number;
  issuePercent: number;
  peakPercent: number;
  appointmentPercent: number;
  closePercent: number;
  valuePerCustomer: number;
}

export interface RoiResult {
  handledWithoutAi: number;
  handledWithAi: number;
  extraHandled: number;
  extraAppointments: number;
  extraCustomers: number;
  indicativeValue: number;
}

const packagePerformance: Record<RoiPackageKey, { coverage: number; aiReachRate: number; usesPeak: boolean }> = {
  inbox: { coverage: 0.55, aiReachRate: 0.86, usesPeak: false },
  telefoniste: { coverage: 0.62, aiReachRate: 0.90, usesPeak: true },
  leadopvolger: { coverage: 0.80, aiReachRate: 0.93, usesPeak: false },
  complete: { coverage: 1, aiReachRate: 0.98, usesPeak: true }
};

const manualReachRate = 0.35;
const safe = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
const percent = (value: number) => Math.min(safe(value), 100) / 100;

export function calculateRoi(input: RoiInput): RoiResult {
  const selected = packagePerformance[input.packageKey] ?? packagePerformance.inbox;
  const issueRate = selected.usesPeak
    ? Math.min(percent(input.issuePercent) + percent(input.peakPercent), 1)
    : percent(input.issuePercent);
  const coveredPool = safe(input.volume) * issueRate * selected.coverage;
  const handledWithoutAi = coveredPool * manualReachRate;
  const handledWithAi = coveredPool * selected.aiReachRate;
  const extraHandled = Math.max(0, handledWithAi - handledWithoutAi);
  const extraAppointments = extraHandled * percent(input.appointmentPercent);
  const extraCustomers = extraAppointments * percent(input.closePercent);
  return {
    handledWithoutAi,
    handledWithAi,
    extraHandled,
    extraAppointments,
    extraCustomers,
    indicativeValue: extraCustomers * safe(input.valuePerCustomer)
  };
}
