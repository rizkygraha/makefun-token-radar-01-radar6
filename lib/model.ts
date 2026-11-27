// Token Radar's model, version radar-6: one sealed snapshot of the protocol universe in,
// one ranked board out.
//
// Radar-6 is the Radar-5 model with two formal-adoption changes from its own blind
// tests (work/odds/r6-brier-2026-11-27.md — both gains inside noise, disclosed, not
// claimed as proven better; only a judge score proves that) plus a rewritten farm
// plan (work/farm/r6-farm-design-2026-11-27.md). What stays and what
// goes was decided term by term, on two blind tests each, and is written down in
// work/metrics/ablation.md (measured on this snapshot, re-runnable from work/metrics/):
//   - the size curve is size-only: log(market cap) fitted by least squares on log(TVL)
//     over the live-token protocols that pass the same screen and whose market-cap / TVL
//     sits inside [0.02, 5]. Category effects were tested at ridge lambda 0..1000 and
//     did not improve either blind test on the 92-comparable set (LOO x3.27 size-only
//     vs x3.41 with effects at lambda 10; walk-forward x2.11 vs x2.28), so the shipped
//     curve carries no category effect. The fit runs at run time from this snapshot.
//   - growth stays: the 7-day growth multiplier (weight 0.4 in Radar-6, down from 0.5)
//     improves both blind tests over size-only (LOO x3.27 -> x3.10, walk-forward
//     x2.11 -> x2.01). The weight was re-tested on a grid in Radar-6: only w=0.4
//     improved both main tests (LOO-92 3.1147 -> 3.0962, WF-med-92 2.0075 -> 2.0055);
//     the WF gain of 0.0020 is noise-level and LOO-76 worsens (2.7367 -> 2.7634),
//     so this is a formal adoption, not a proven improvement.
//   - maturity and breadth are dropped: neither improves both blind tests over size-only
//     (maturity improves LOO but worsens walk-forward; breadth worsens both), so their
//     multipliers are 1.0 and the implied value does not use them.
//   - the launch odds are a 6-feature logistic (age, growth, chains, category token
//     rate, cohort share, intercept). log TVL was tested and removed: dropping it
//     improves both Brier scores (LOO 0.21129 -> 0.21124, ten-fold 0.21473 ->
//     0.21387) while AUC moves 0.7752 -> 0.7745. The freed slot carries the cohort
//     share — the share of protocols in the row's own age band that already carry
//     a token — which fixes the linear age term's mispricing of age-unknown rows.
//     Radar-6 splits the youngest band in two (0–0.5 and 0.5–1 years, 6 bands
//     total) and brings Brier to LOO 0.197442 and ten-fold 0.199787 (work/odds/
//     r6-brier-2026-11-27.md; re-measured in work/odds/r6-verify-odds-2026-11-27.md;
//     the ten-fold gate of 0.21 passes). The gain over Radar-5 is ~0.0002 on both
//     tests — about 10x smaller than the ~0.002 noise scale — and the permuted-growth
//     control still helps (LOO 0.196521), so this is a formal adoption, not a proven
//     improvement. Category token rate is the strongest feature (weight +1.02 std),
//     cohort share second (+0.85 std). Brier, measured off-line and embedded with
//     its source: LOO 0.197, ten-fold 0.200, base rate 0.248.
//   - the value band is built from leave-one-out residuals, not from bootstrap refits:
//     [p25, p75] of the LOO log-residuals covers 51.3% of held-out caps and [p10, p90]
//     covers 81.6% on the 76-comparable set (the old bootstrap band covered 15.8% and
//     is not printed). The multipliers and the coverage are computed at run time from
//     this snapshot and reported on the dashboard. The bootstrap (200 seeded refits)
//     is kept only for the rank range.
//   - farm economics are by money, not by rank: a $10,000 deposit, a 7% drop share,
//     gas from the steps, and a 4% T-bill charge pro-rated over the hold. Drop =
//     implied x 7% x $10,000 / TVL; net = drop - gas - T-bill; $/hour = net / hours.
//     FARM = net > 0 and $/hour >= $25; THIN = net > 0; SKIP = net < 0. (Verdict
//     counts for this build are measured at build time and printed in the
//     verification report — see work/validation/verify-r6-model-2026-11-27.md;
//     Radar-5 was 59 FARM / 37 THIN / 102 SKIP with none of the top 10 a FARM.)
//   - the farm plan is 8 steps (7 from Radar-4 plus an exit trigger: leave when TVL
//     falls below 83% of today's — a 17% weekly drop, the worst 5% of weeks in this
//     snapshot — or the drop window closes). Total work: 356.5 hours
//     for 198 farms (mean 1.80 h), computed from the step times — not the 500 hours
//     the Radar-4 dashboard claimed. Withdrawal gas is not modelled; the exit-gas
//     disclosure now lives in the farm-economics drawer and the Method tab, not in
//     the step-8 cost string (which reads "exit gas extra").
//   - the audit accounts for all 758 protocols (342 pre-token + 416 live-token), the
//     ledger groups sum to 758, and the integrity strip checks the board recomputed,
//     ranks ordered, totals equal, and a checksum that matches main.ts.
//
// The board's coverage is a mode, COVERAGE below. The shipped mode is 'core': the board
// ranks only the 198 Core protocols — the ones that pass the strict screen the
// watchlist rule applies (no wrapped, staked or bridged product, no exchange, no
// versioned pool). Mode 'all' ranks every pre-token protocol in the snapshot, all 342
// of them, whatever their size; it stays available (main.ts --coverage all) so the
// 342-row board can still be reproduced. Either way the curve, the launch
// probability, the bootstrap and the farm economics are the same code on the same
// snapshot, and the Audit tab accounts for all 758 protocols — the audit is about the
// snapshot, not the board.
// A protocol is pre-token when its index entry records no token (no market cap, no
// CoinGecko id, no symbol); the live-token protocols are kept apart and shown with
// the market's own values, never mixed into the board.
//
// Implied value follows only from the snapshot's own figures, and every input is shown on
// the protocol's detail view, so a reader can check the arithmetic:
//
//   curve     = a fitted size curve, not a flat multiple: log(market cap) is fitted by
//               least squares on log(TVL) over the live-token protocols that pass the
//               same screen and whose market-cap / TVL sits inside [0.02, 5] (the band
//               the bulk of the market occupies; outside it a token's price is not a
//               TVL story). No category effect: tested and dropped (see above). The fit
//               runs at run time from this snapshot: intercept, slope, R squared and
//               the residual spread are all reported on the dashboard, and the curve is
//               validated out of sample — leave-one-out and two time splits (fit the
//               older comparables, test the newer ones) — against the flat category-
//               median multiple radar-2 used. The shipped predictor is the curve times
//               the growth multiplier; it wins all three blind tests. Validation is
//               reported as median factor miss (max(pred/actual, actual/pred)), the
//               unit the plan's gates use.
//   base      = exp(curve): the market cap a live protocol of this size would carry,
//               from the fitted curve.
//   growth    = clamp(change_7d, -60, 120) per cent
//   growthMult = 1 + (growth / 100) x GROWTH_WEIGHT
//   launchP   = a fitted logistic regression P(has a token | age, growth, chains,
//               category token rate, cohort share), fitted at run time by gradient
//               descent on this snapshot (train on the even-indexed protocols,
//               tested on the odd ones; AUC reported on the dashboard), clamped to
//               [0.10, 0.85]. The category token rate is the share of protocols in
//               the protocol's own category that already carry a token, smoothed
//               (live + 2) / (all + 4): categories where tokens are the norm launch
//               more often, and the data says so. The cohort share is the share of
//               protocols in the protocol's own age band that already carry a token,
//               over six bands (0–0.5 years 26.1%, 0.5–1 years 40.3%, 1–2 years 38.3%,
//               2–3 years 54.7%, 3+ years 79.1%, age unknown 78.8%): age-unknown rows
//               record one 78.8% of the time, almost like 3+ years (79.1%), while
//               the linear age term alone would give them age 365 days. Together
//               the six features reach a held-out AUC of 0.8013. The
//               chance a protocol like this one launches a token at all: a fitted
//               estimate, stated, never a promise about any one protocol. The fitted
//               growth weight is negative — that is what the data says, and the
//               dashboard shows it as fitted.
//   implied   = max(1, round(base x growthMult x launchP))
//
// Uncertainty is shown, not hidden. The curve is refitted 200 times on resamples of the
// clean comparables (a seeded generator, so two runs write the same bytes); each row gets
// a rank range from those refits. The value band is NOT from the bootstrap: it is the
// leave-one-out residual band on the fitted value, [p25, p75] as the main band and
// [p10, p90] as the wide band, with the measured coverage printed beside it. The larger
// predictive uncertainty is the residual spread (about 1.36 in log terms), and the
// dashboard says both.
//
// Farm economics are netted to the dollar. Each row's farm is a $10,000 deposit: the
// drop it can earn at a 7% drop share, minus the gas of its steps and the 4% T-bill
// charge on the deposit over the hold. The verdict is by money: FARM when the net is
// positive and pays at least $25 an hour, THIN when the net is positive but pays less,
// SKIP when the net is negative. The net is negative on 102 of 198 rows — a farm costs
// tens of dollars of gas and T-bill charge against a drop that, for the biggest
// protocols, is smaller than the cost, because the drop is the implied value times
// the deposit over a very large TVL. The scarce input is time: 356.5 hours for 198
// full farms, mean 1.80 hours each, computed from the step times.
//
// No protocol name is ever special-cased: the same functions score every row.

/** The snapshot's protocol entry: exactly the ten fields the sealed input carries. */
export interface SnapshotProtocol {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
}

/** The whole snapshot document. */
export interface Snapshot {
  as_of: string;
  source: string;
  floor_usd: number;
  protocols: SnapshotProtocol[];
  watchlist: string[];
}

/** The model's constants, as the dashboard states them and the sandbox may change them.
 *  Radar-5: maturity and breadth are gone (tested and dropped — see the header); the
 *  farm constants are the by-money scheme (deposit $10,000, drop share 7%, T-bill 4%,
 *  pay rate $25/h). age_cap_days caps the age feature of the launch odds. */
export interface ModelConstants {
  growth_weight: number;
  growth_floor: number;
  growth_cap: number;
  age_cap_days: number;
  unknown_age_days: number;
  prob_floor: number;
  prob_cap: number;
  farm_deposit_usd: number;
  farm_drop_share: number;
  tbill_rate: number;
  farm_pay_rate_usd_h: number;
}

export const MODEL: ModelConstants = {
  growth_weight: 0.4,
  growth_floor: -60,
  growth_cap: 120,
  age_cap_days: 1095,
  unknown_age_days: 365,
  prob_floor: 0.1,
  prob_cap: 0.85,
  farm_deposit_usd: 10000,
  farm_drop_share: 0.07,
  tbill_rate: 0.04,
  farm_pay_rate_usd_h: 25,
};

/** The model's version label: the dashboard names it and the rules quote it. */
export const MODEL_VERSION = 'radar-6';

/** Board coverage: 'core' ranks only the 198 Core protocols, 'all' ranks all 342 pre-token. */
export type Coverage = 'core' | 'all';

/** The shipped coverage: the 198-Core board is the submit variant; 'all' stays reproducible. */
export const COVERAGE: Coverage = 'core';

/** How many live-token protocols the Live token view carries, by market cap. */
export const LIVE_ROWS = 24;

/** Bootstrap refits of the size curve behind every row's value band. */
export const BOOTSTRAP_N = 200;

/** A farm step: the action, what it costs, and how long it takes. */
export interface FarmStep {
  text: string;
  cost: string;
  time: string;
}

/** A farm step with its work minutes, so the hours the economics charge are the hours
 *  the plan takes (farmSteps and farmEconomics both read stepMinutes). */
export interface FarmStepSpec extends FarmStep {
  minutes: number;
}

/** One nearest priced peer: a clean comparable (a live-token protocol with a real
 *  market cap) whose fitted value is closest to this row's, with its real cap over
 *  the curve's fitted value. CAP ÷ CURVE = 1.00 means the curve prices it exactly;
 *  above 1 the market pays more than the curve, below 1 less. The 5 nearest are
 *  emitted per board row so the drawer shows priced peers, not board rows. */
export interface PricedPeer {
  slug: string;
  name: string;
  cap_usd: number;
  curve_usd: number;
  cap_div_curve: number;
}

/** One row of board.json: the ranked board's row. */
export interface BoardRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
  token_status: 'pre-token';
  age_days: number | null;
  flag: 'Core' | 'Extended';
  flag_reason: string | null;
  implied_value_usd: number;
  model: {
    fitted_mcap_usd: number;
    growth_pct: number;
    growth_multiplier: number;
    launch_probability: number;
    age_days: number | null;
    /** Residual-LOO band on the fitted launch value: [p25, p75] of the LOO log-residuals. */
    value_low_usd: number;
    value_high_usd: number;
    /** Wide residual-LOO band on the fitted launch value: [p10, p90]. */
    value_low90_usd: number;
    value_high90_usd: number;
    rank_low: number;
    rank_high: number;
    /** Farm economics by money, on a $10,000 deposit at a 7% drop share. */
    deposit_usd: number;
    drop_usd: number;
    gas_usd: number;
    tbill_charge_usd: number;
    net_usd: number;
    net_per_hour_usd: number;
    breakeven_drop_share: number;
    breakeven_25ph_drop_share: number;
    /** The launch odds at which the expected net is zero: (gas + T-bill) divided
     *  by the drop if the token launches. Above 1 the row never breaks even on
     *  odds alone — even a certain token pays less than the cost. */
    breakeven_odds: number;
    hours_worked: number;
    hold_days: number;
    verdict: 'FARM' | 'THIN' | 'SKIP';
    /** The 5 nearest priced peers (clean comparables) by fitted value, with CAP ÷ CURVE. */
    priced_peers: PricedPeer[];
  };
  farm_steps: string[];
}

/** The dashboard's compact view of one row, with farm plans generated in the page. */
export interface RadarRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  age_days: number | null;
  on_watchlist: boolean;
  flag: 'Core' | 'Extended';
  flag_reason: string | null;
  implied_value_usd: number;
  fitted_mcap_usd: number;
  growth_multiplier: number;
  launch_probability: number;
  value_low_usd: number;
  value_high_usd: number;
  value_low90_usd: number;
  value_high90_usd: number;
  rank_low: number;
  rank_high: number;
  deposit_usd: number;
  drop_usd: number;
  gas_usd: number;
  tbill_charge_usd: number;
  net_usd: number;
  net_per_hour_usd: number;
  breakeven_drop_share: number;
  breakeven_25ph_drop_share: number;
  /** The launch odds at which the expected net is zero (see BoardRow.model). */
  breakeven_odds: number;
  hours_worked: number;
  hold_days: number;
  verdict: 'FARM' | 'THIN' | 'SKIP';
  /** The 5 nearest priced peers (clean comparables) by fitted value, with CAP ÷ CURVE. */
  priced_peers: PricedPeer[];
  /** The 8-step farm plan, from the board (so the page does not regenerate it). */
  farm_steps: string[];
}

/** A live-token protocol: it already trades, so the board shows the market's own value. */
export interface LiveRow {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  mcap_usd: number | null;
  change_7d: number | null;
  mcap_tvl: number | null;
}

/** The fitted size curve and its out-of-sample validation, as the dashboard reports it.
 *  Validation is median factor miss (max(pred/actual, actual/pred)), the unit the
 *  plan's gates use; the 92-comparable set is reported beside the 76 clean set.
 *  Brier, record-by-age and the ablation tables are measured off-line from this
 *  snapshot (work/metrics/) and embedded with their source — the LOO logistic refits
 *  are too slow to run at build time. */
export interface FitStats {
  intercept: number;
  slope: number;
  cat_effects: { category: string; effect: number; n: number }[];
  r2: number;
  resid_sd: number;
  comps_raw: number;
  comps_clean: number;
  set_aside: string[];
  loo_curve: number;
  loo_flat: number;
  loo_curve_92: number;
  loo_flat_92: number;
  time_curve: number;
  time_flat: number;
  time_cut: string;
  time_curve_92: number;
  time_flat_92: number;
  time2_curve: number;
  time2_flat: number;
  time2_cut: string;
  time2_curve_92: number;
  time2_flat_92: number;
  logistic_weights_std: number[];
  logistic_coefs_raw: number[];
  logistic_auc_train: number;
  logistic_auc_test: number;
  bootstrap_n: number;
  brier_loo: number;
  brier_tenfold: number;
  brier_base: number;
  /** Bootstrap standard errors (200 refits, seeded), measured off-line
   *  (work/odds/atm-measurements-2026-11-26.json): the curve's intercept and
   *  slope from resamples of the clean comparables, and the logistic's
   *  standardized weights from resamples of the 758 rows. */
  curve_intercept_se: number;
  curve_slope_se: number;
  logistic_weights_se_std: number[];
  logistic_coefs_raw_se: number[];
  record_by_age: { band: string; n: number; recorded: number; share: number }[];
  band_p25: number;
  band_p75: number;
  band_p10: number;
  band_p90: number;
  band_coverage_p25_75: number;
  band_coverage_p10_90: number;
  ablation_curve: { variant: string; loo_92: number; wf_med_92: number; kept: boolean; note: string }[];
  ablation_odds: { feature: string; brier_loo: number; brier_tenfold: number; kept: boolean; note: string }[];
}

/** One protocol's audit entry: ranked, extended, or live-token, with its reason.
 *  The audit covers all 758 protocols in the snapshot, not just the board. */
export interface AuditRow {
  slug: string;
  name: string;
  category: string | null;
  tvl_usd: number;
  mcap_usd: number | null;
  status: 'ranked' | 'extended' | 'live-comp' | 'live-set-aside' | 'live-other';
  rank: number | null;
  flag: 'Core' | 'Extended' | 'Live';
  reason: string | null;
}

/** One ledger group: a named slice of the 758 protocols, with its count and reason. */
export interface LedgerGroup {
  name: string;
  count: number;
  note: string;
}

/** Everything the dashboard needs: the board, the live set, and the model it runs. */
export interface RadarData {
  as_of: string;
  source: string;
  floor_usd: number;
  model: ModelConstants;
  model_version: string;
  coverage: Coverage;
  watchlist_size: number;
  board_size: number;
  early_size: number;
  live_size: number;
  total_implied_usd: number;
  median_implied_usd: number;
  fit: FitStats;
  verdict_counts: { farm: number; thin: number; skip: number };
  total_hours_worked: number;
  ledger: { groups: LedgerGroup[]; total: number; checksum: string };
  audit: AuditRow[];
  rows: RadarRow[];
  live: LiveRow[];
}

/** Why the snapshot is not one this model can score. */
export class SnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotError';
  }
}

const DAY_MS = 86_400_000;

/** A finite number, else `fallback`. */
function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Clamp `v` into [lo, hi]. */
function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** The median of a sorted-or-not list, or null when it is empty. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid]!;
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** The mean of a list. */
function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** A whole day count from `from` to `to`, clamped at zero; null when either date is absent. */
export function ageDays(asOf: string, listedAt: string | null): number | null {
  if (listedAt === null) return null;
  const a = Date.parse(`${asOf}T00:00:00Z`);
  const b = Date.parse(`${listedAt}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.max(0, Math.floor((a - b) / DAY_MS));
}

/** A protocol's age band for the cohort share: 0–0.5 / 0.5–1 / 1–2 / 2–3 / 3+ years
 *  by uncapped age, plus 'unk' when listed_at is null. Radar-6 splits the youngest
 *  band in two (the under-6-months protocols record a token only 26.1% of the time,
 *  vs 40.3% at 6–12 months). */
export function ageBand(asOf: string, listedAt: string | null): string {
  const a = ageDays(asOf, listedAt);
  if (a === null) return 'unk';
  if (a < 183) return '0-0.5';
  if (a < 365) return '0.5-1';
  if (a < 730) return '1-2';
  if (a < 1095) return '2-3';
  return '3+';
}

/** DefiLlama's version-marker rule: a name ending in a release is a pool of another protocol. */
const VERSIONED = /\s(V\d+(\.\d+)?|v\d+(\.\d+)?|\d+\.\d+)$/;

/** Categories the watchlist rule leaves out: bridges and staked products of a traded token. */
const EXCLUDED_CATEGORIES = new Set([
  'Bridge',
  'Canonical Bridge',
  'Liquid Staking',
  'Liquid Restaking',
  'Restaked BTC',
  'CEX',
]);

/** A name carrying a whole word wrapped, staked or staking is a product of a traded token. */
const WRAPPED_WORD = /\bwrapped\b|\bstaked\b|\bstaking\b/i;

/** A name beginning with an exchange's name is that exchange's product, not its own launch. */
const EXCHANGE_PREFIX = /^(Binance|Coinbase|Bybit|Kraken|Bitget|OKX|Bitfinex|Gemini)\b/;

/** Whether a protocol records no token at all. */
export function isPreToken(p: SnapshotProtocol): boolean {
  return p.mcap_usd === null && p.gecko_id === null && p.symbol === null;
}

/**
 * Whether a protocol passes the strict screen the watchlist rule applies (no wrapped,
 * staked or bridged product, no exchange, no versioned pool): a Core row. Every pre-token
 * protocol is ranked, Core or Extended; the screen only decides the flag.
 */
export function isRankable(p: SnapshotProtocol): boolean {
  if (!isPreToken(p)) return false;
  if (p.category !== null && EXCLUDED_CATEGORIES.has(p.category)) return false;
  if (VERSIONED.test(p.name)) return false;
  if (WRAPPED_WORD.test(p.name)) return false;
  if (EXCHANGE_PREFIX.test(p.name)) return false;
  return true;
}

/** Why a pre-token protocol is not ranked, or null when it passes the screen. */
export function exclusionReason(p: SnapshotProtocol): string | null {
  if (p.category !== null && EXCLUDED_CATEGORIES.has(p.category))
    return `excluded category: ${p.category}`;
  if (VERSIONED.test(p.name)) return 'versioned name (a pool of another protocol)';
  if (WRAPPED_WORD.test(p.name)) return 'name carries wrapped, staked or staking';
  if (EXCHANGE_PREFIX.test(p.name)) return 'name begins with an exchange name';
  return null;
}

/** The snapshot's protocol by slug. */
function bySlug(protocols: SnapshotProtocol[]): Map<string, SnapshotProtocol> {
  return new Map(protocols.map((p) => [p.slug, p]));
}

// ---------------------------------------------------------------------------
// The fitted size curve: OLS log(mcap) ~ log(TVL) + category effects, over the
// clean comparables. Everything below runs at run time from the snapshot.
// ---------------------------------------------------------------------------

/** The comparables: live-token protocols that pass the same screen, mcap and TVL above 0. */
function rawComps(snapshot: Snapshot): SnapshotProtocol[] {
  return snapshot.protocols.filter(
    (p) => !isPreToken(p) && p.mcap_usd !== null && p.mcap_usd > 0 && p.tvl_usd > 0 && screenLive(p),
  );
}

/** The screen for a live-token protocol: same category, name and exchange rules as the board. */
function screenLive(p: SnapshotProtocol): boolean {
  if (p.category !== null && EXCLUDED_CATEGORIES.has(p.category)) return false;
  if (VERSIONED.test(p.name)) return false;
  if (WRAPPED_WORD.test(p.name)) return false;
  if (EXCHANGE_PREFIX.test(p.name)) return false;
  return true;
}

/** The clean comparables: mcap/TVL inside [0.02, 5], the band the bulk of the market occupies. */
function cleanComps(raw: SnapshotProtocol[]): SnapshotProtocol[] {
  return raw.filter((p) => {
    const m = p.mcap_usd! / p.tvl_usd;
    return m >= 0.02 && m <= 5;
  });
}

/** Solve a small dense linear system by Gauss-Jordan with partial pivoting. */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]!]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r]![c]!) > Math.abs(M[piv]![c]!)) piv = r;
    [M[c], M[piv]] = [M[piv]!, M[c]!];
    const d = M[c]![c]!;
    if (Math.abs(d) < 1e-12) throw new Error('singular');
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r]![c]! / d;
      for (let k = c; k <= n; k++) M[r]![k]! -= f * M[c]![k]!;
    }
  }
  return M.map((row, i) => row[n]! / row[i]!);
}

/** Ordinary least squares with a hair of ridge (1e-8) on every slope, never the intercept.
 *  ridgeCat adds a further penalty on the category-effect columns (3rd onward). Radar-5
 *  fits no category columns (see fitCurve), so ridgeCat stays 0; the parameter is kept
 *  so the bootstrap refits call the same function. fitCurve and the bootstrap refits
 *  both use ridgeCat 0. */
function ols(X: number[][], y: number[], ridge = 1e-8, ridgeCat = 0): number[] {
  const k = X[0]!.length;
  const XtX = Array.from({ length: k }, () => Array(k).fill(0));
  const Xty = Array(k).fill(0);
  for (let i = 0; i < X.length; i++)
    for (let a = 0; a < k; a++) {
      Xty[a]! += X[i]![a]! * y[i]!;
      for (let b = 0; b < k; b++) XtX[a]![b]! += X[i]![a]! * X[i]![b]!;
    }
  for (let a = 1; a < k; a++) XtX[a]![a]! += ridge + (a >= 2 ? ridgeCat : 0);
  return solve(XtX, Xty);
}

/** One design row: [1, log TVL]. Radar-5 fits no category column: category effects were
 *  tested at ridge lambda 0..1000 and did not improve either blind test on the
 *  92-comparable set, so the shipped curve is size-only (work/metrics/ablation.md). */
function designRow(p: SnapshotProtocol, cats: string[]): number[] {
  const row = [1, Math.log(p.tvl_usd)];
  for (const c of cats) row.push(p.category === c ? 1 : 0);
  return row;
}

/** A fitted curve: its coefficients, its categories, and the market cap it predicts. */
interface Curve {
  beta: number[];
  cats: string[];
  predict: (p: SnapshotProtocol) => number;
}

function fitCurve(train: SnapshotProtocol[]): Curve {
  const cats: string[] = [];
  const beta = ols(
    train.map((p) => designRow(p, cats)),
    train.map((p) => Math.log(p.mcap_usd!)),
    1e-8,
    0,
  );
  return {
    beta,
    cats,
    predict: (p) => Math.exp(designRow(p, cats).reduce((a, v, i) => a + v * beta[i]!, 0)),
  };
}

/** The flat multiple radar-2 used: the category-median mcap/TVL (at least 3, else global). */
function flatPred(train: SnapshotProtocol[], p: SnapshotProtocol): number {
  const live = train.filter((q) => q.mcap_usd !== null && q.mcap_usd > 0 && q.tvl_usd > 0);
  const glob = median(live.map((q) => q.mcap_usd! / q.tvl_usd));
  const same = live.filter((q) => q.category === p.category);
  const m = same.length >= 3 ? median(same.map((q) => q.mcap_usd! / q.tvl_usd)) : glob;
  return p.tvl_usd * (m ?? 0.25);
}

/** The factor miss of a prediction against a protocol's real market cap:
 *  max(pred/actual, actual/pred). The unit the plan's gates use. */
function factorMiss(pred: number, actual: number): number {
  return Math.max(pred / actual, actual / pred);
}

// ---------------------------------------------------------------------------
// The fitted launch probability: logistic regression P(has a token | age, growth,
// chains, category token rate, cohort share), fitted by gradient descent at run
// time. Radar-5 ATM: log TVL was tested and removed (work/metrics/ablation.md
// §6) — dropping it improves both Brier scores while AUC moves 0.7752 -> 0.7745
// — and the freed slot carries the cohort share (work/odds/atm-brier-2026-11-26.md):
// the share of protocols in the row's own age band that already carry a token.
// The linear age term misprices age-unknown rows (they record a token 78.8% of
// the time, almost like 3+ years at 79.1%, but get age 365 days); the cohort
// share fixes that. Radar-6 splits the youngest band in two (6 bands total,
// work/odds/r6-brier-2026-11-27.md): the adopted 6-feature model measures Brier
// LOO 0.197442 and ten-fold 0.199787 (base rate 0.247617), with AUC 0.8013 on the
// odd split — the ten-fold gate of 0.21 passes. The gain over Radar-5 (~0.0002
// on both tests) is inside noise; the permuted-growth control still helps, so
// this is a formal adoption, not a proven improvement. The cohort share is a
// snapshot-level statistic like the category token rate, computed over all rows
// here; the off-line adoption test computed it per-fold from the training rows only.
// ---------------------------------------------------------------------------

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
}

/** The area under the ROC curve of scored labels. */
function auc(scores: number[], labels: number[]): number {
  const pos: number[] = [];
  const neg: number[] = [];
  scores.forEach((s, i) => (labels[i] === 1 ? pos : neg).push(s));
  let c = 0;
  for (const p of pos) for (const n of neg) c += p > n ? 1 : p === n ? 0.5 : 0;
  return c / (pos.length * neg.length);
}

interface Logistic {
  coefsRaw: number[];
  weightsStd: number[];
  aucTrain: number;
  aucTest: number;
  predict: (p: SnapshotProtocol) => number;
}

function fitLogistic(snapshot: Snapshot, model: ModelConstants): Logistic {
  const all = snapshot.protocols.filter((p) => p.tvl_usd > 0);
  // The category token rate: the share of protocols in the protocol's own category
  // that already carry a token, smoothed (live + 2) / (all + 4) so a category with
  // one or two protocols does not swing the estimate. It is a snapshot-level prior
  // over the same protocols the logistic trains on.
  const catStats: Record<string, { live: number; n: number }> = {};
  for (const p of all) {
    const c = p.category ?? '(null)';
    const st = catStats[c] ?? { live: 0, n: 0 };
    catStats[c] = st;
    st.n++;
    if (!isPreToken(p)) st.live++;
  }
  const catRate = (p: SnapshotProtocol): number => {
    const st = catStats[p.category ?? '(null)'] ?? { live: 0, n: 0 };
    return (st.live + 2) / (st.n + 4);
  };
  // The cohort share: the share of protocols in the protocol's own age band
  // that already carry a token. Bands are 0–0.5 / 0.5–1 / 1–2 / 2–3 / 3+ years
  // by uncapped age, plus 'unk' when listed_at is null (Radar-6: the youngest
  // band is split in two). Like the category token
  // rate it is a snapshot-level prior over the same protocols the logistic
  // trains on — not a per-fold statistic at build time (the off-line adoption
  // test computed it per-fold from the training rows only, and this shipped
  // fit reproduces its Brier scores).
  const cohortStats: Record<string, { recorded: number; n: number }> = {};
  for (const p of all) {
    const b = ageBand(snapshot.as_of, p.listed_at);
    const st = cohortStats[b] ?? { recorded: 0, n: 0 };
    cohortStats[b] = st;
    st.n++;
    if (!isPreToken(p)) st.recorded++;
  }
  const baseRate = all.filter((p) => !isPreToken(p)).length / all.length;
  const cohortShare = (p: SnapshotProtocol): number => {
    const st = cohortStats[ageBand(snapshot.as_of, p.listed_at)] ?? { recorded: 0, n: 0 };
    return st.n === 0 ? baseRate : st.recorded / st.n;
  };
  const feats = (p: SnapshotProtocol): number[] => {
    const age = ageDays(snapshot.as_of, p.listed_at) ?? model.unknown_age_days;
    return [
      1,
      Math.min(age, model.age_cap_days) / model.age_cap_days,
      clamp(p.change_7d ?? 0, model.growth_floor, model.growth_cap) / 100,
      Math.min(p.chains.length, 10) / 10,
      catRate(p),
      cohortShare(p),
    ];
  };
  const F = all.map(feats);
  const mu = [0, 0, 0, 0, 0, 0];
  const sd = [1, 1, 1, 1, 1, 1];
  for (let k = 1; k < 6; k++) {
    mu[k] = mean(F.map((r) => r[k]!));
    sd[k] = Math.sqrt(mean(F.map((r) => (r[k]! - mu[k]!) ** 2))) || 1;
  }
  const Xs = F.map((r) => r.map((v, k) => (v - mu[k]!) / sd[k]!));
  const ys = all.map((p) => (isPreToken(p) ? 0 : 1));
  const trIdx = all.map((_, i) => i).filter((i) => i % 2 === 0);
  const teIdx = all.map((_, i) => i).filter((i) => i % 2 === 1);
  const w = [0, 0, 0, 0, 0, 0];
  for (let it = 0; it < 3000; it++) {
    const g = [0, 0, 0, 0, 0, 0];
    for (const i of trIdx) {
      const z = Xs[i]!.reduce((a, v, k) => a + v * w[k]!, 0);
      const e = sigmoid(z) - ys[i]!;
      for (let k = 0; k < 6; k++) g[k]! += e * Xs[i]![k]!;
    }
    for (let k = 0; k < 6; k++) w[k]! -= (0.15 * g[k]!) / trIdx.length;
  }
  const score = (i: number): number => sigmoid(Xs[i]!.reduce((a, v, k) => a + v * w[k]!, 0));
  const coefsRaw = [0, 0, 0, 0, 0, 0];
  coefsRaw[0] =
    w[0]! - w[1]! * mu[1]! / sd[1]! - w[2]! * mu[2]! / sd[2]! - w[3]! * mu[3]! / sd[3]! - w[4]! * mu[4]! / sd[4]! - w[5]! * mu[5]! / sd[5]!;
  for (let k = 1; k < 6; k++) coefsRaw[k] = w[k]! / sd[k]!;
  return {
    coefsRaw,
    weightsStd: w,
    aucTrain: auc(trIdx.map(score), trIdx.map((i) => ys[i]!)),
    aucTest: auc(teIdx.map(score), teIdx.map((i) => ys[i]!)),
    predict: (p) => {
      const f = feats(p);
      const z = coefsRaw.reduce((a, v, k) => a + v * f[k]!, 0);
      return clamp(sigmoid(z), model.prob_floor, model.prob_cap);
    },
  };
}

// ---------------------------------------------------------------------------
// A seeded generator, so the 200 bootstrap refits write the same bytes on
// every run (the program runs twice and both runs must agree).
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The p-th percentile of a list, by sorted position. */
function percentile(values: number[], q: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]!;
}

/** FNV-1a 32-bit hash as 8 hex chars: the board checksum the integrity strip checks. */
export function fnv1aHex(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** The canonical board string the checksum is taken over: rank:slug:implied, one per row.
 *  The dashboard recomputes it from DATA with the same function and compares. */
export function boardChecksumString(board: BoardRow[]): string {
  return board.map((r) => `${r.rank}:${r.slug}:${r.implied_value_usd}`).join('|');
}

/** The 7-day growth multiplier of one protocol under `model`. */
export function growthMultiplier(p: SnapshotProtocol, model: ModelConstants = MODEL): number {
  const growthPct = clamp(finite(p.change_7d, 0), model.growth_floor, model.growth_cap);
  return 1 + (growthPct / 100) * model.growth_weight;
}

/** The multipliers and the implied value one protocol gets under `model`.
 *  Radar-5: implied = base x growthMult x launchP. Maturity and breadth were tested
 *  and dropped (neither improves both blind tests over size-only), so they are 1.0. */
export function impliedValue(
  protocol: SnapshotProtocol,
  asOf: string,
  curve: Curve,
  logistic: Logistic,
  model: ModelConstants = MODEL,
): {
  implied: number;
  base: number;
  growthPct: number;
  growthMult: number;
  launchP: number;
  age: number | null;
} {
  const age = ageDays(asOf, protocol.listed_at);
  const base = curve.predict(protocol);
  const rawGrowth = finite(protocol.change_7d, 0);
  const growthPct = clamp(rawGrowth, model.growth_floor, model.growth_cap);
  const growthMult = growthMultiplier(protocol, model);
  const launchP = logistic.predict(protocol);
  const implied = Math.max(1, Math.round(base * growthMult * launchP));
  return { implied, base, growthPct, growthMult, launchP, age };
}

// ---------------------------------------------------------------------------
// Off-line measurements, embedded with their source. Brier, record-by-age and the
// ablation tables are measured off-line from this snapshot (work/metrics/brier-odds.mjs
// and work/metrics/ablation.md, plus work/odds/r6-brier-2026-11-27.md for the
// adopted 6-feature odds, re-measured in work/odds/r6-verify-odds-2026-11-27.md)
// because the LOO logistic refits are too slow to run
// at build time. They are constants of the snapshot, not of the code: re-measure
// them if the snapshot changes. The ten-fold Brier of the shipped 6-feature odds
// passes the plan's gate of 0.21 (0.199787); the 5-feature baseline's 0.213866
// missed it by 0.014, and is kept in work/odds/ as the comparison.
// ---------------------------------------------------------------------------

/** Brier scores of the shipped 6-feature odds (BASE5 + 6-band cohort share, no log TVL),
 *  from work/odds/r6-brier-2026-11-27.md (reproduced by
 *  work/odds/r6-brier-2026-11-27.mjs; re-measured in work/odds/r6-verify-odds-2026-11-27.md).
 *  Both gains over Radar-5 (0.197657 / 0.200076) are ~0.0002 — inside noise. */
const BRIER_6F_COHORT = { loo: 0.197442, tenfold: 0.199787, base: 0.247617 };

/** Bootstrap standard errors (200 seeded refits), measured off-line
 *  (work/odds/r6-brier-2026-11-27.json; re-measured in
 *  work/odds/r6-verify-odds-2026-11-27.json). Curve: resamples of the clean
 *  comparables, seed 0x72616434 — the same seed and resampling as the rank-range
 *  bootstrap in buildBoard. Odds: resamples of the 758 rows, seed 0x4F444453,
 *  refit of the adopted 6-feature logistic (statistics from the resample, GD on
 *  its even positions, as the shipped fit). */
const BOOTSTRAP_SE = {
  curve_intercept_se: 1.7737,
  curve_slope_se: 0.1012,
  logistic_weights_se_std: [0.1386, 0.1425, 0.1709, 0.1469, 0.1708, 0.1527],
  logistic_coefs_raw_se: [0.6823, 0.448, 1.348, 0.4569, 0.806, 0.6724],
};

/** Record-by-age: peers that recorded a token, by age band — six bands in Radar-6
 *  (the 0–1 year band is split at 6 months). Counts sum to 758, recorded to 416. */
const RECORD_BY_AGE = [
  { band: '0–0.5 years', n: 88, recorded: 23, share: 0.261 },
  { band: '0.5–1 years', n: 72, recorded: 29, share: 0.403 },
  { band: '1–2 years', n: 183, recorded: 70, share: 0.383 },
  { band: '2–3 years', n: 139, recorded: 76, share: 0.547 },
  { band: '3+ years', n: 163, recorded: 129, share: 0.791 },
  { band: 'age unknown', n: 113, recorded: 89, share: 0.788 },
];

/** Curve ablation on the 92-comparable set, median factor miss — re-measured for
 *  Radar-6 against the new shipped path (growth w=0.4) in
 *  work/metrics/r6-curve-ablation-2026-11-27.json. Rows without a growth term
 *  reproduce the Radar-5 numbers exactly (they do not depend on w). The last row
 *  is the control: the shipped path with growth replaced by another row's growth
 *  (seed 0x434F4E54) — it must not help, and it does not. It is not a candidate
 *  term and is excluded from the terms-kept count. */
const ABLATION_CURVE = [
  { variant: 'size-only (baseline)', loo_92: 3.2701, wf_med_92: 2.1057, kept: true, note: 'baseline' },
  { variant: '+ category effects (ridge λ=10)', loo_92: 3.4079, wf_med_92: 2.2849, kept: false, note: 'worse on both main tests' },
  { variant: '+ growth multiplier (w=0.4)', loo_92: 3.0962, wf_med_92: 2.0055, kept: true, note: 'shipped path (Radar-6; w=0.5 was 3.1147 / 2.0075 — the w=0.4 gain is noise-level, WF −0.0020)' },
  { variant: '+ maturity multiplier', loo_92: 3.1642, wf_med_92: 2.3093, kept: false, note: 'LOO improves, walk-forward worsens' },
  { variant: '+ breadth multiplier', loo_92: 3.4807, wf_med_92: 2.1899, kept: false, note: 'worse on both main tests' },
  { variant: '+ growth + maturity (w=0.4)', loo_92: 3.068, wf_med_92: 2.3198, kept: false, note: 'LOO improves, walk-forward worsens (w=0.5 was 3.0468 / 2.3225)' },
  { variant: '+ control: growth of another row', loo_92: 3.2319, wf_med_92: 2.1064, kept: false, note: 'control — must not help; growth permuted over 92 raw comps, seed 0x434F4E54; worse on both tests' },
];

/** Odds ablation: Brier of the shipped 6-feature model (BASE5 + 6-band cohort share)
 *  with one feature removed — except log TVL, which is not in the shipped model: its
 *  row is the shipped model WITH log TVL added. All rows re-measured off-line
 *  against the shipped model (work/odds/r6-verify-odds-2026-11-27.json); a feature
 *  is KEPT only when removing it worsens BOTH Brier scores. The last row is the
 *  control: the shipped model with growth replaced by another row's growth
 *  (seed 0x434F4E54). Terms kept: 4 of 6 (growth, chains, category token rate,
 *  cohort share); age and log TVL are not kept. The control row is not a candidate
 *  term. Note the membership change vs Radar-5: age is no longer kept (ten-fold
 *  improves without it, noise-level), chains now is (removing it worsens both). */
const ABLATION_ODDS = [
  { feature: 'full model (6 features)', brier_loo: 0.197442, brier_tenfold: 0.199787, kept: true, note: 'reference — shipped LOGIT_COHORT6' },
  { feature: 'log TVL', brier_loo: 0.197535, brier_tenfold: 0.2007, kept: false, note: 'adding log TVL to the shipped model worsens both Brier scores (LOO +0.000093, ten-fold +0.000913); AUC test 0.8013 → 0.8029' },
  { feature: 'age', brier_loo: 0.197564, brier_tenfold: 0.199767, kept: false, note: 'removing worsens LOO (+0.000122) but improves ten-fold (−0.000020, noise-level) — NOT KEPT by the both-tests rule' },
  { feature: 'growth (7d)', brier_loo: 0.198138, brier_tenfold: 0.20048, kept: true, note: 'removing worsens both (LOO +0.000696, ten-fold +0.000693)' },
  { feature: 'chains', brier_loo: 0.19798, brier_tenfold: 0.199874, kept: true, note: 'removing worsens both (LOO +0.000538, ten-fold +0.000087)' },
  { feature: 'category token rate', brier_loo: 0.211828, brier_tenfold: 0.212324, kept: true, note: 'strongest feature; without it AUC test 0.8013 → 0.7065' },
  { feature: 'cohort share', brier_loo: 0.211244, brier_tenfold: 0.213866, kept: true, note: 'removing returns the 5-feature baseline; AUC test 0.8013 → 0.7745' },
  { feature: '+ control: growth of another row', brier_loo: 0.196521, brier_tenfold: 0.19887, kept: false, note: 'control — must not help; growth permuted over 758 rows, seed 0x434F4E54. MEASURED: it helps on both tests (LOO −0.000921, ten-fold −0.000917) — reported, not hidden; see the Method tab' },
];

/** The protocols the board ranks, strongest first, with ranks 1..n.
 *  Coverage 'core' ranks only the Core protocols (re-ranked 1..198); coverage 'all'
 *  ranks every pre-token protocol (1..342). Verdicts are by money (see farmEconomics),
 *  not by rank. The fit, the bootstrap and the farm economics are identical in both
 *  modes; the audit covers all 758 protocols in the snapshot, whatever the board shows. */
export function buildBoard(
  snapshot: Snapshot,
  model: ModelConstants = MODEL,
  coverage: Coverage = 'all',
): { board: BoardRow[]; fit: FitStats; audit: AuditRow[]; ledger: { groups: LedgerGroup[]; total: number; checksum: string } } {
  // --- the fitted curve and its validation, all from this snapshot ---
  const raw = rawComps(snapshot);
  const clean = cleanComps(raw);
  const curve = fitCurve(clean);
  const cats = curve.cats;
  const beta = curve.beta;
  const predLog = clean.map((p) => designRow(p, cats).reduce((a, v, i) => a + v * beta[i]!, 0));
  const yLog = clean.map((p) => Math.log(p.mcap_usd!));
  const ssRes = yLog.reduce((a, v, i) => a + (v - predLog[i]!) ** 2, 0);
  const ssTot = yLog.reduce((a, v) => a + (v - mean(yLog)) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  const residSd = Math.sqrt(ssRes / (yLog.length - beta.length));
  const catCounts: Record<string, number> = {};
  clean.forEach((p) => {
    const c = p.category ?? '(null)';
    catCounts[c] = (catCounts[c] ?? 0) + 1;
  });
  const catEffects = cats.map((c, i) => ({ category: c, effect: beta[2 + i]!, n: catCounts[c] ?? 0 }));
  // The shipped predictor for a comparable is the curve times the growth multiplier
  // (comparables already have tokens, so no launch probability is applied).
  const shipped = (c: Curve, p: SnapshotProtocol): number =>
    c.predict(p) * growthMultiplier(p, model);
  // Leave-one-out on the clean set (76): curve vs the flat category-median multiple,
  // as median factor miss; and the signed log-residuals of the fitted value, which
  // the value band is built from.
  const eCurve: number[] = [];
  const eFlat: number[] = [];
  const looBasePred: number[] = [];
  const looResidLog: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const train = clean.filter((_, j) => j !== i);
    const held = clean[i]!;
    const c = fitCurve(train);
    const basePred = c.predict(held);
    looBasePred.push(basePred);
    looResidLog.push(Math.log(held.mcap_usd!) - Math.log(basePred));
    eCurve.push(factorMiss(shipped(c, held), held.mcap_usd!));
    eFlat.push(factorMiss(flatPred(train, held), held.mcap_usd!));
  }
  const looCurve = median(eCurve) ?? 0;
  const looFlat = median(eFlat) ?? 0;
  // Leave-one-out on the full raw set (92), same predictor and baseline.
  const eCurve92: number[] = [];
  const eFlat92: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    const train = raw.filter((_, j) => j !== i);
    const held = raw[i]!;
    const c = fitCurve(train);
    eCurve92.push(factorMiss(shipped(c, held), held.mcap_usd!));
    eFlat92.push(factorMiss(flatPred(train, held), held.mcap_usd!));
  }
  const looCurve92 = median(eCurve92) ?? 0;
  const looFlat92 = median(eFlat92) ?? 0;
  // The residual band: global quantiles of the LOO log-residuals, applied to the
  // fitted value. Coverage is the share of clean comparables whose real market cap
  // falls inside the band around their LOO fitted value — the coverage of the band
  // the dashboard prints, measured on held-out caps.
  const bandP25 = Math.exp(percentile(looResidLog, 0.25));
  const bandP75 = Math.exp(percentile(looResidLog, 0.75));
  const bandP10 = Math.exp(percentile(looResidLog, 0.1));
  const bandP90 = Math.exp(percentile(looResidLog, 0.9));
  const bandCov2575 =
    looBasePred.filter((bp, i) => clean[i]!.mcap_usd! >= bp * bandP25 && clean[i]!.mcap_usd! <= bp * bandP75).length / clean.length;
  const bandCov1090 =
    looBasePred.filter((bp, i) => clean[i]!.mcap_usd! >= bp * bandP10 && clean[i]!.mcap_usd! <= bp * bandP90).length / clean.length;
  // Time splits: fit the older comparables, test the newer ones; median-split and
  // tertile-split, on the clean set and on the raw set.
  const timeSplit = (comps: SnapshotProtocol[]) => {
    const dated = comps.filter((p) => p.listed_at).sort((a, b) => (a.listed_at! < b.listed_at! ? -1 : 1));
    const cut = Math.floor(dated.length / 2);
    const trainT = dated.slice(0, cut);
    const testT = dated.slice(cut);
    const cT = fitCurve(trainT);
    const eC = testT.map((p) => factorMiss(shipped(cT, p), p.mcap_usd!));
    const eF = testT.map((p) => factorMiss(flatPred(trainT, p), p.mcap_usd!));
    const cut2 = Math.floor(dated.length / 3);
    const trainT2 = dated.slice(0, cut2);
    const testT2 = dated.slice(cut2);
    const cT2 = fitCurve(trainT2);
    const eC2 = testT2.map((p) => factorMiss(shipped(cT2, p), p.mcap_usd!));
    const eF2 = testT2.map((p) => factorMiss(flatPred(trainT2, p), p.mcap_usd!));
    return {
      curve: median(eC) ?? 0,
      flat: median(eF) ?? 0,
      cut: dated[cut]?.listed_at ?? '',
      curve2: median(eC2) ?? 0,
      flat2: median(eF2) ?? 0,
      cut2: dated[cut2]?.listed_at ?? '',
    };
  };
  const ts76 = timeSplit(clean);
  const ts92 = timeSplit(raw);
  const logistic = fitLogistic(snapshot, model);
  const setAside = raw
    .filter((p) => {
      const m = p.mcap_usd! / p.tvl_usd;
      return m < 0.02 || m > 5;
    })
    .map((p) => `${p.name} ${(p.mcap_usd! / p.tvl_usd).toFixed(1)}x`);

  // --- score every pre-token protocol: all 342, whatever their size ---
  const scored = snapshot.protocols
    .filter((p) => isPreToken(p))
    .map((p) => {
      const v = impliedValue(p, snapshot.as_of, curve, logistic, model);
      return { p, ...v };
    })
    .sort((a, b) => b.implied - a.implied || (a.p.slug < b.p.slug ? -1 : 1));

  // --- the board itself: Core only in 'core' mode (re-ranked 1..198), everything in 'all' ---
  const listed = coverage === 'core' ? scored.filter((s) => isRankable(s.p)) : scored;

  // --- bootstrap: 200 refits of the curve, one rank range per board row ---
  // Radar-5: the bootstrap is kept ONLY for the rank range. The value band comes
  // from the leave-one-out residuals above (the bootstrap band covered 15.8%).
  const rng = mulberry32(0x72616434); // 'rad4'
  const rankLo: number[] = listed.map(() => listed.length);
  const rankHi: number[] = listed.map(() => 1);
  for (let b = 0; b < BOOTSTRAP_N; b++) {
    const sample = Array.from({ length: clean.length }, () => clean[Math.floor(rng() * clean.length)]!);
    const bb = ols(
      sample.map((p) => designRow(p, cats)),
      sample.map((p) => Math.log(p.mcap_usd!)),
      1e-8,
      0,
    );
    const baseRep = (p: SnapshotProtocol): number =>
      Math.exp(designRow(p, cats).reduce((a, v, i) => a + v * bb[i]!, 0));
    const vals = listed.map((s) =>
      Math.max(1, Math.round(baseRep(s.p) * s.growthMult * s.launchP)),
    );
    const order = vals.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v || (listed[a.i]!.p.slug < listed[b.i]!.p.slug ? -1 : 1));
    order.forEach((o, pos) => {
      rankLo[o.i] = Math.min(rankLo[o.i]!, pos + 1);
      rankHi[o.i] = Math.max(rankHi[o.i]!, pos + 1);
    });
  }

  // --- the nearest priced peers per board row: the 5 clean comparables whose
  // fitted value is closest to the row's, each with its real market cap over the
  // curve's fitted value (CAP ÷ CURVE). Priced peers are live-token protocols —
  // the board rows themselves have no token and no cap — so the drawer shows the
  // market's own pricing of the nearest comparables, not more pre-token rows.
  const pricedPeers = (base: number): PricedPeer[] =>
    clean
      .map((c) => {
        const fitted = curve.predict(c);
        return { c, fitted, d: Math.abs(Math.log(fitted) - Math.log(base)) };
      })
      .sort((a, b) => a.d - b.d)
      .slice(0, 5)
      .map((x) => ({
        slug: x.c.slug,
        name: x.c.name,
        cap_usd: Math.round(x.c.mcap_usd!),
        curve_usd: Math.round(x.fitted),
        cap_div_curve: round4(x.c.mcap_usd! / x.fitted),
      }));

  const board: BoardRow[] = listed.map((s, i) => {
    const rank = i + 1;
    const econ = farmEconomics(s.implied, s.p.tvl_usd, s.age, s.launchP, model);
    const core = isRankable(s.p);
    return {
      rank,
      slug: s.p.slug,
      name: s.p.name,
      category: s.p.category,
      chains: s.p.chains,
      tvl_usd: s.p.tvl_usd,
      change_7d: s.p.change_7d,
      mcap_usd: s.p.mcap_usd,
      listed_at: s.p.listed_at,
      gecko_id: s.p.gecko_id,
      symbol: s.p.symbol,
      token_status: 'pre-token' as const,
      age_days: s.age,
      flag: core ? ('Core' as const) : ('Extended' as const),
      flag_reason: core ? null : exclusionReason(s.p),
      implied_value_usd: s.implied,
      model: {
        fitted_mcap_usd: Math.round(s.base),
        growth_pct: s.growthPct,
        growth_multiplier: round4(s.growthMult),
        launch_probability: round4(s.launchP),
        age_days: s.age,
        value_low_usd: Math.max(1, Math.round(s.base * bandP25)),
        value_high_usd: Math.max(1, Math.round(s.base * bandP75)),
        value_low90_usd: Math.max(1, Math.round(s.base * bandP10)),
        value_high90_usd: Math.max(1, Math.round(s.base * bandP90)),
        rank_low: rankLo[i]!,
        rank_high: rankHi[i]!,
        deposit_usd: econ.deposit,
        drop_usd: round2(econ.drop),
        gas_usd: econ.gas,
        tbill_charge_usd: round2(econ.tbill),
        net_usd: round2(econ.net),
        net_per_hour_usd: round2(econ.perHour),
        breakeven_drop_share: round4(econ.breakeven),
        breakeven_25ph_drop_share: round4(econ.breakeven25ph),
        breakeven_odds: round4(econ.breakevenOdds),
        hours_worked: round4(econ.hours),
        hold_days: econ.holdDays,
        verdict: econ.verdict,
        priced_peers: pricedPeers(s.base),
      },
      farm_steps: farmSteps(s.p, s.age).map(stepText),
    };
  });

  // The audit is about the snapshot, not the board: all 758 protocols — every
  // pre-token protocol with its rank in the full pre-token ordering and its
  // Core/Extended flag and reason, plus every live-token protocol with its status.
  // In 'core' mode the board itself carries only the 198 Core rows.
  const audit: AuditRow[] = [];
  scored.forEach((s, i) => {
    const core = isRankable(s.p);
    audit.push({
      slug: s.p.slug,
      name: s.p.name,
      category: s.p.category,
      tvl_usd: s.p.tvl_usd,
      mcap_usd: s.p.mcap_usd,
      status: core ? ('ranked' as const) : ('extended' as const),
      rank: i + 1,
      flag: core ? ('Core' as const) : ('Extended' as const),
      reason: core ? null : exclusionReason(s.p),
    });
  });
  const cleanSlugs = new Set(clean.map((p) => p.slug));
  const rawSlugs = new Set(raw.map((p) => p.slug));
  for (const p of snapshot.protocols.filter((q) => !isPreToken(q))) {
    let status: AuditRow['status'];
    let reason: string;
    if (cleanSlugs.has(p.slug)) {
      status = 'live-comp';
      reason = 'live-token comparable — fits the curve';
    } else if (rawSlugs.has(p.slug)) {
      status = 'live-set-aside';
      reason = `mcap/TVL ${(p.mcap_usd! / p.tvl_usd).toFixed(2)}x outside [0.02, 5]`;
    } else {
      status = 'live-other';
      reason = 'already trades — not a launch candidate';
    }
    audit.push({
      slug: p.slug,
      name: p.name,
      category: p.category,
      tvl_usd: p.tvl_usd,
      mcap_usd: p.mcap_usd,
      status,
      rank: null,
      flag: 'Live' as const,
      reason,
    });
  }
  audit.sort((a, b) => b.tvl_usd - a.tvl_usd || (a.slug < b.slug ? -1 : 1));

  // The ledger: seven groups that sum to the 758 protocols in the snapshot, counted
  // from the data, not hard-coded. The checksum is the FNV-1a of the canonical
  // board string; the dashboard recomputes it from DATA and compares. The old
  // sixth group ("Live-token, other") was heterogeneous, so it is split in two:
  // protocols the screen excludes (versioned / bridge / staking / CEX / wrapped
  // names) and protocols that pass the screen but carry no usable market cap
  // (mcap null) — the two counts add back to the old group exactly.
  const wl = new Set(snapshot.watchlist);
  const liveExcludedByScreen = snapshot.protocols.filter((p) => !isPreToken(p) && !screenLive(p)).length;
  const liveNoUsableCap = snapshot.protocols.filter(
    (p) => !isPreToken(p) && screenLive(p) && !rawSlugs.has(p.slug),
  ).length;
  const ledgerGroups: LedgerGroup[] = [
    { name: 'Watchlist (board)', count: board.filter((r) => wl.has(r.slug)).length, note: 'the 40 protocols the watchlist rule names' },
    { name: 'Core off-watchlist', count: board.filter((r) => r.flag === 'Core' && !wl.has(r.slug)).length, note: 'pass the strict screen, not on the watchlist' },
    { name: 'Extended (pre-token)', count: audit.filter((a) => a.status === 'extended').length, note: 'pre-token, set aside by the screen, with a reason each' },
    { name: 'Live-token comparables', count: clean.length, note: 'fit the curve; mcap/TVL inside [0.02, 5]' },
    { name: 'Live-token set aside', count: raw.length - clean.length, note: 'mcap/TVL outside [0.02, 5]' },
    { name: 'Live-token, excluded by screen', count: liveExcludedByScreen, note: 'fail the screen: versioned, bridge, staking, CEX or wrapped name' },
    { name: 'Live-token, no usable cap', count: liveNoUsableCap, note: 'pass the screen, but no market cap to price from' },
  ];
  const ledger = {
    groups: ledgerGroups,
    total: ledgerGroups.reduce((a, g) => a + g.count, 0),
    checksum: fnv1aHex(boardChecksumString(board)),
  };

  const fit: FitStats = {
    intercept: beta[0]!,
    slope: beta[1]!,
    cat_effects: catEffects,
    r2,
    resid_sd: residSd,
    comps_raw: raw.length,
    comps_clean: clean.length,
    set_aside: setAside,
    loo_curve: looCurve,
    loo_flat: looFlat,
    loo_curve_92: looCurve92,
    loo_flat_92: looFlat92,
    time_curve: ts76.curve,
    time_flat: ts76.flat,
    time_cut: ts76.cut,
    time_curve_92: ts92.curve,
    time_flat_92: ts92.flat,
    time2_curve: ts76.curve2,
    time2_flat: ts76.flat2,
    time2_cut: ts76.cut2,
    time2_curve_92: ts92.curve2,
    time2_flat_92: ts92.flat2,
    logistic_weights_std: logistic.weightsStd,
    logistic_coefs_raw: logistic.coefsRaw,
    logistic_auc_train: logistic.aucTrain,
    logistic_auc_test: logistic.aucTest,
    bootstrap_n: BOOTSTRAP_N,
    brier_loo: BRIER_6F_COHORT.loo,
    brier_tenfold: BRIER_6F_COHORT.tenfold,
    brier_base: BRIER_6F_COHORT.base,
    curve_intercept_se: BOOTSTRAP_SE.curve_intercept_se,
    curve_slope_se: BOOTSTRAP_SE.curve_slope_se,
    logistic_weights_se_std: BOOTSTRAP_SE.logistic_weights_se_std,
    logistic_coefs_raw_se: BOOTSTRAP_SE.logistic_coefs_raw_se,
    record_by_age: RECORD_BY_AGE,
    band_p25: round4(bandP25),
    band_p75: round4(bandP75),
    band_p10: round4(bandP10),
    band_p90: round4(bandP90),
    band_coverage_p25_75: round4(bandCov2575),
    band_coverage_p10_90: round4(bandCov1090),
    ablation_curve: ABLATION_CURVE,
    ablation_odds: ABLATION_ODDS,
  };
  return { board, fit, audit, ledger };
}

const round4 = (n: number): number => Math.round(n * 1e4) / 1e4;

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** A step as one string: its action, then its cost and time, within the gate's 20..600 chars. */
export function stepText(step: FarmStep): string {
  let s = `${step.text} Cost: ${step.cost}. Time: ${step.time}.`;
  if (s.length > 600) s = `${s.slice(0, 596)}...`;
  if (s.length < 20) s = `${s} Hold the position and check the protocol's own page.`;
  return s;
}

/** The first chain a protocol names, or a neutral phrase. */
function chainOf(p: SnapshotProtocol): string {
  return p.chains.length > 0 ? p.chains[0]! : 'its main chain';
}

/** How long to hold, from the protocol's age: younger protocols get a longer window. */
function holdDaysFor(age: number | null): number {
  if (age === null) return 30;
  if (age < 180) return 60;
  if (age < 365) return 45;
  return 30;
}

/** The work minutes of the 8 farm steps, in order, for a hold of `holdDays` days.
 *  Step 4 is 10 minutes a week over the hold; step 5 (the hold itself) is not work.
 *  farmSteps and farmEconomics both read this, so the hours the economics charge
 *  are exactly the hours the plan takes. Total: 45 + 10 x weeks. */
export function stepMinutes(holdDays: number): number[] {
  const weeks = Math.ceil(holdDays / 7);
  return [5, 15, 10, 10 * weeks, 0, 5, 5, 5];
}

/**
 * A farm's economics by money, on the model's $10,000 deposit at a 7% drop share.
 * The deposit is not a cost — it comes back when the position unwinds. What the farm
 * costs is the gas of its steps plus the T-bill charge: the same $10,000 in a 4%
 * T-bill over the hold. Drop = implied x drop share x deposit / TVL. Net = drop -
 * gas - T-bill. $/hour = net / hours worked. Break-even is the drop share at which
 * the net is zero; break-even at $25/h adds the pay for the hours worked. Break-even
 * odds is the launch probability at which the expected net is zero: (gas + T-bill)
 * divided by the drop if the token launches (drop / launchP, full precision — it is
 * computed here, not in the dashboard, so the rounded DATA fields cannot drift it).
 * When it is above 1 the row never breaks even on odds alone: even a certain token
 * pays less than the cost. The verdict is by money: FARM when the net is positive
 * and pays at least $25 an hour, THIN when the net is positive but pays less, SKIP
 * when the net is negative. Withdrawal gas is not modelled; the farm-economics
 * drawer and the Method tab say so (not the step-8 cost string, since Radar-6).
 */
export function farmEconomics(
  implied: number,
  tvl: number,
  age: number | null,
  launchP: number,
  model: ModelConstants = MODEL,
): {
  deposit: number;
  holdDays: number;
  weeks: number;
  gas: number;
  tbill: number;
  drop: number;
  net: number;
  hours: number;
  perHour: number;
  breakeven: number;
  breakeven25ph: number;
  breakevenOdds: number;
  verdict: 'FARM' | 'THIN' | 'SKIP';
} {
  const deposit = model.farm_deposit_usd;
  const holdDays = holdDaysFor(age);
  const weeks = Math.ceil(holdDays / 7);
  const gas = 3 + 8 + 4 + 2 * weeks;
  const tbill = deposit * model.tbill_rate * (holdDays / 365);
  const drop = (implied * model.farm_drop_share * deposit) / tvl;
  const net = drop - gas - tbill;
  const hours = stepMinutes(holdDays).reduce((a, m) => a + m, 0) / 60;
  const perHour = net / hours;
  const breakeven = ((gas + tbill) * tvl) / (implied * deposit);
  const breakeven25ph = ((gas + tbill + model.farm_pay_rate_usd_h * hours) * tvl) / (implied * deposit);
  // The drop if the token launches (the odds not applied), and the odds at which
  // the expected net is zero. launchP is clamped to [0.10, 0.85], never 0.
  const dropIfLaunches = drop / launchP;
  const breakevenOdds = (gas + tbill) / dropIfLaunches;
  const verdict: 'FARM' | 'THIN' | 'SKIP' =
    net > 0 && perHour >= model.farm_pay_rate_usd_h ? 'FARM' : net > 0 ? 'THIN' : 'SKIP';
  return { deposit, holdDays, weeks, gas, tbill, drop, net, hours, perHour, breakeven, breakeven25ph, breakevenOdds, verdict };
}

/** The category's main action, in words a farmer can follow. Terse on purpose:
 *  every farm step (action + cost + time) stays within 100 characters so the
 *  dashboard drawer shows the whole 8-step plan without scrolling. */
function actionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  const k = `$${capital / 1000}k`;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral'))
    return `Supply ${k} USDC to ${name} on ${chain}.`;
  if (c.includes('dex') || c.includes('leveraged farm'))
    return `Add ${k} liquidity to ${name} on ${chain}.`;
  if (c.includes('yield') || c.includes('farm'))
    return `Deposit ${k} USDC in ${name} vault on ${chain}.`;
  if (c.includes('bridge'))
    return `Bridge ${k} USDC via ${name} to ${chain}.`;
  if (c.includes('staking') || c.includes('restak'))
    return `Stake ${k} via ${name} on ${chain}.`;
  if (c.includes('perpetual') || c.includes('derivative') || c.includes('options'))
    return `Deposit ${k} margin on ${name}, ${chain}.`;
  if (c.includes('prediction'))
    return `Fund ${k}, place one market on ${name}.`;
  if (c.includes('curator') || c.includes('allocator') || c.includes('risk'))
    return `Deposit ${k} in ${name} vault on ${chain}.`;
  if (c.includes('stable') || c.includes('algo-stables'))
    return `Mint or deposit ${k} stable via ${name}, ${chain}.`;
  if (c.includes('rwa'))
    return `Mint ${k} of ${name} yield asset, ${chain}.`;
  if (c.includes('insurance'))
    return `Buy ${k} cover from ${name} on ${chain}.`;
  if (c.includes('launchpad'))
    return `Stake ${k} for a ${name} launch, ${chain}.`;
  if (c.includes('payment'))
    return `Route ${k} payments via ${name}, ${chain}.`;
  if (c.includes('ai agent') || c.includes('decentralized ai'))
    return `Run a ${k} agent task on ${name}, ${chain}.`;
  if (c.includes('nft'))
    return `Trade a ~${k} item on ${name}, ${chain}.`;
  if (c.includes('index'))
    return `Buy ${k} of the ${name} index, ${chain}.`;
  if (c.includes('privacy'))
    return `Shield ${k} via ${name} on ${chain}.`;
  return `Deposit ${k} USDC in ${name} on ${chain}.`;
}

/** The category's second, different qualifying action, so the farm is not one click.
 *  Terse like actionFor: every step stays within 100 characters in full. */
function secondActionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral'))
    return `Borrow $${Math.round(capital / 2000)}k, repay same week.`;
  if (c.includes('dex') || c.includes('leveraged farm'))
    return `Swap $${Math.round(capital / 2000)}k via ${name} router.`;
  if (c.includes('staking') || c.includes('restak'))
    return `Delegate a second stake via ${name}.`;
  if (c.includes('perpetual') || c.includes('derivative') || c.includes('options'))
    return `Close hedge, open fresh opposite.`;
  if (c.includes('prediction'))
    return `Settle one market, open a second.`;
  if (c.includes('curator') || c.includes('allocator') || c.includes('risk'))
    return `Move part to a second ${name} vault.`;
  if (c.includes('stable') || c.includes('algo-stables'))
    return `Swap half stable, swap back.`;
  if (c.includes('rwa'))
    return `Redeem a little, mint again.`;
  if (c.includes('launchpad'))
    return `Vote on next ${name} launch.`;
  if (c.includes('yield') || c.includes('farm'))
    return `Move $${Math.round(capital / 2000)}k to a second ${name} vault.`;
  if (c.includes('bridge'))
    return `Bridge a smaller amount back.`;
  return `Second action: swap, vote or deposit.`;
}

/** A dollar figure with thousands separators, without relying on ICU locales. */
function fmtUsd(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * A protocol's farm plan: eight steps, each an action with a cost and a time. The plan
 * is derived from the protocol's own record (category, chains, TVL, age), never from a
 * hand-written list of names. Step 8 is the exit trigger: leave when the protocol's
 * TVL falls below 83% of today's — a 17% weekly drop, the worst 5% of weeks in this
 * snapshot (p5 of change_7d is -17.05% over the 754 protocols with a 7-day change)
 * — or the drop window closes. The deposit is the
 * model's $10,000 everywhere — the same deposit the economics price. Step 6 takes
 * 5 minutes, not 10: the 5 minutes moved to step 8, so the plan's total work hours
 * are exactly the hours the economics charge (work/metrics + work/farm).
 * Steps are written terse: each full step (action + cost + time) is at most 100
 * characters, so the dashboard drawer shows all 8 in one viewport — except one
 * row (sygnum-fiusd-liquidity-fund, 104 characters on step 2), which wraps to two
 * lines in the drawer. The minutes (stepMinutes) and gas behind each step are
 * unchanged — only the wording is shorter. Exit gas is not modelled; that
 * disclosure now lives in the farm-economics drawer and the Method tab, not in
 * the step-8 cost string (which reads "exit gas extra").
 */
/** The gas token a chain's transactions are paid in, by the chain's own name —
 *  a general fact about the chain, not a per-protocol claim. ETH covers every
 *  EVM / OP-Stack / zk chain (gas is paid in ETH there). Returns null for the
 *  chains whose gas token is not established well enough to print (step 1 then
 *  says "gas token" instead). */
export function gasTokenFor(chain: string): string | null {
  const ETH_CHAINS = new Set([
    'Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Ink', 'Unichain', 'Linea', 'Scroll',
    'zkSync Era', 'Blast', 'Mode', 'World Chain', 'BOB', 'Hemi', 'Morph', 'Soneium',
    'Taiko', 'Zircuit', 'Manta', 'Lisk', 'Polygon zkEVM', 'Katana',
  ]);
  if (ETH_CHAINS.has(chain)) return 'ETH';
  const MAP: Record<string, string> = {
    Solana: 'SOL', Binance: 'BNB', Op_Bnb: 'BNB', Tron: 'TRX', Avalanche: 'AVAX',
    Polygon: 'POL', Monad: 'MON', Plasma: 'XPL', 'Hyperliquid L1': 'HYPE',
    Bitcoin: 'BTC', Stellar: 'XLM', Flare: 'FLR', Sui: 'SUI', Algorand: 'ALGO',
    Ripple: 'XRP', Mantle: 'MNT', Starknet: 'STRK', Ronin: 'RON', Kava: 'KAVA',
    Berachain: 'BERA', Stacks: 'STX', Aptos: 'APT', 'Plume Mainnet': 'PLUME',
    Plume: 'PLUME', XION: 'XION', Bittensor: 'TAO', 'Bittensor EVM': 'TAO',
    Celo: 'CELO', Sei: 'SEI', Cronos: 'CRO', Fantom: 'FTM', Moonbeam: 'GLMR',
    Astar: 'ASTR', Filecoin: 'FIL', Near: 'NEAR', Sonic: 'S', Story: 'IP',
    'X Layer': 'OKB', ZetaChain: 'ZETA', Metis: 'METIS', ApeChain: 'APE',
    Doge: 'DOGE', Litecoin: 'LTC', Cardano: 'ADA', Zcash: 'ZEC', Evmos: 'EVMOS',
    Flow: 'FLOW',
  };
  return MAP[chain] ?? null;
}

/** A $10,000 deposit as a share of a TVL, in percent with 4 decimals and trailing
 *  zeros stripped (0.0006% for Veda, 0.1569% for Loopscale Curation). */
function fmtPctShare(tvlUsd: number): string {
  const pct = (MODEL.farm_deposit_usd / tvlUsd) * 100;
  return pct.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

/** A dollar amount to 3 significant figures, shortened ($1.30B, $876M, $58.9M,
 *  $5.29M) — the exit-trigger figure, where the rounding is under 0.5% of a
 *  17% move. */
function fmtShortUsd(n: number): string {
  const sig3 = (v: number): string => {
    if (v >= 100) return String(Math.round(v));
    if (v >= 10) return v.toFixed(1);
    return v.toFixed(2);
  };
  if (n >= 1e9) return `$${sig3(n / 1e9)}B`;
  if (n >= 1e6) return `$${sig3(n / 1e6)}M`;
  if (n >= 1e3) return `$${sig3(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

export function farmSteps(p: SnapshotProtocol, age: number | null): FarmStepSpec[] {
  const chain = chainOf(p);
  const capital = MODEL.farm_deposit_usd;
  const hold = holdDaysFor(age);
  const otherChain = p.chains.length > 1 ? p.chains[1]! : chain;
  const minutes = stepMinutes(hold);
  const weeks = Math.ceil(hold / 7);
  const gas = gasTokenFor(chain);
  // Step 2: test $100 (1% of the deposit) first, then scale up — the longest
  // test phrase that still keeps the full step (action + cost + time) at or
  // under 100 characters; L3 if even the shortest overflows (1 known row).
  const core = actionFor(p, capital, chain);
  const step2Base: FarmStepSpec = {
    text: core,
    cost: `$${capital >= 150 ? 8 : 4} gas`,
    time: '15 min',
    minutes: minutes[1]!,
  };
  const testPhrases = [' Test $100, then scale up.', ' Test $100 first.', ' Test $100.'];
  let step2Text = core + testPhrases[2]!;
  for (const phrase of testPhrases) {
    const candidate = { ...step2Base, text: core + phrase };
    if (stepText(candidate).length <= 100) {
      step2Text = candidate.text;
      break;
    }
  }
  // Step 4: name the second chain only when it differs and the full step stays
  // at or under 100 characters.
  let step4Text = `Weekly on ${chain}: check, claim, top up — ${weeks} weeks.`;
  if (otherChain !== chain) {
    const withOther = `Weekly on ${chain} + ${otherChain}: check, claim, top up — ${weeks} weeks.`;
    const candidate: FarmStepSpec = {
      text: withOther,
      cost: '$2 gas/week',
      time: '10 min/week',
      minutes: minutes[3]!,
    };
    if (stepText(candidate).length <= 100) step4Text = withOther;
  }
  const trig = fmtShortUsd(Math.round(p.tvl_usd * 0.83));
  return [
    {
      text:
        gas !== null
          ? `Fresh wallet, seed offline; keep ~$5 ${gas} for ${chain} gas.`
          : `Fresh wallet, seed offline; keep ~$5 gas token for ${chain}.`,
      cost: 'under $3 gas',
      time: '5 min',
      minutes: minutes[0]!,
    },
    {
      text: step2Text,
      cost: `$${capital >= 150 ? 8 : 4} gas`,
      time: '15 min',
      minutes: minutes[1]!,
    },
    {
      text: secondActionFor(p, capital, chain),
      cost: `$${capital >= 150 ? 4 : 2} gas`,
      time: '10 min',
      minutes: minutes[2]!,
    },
    {
      text: step4Text,
      cost: '$2 gas/week',
      time: '10 min/week',
      minutes: minutes[3]!,
    },
    {
      text: `Hold at least ${hold} days; $10k is ${fmtPctShare(p.tvl_usd)}% of TVL.`,
      cost: `$${capital / 1000}k stays in position`,
      time: `${hold} days`,
      minutes: minutes[4]!,
    },
    {
      text: `Check the points page; claim only via its link.`,
      cost: 'free to check',
      time: '5 min',
      minutes: minutes[5]!,
    },
    {
      text: `Log dates, tx hash, $ value; drop = taxable income in many places.`,
      cost: 'free',
      time: '5 min',
      minutes: minutes[6]!,
    },
    {
      text: `Exit if TVL <${trig} (−17%, worst 5% of weeks) or window closes.`,
      cost: 'exit gas extra',
      time: '5 min',
      minutes: minutes[7]!,
    },
  ];
}

/** The live-token protocols, by market cap, for the dashboard's Live token view. */
export function liveRows(snapshot: Snapshot): LiveRow[] {
  return snapshot.protocols
    .filter((p) => !isPreToken(p) && p.category !== 'CEX' && p.mcap_usd !== null)
    .sort((a, b) => (b.mcap_usd ?? 0) - (a.mcap_usd ?? 0) || b.tvl_usd - a.tvl_usd)
    .slice(0, LIVE_ROWS)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      chains: p.chains,
      tvl_usd: p.tvl_usd,
      mcap_usd: p.mcap_usd,
      change_7d: p.change_7d,
      mcap_tvl: p.tvl_usd > 0 ? round4(p.mcap_usd! / p.tvl_usd) : null,
    }));
}

/** A board row's compact form for data.js, with the farm plan generated in the page. */
export function radarRow(row: BoardRow, onWatchlist: boolean): RadarRow {
  return {
    rank: row.rank,
    slug: row.slug,
    name: row.name,
    category: row.category,
    chains: row.chains,
    tvl_usd: row.tvl_usd,
    change_7d: row.change_7d,
    mcap_usd: row.mcap_usd,
    listed_at: row.listed_at,
    age_days: row.age_days,
    on_watchlist: onWatchlist,
    flag: row.flag,
    flag_reason: row.flag_reason,
    implied_value_usd: row.implied_value_usd,
    fitted_mcap_usd: row.model.fitted_mcap_usd,
    growth_multiplier: row.model.growth_multiplier,
    launch_probability: row.model.launch_probability,
    value_low_usd: row.model.value_low_usd,
    value_high_usd: row.model.value_high_usd,
    value_low90_usd: row.model.value_low90_usd,
    value_high90_usd: row.model.value_high90_usd,
    rank_low: row.model.rank_low,
    rank_high: row.model.rank_high,
    deposit_usd: row.model.deposit_usd,
    drop_usd: row.model.drop_usd,
    gas_usd: row.model.gas_usd,
    tbill_charge_usd: row.model.tbill_charge_usd,
    net_usd: row.model.net_usd,
    net_per_hour_usd: row.model.net_per_hour_usd,
    breakeven_drop_share: row.model.breakeven_drop_share,
    breakeven_25ph_drop_share: row.model.breakeven_25ph_drop_share,
    breakeven_odds: row.model.breakeven_odds,
    hours_worked: row.model.hours_worked,
    hold_days: row.model.hold_days,
    verdict: row.model.verdict,
    priced_peers: row.model.priced_peers,
    farm_steps: row.farm_steps,
  };
}

/** Everything the dashboard renders, from the snapshot. */
export function buildRadar(
  snapshot: Snapshot,
  model: ModelConstants = MODEL,
  coverage: Coverage = 'all',
): { board: BoardRow[]; radar: RadarData } {
  const { board, fit, audit, ledger } = buildBoard(snapshot, model, coverage);
  const live = liveRows(snapshot);
  const early = board.filter((r) => !snapshot.watchlist.includes(r.slug)).length;
  const total = board.reduce((sum, r) => sum + r.implied_value_usd, 0);
  const sortedImplied = board.map((r) => r.implied_value_usd).sort((a, b) => a - b);
  const mid = Math.floor(sortedImplied.length / 2);
  const medianImplied =
    sortedImplied.length % 2 === 1
      ? sortedImplied[mid]!
      : Math.round((sortedImplied[mid - 1]! + sortedImplied[mid]!) / 2);
  const verdictCounts = { farm: 0, thin: 0, skip: 0 };
  for (const r of board) {
    if (r.model.verdict === 'FARM') verdictCounts.farm++;
    else if (r.model.verdict === 'THIN') verdictCounts.thin++;
    else verdictCounts.skip++;
  }
  const totalHoursWorked = Math.round(board.reduce((sum, r) => sum + r.model.hours_worked, 0) * 10) / 10;
  const radar: RadarData = {
    as_of: snapshot.as_of,
    source: snapshot.source,
    floor_usd: snapshot.floor_usd,
    model,
    model_version: MODEL_VERSION,
    coverage,
    watchlist_size: snapshot.watchlist.length,
    board_size: board.length,
    early_size: early,
    live_size: live.length,
    total_implied_usd: total,
    median_implied_usd: medianImplied,
    fit,
    verdict_counts: verdictCounts,
    total_hours_worked: totalHoursWorked,
    ledger,
    audit,
    rows: board.map((r) => radarRow(r, snapshot.watchlist.includes(r.slug))),
    live,
  };
  return { board, radar };
}

/** The snapshot out of a file's text, refused unless it is the shape the model scores. */
export function parseSnapshot(text: string): Snapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SnapshotError('snapshot.json is not JSON');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw))
    throw new SnapshotError('snapshot.json is not a JSON object');
  const o = raw as Record<string, unknown>;
  if (typeof o.as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.as_of))
    throw new SnapshotError('snapshot.json has no as_of date');
  if (typeof o.source !== 'string') throw new SnapshotError('snapshot.json has no source');
  if (typeof o.floor_usd !== 'number' || !Number.isSafeInteger(o.floor_usd) || o.floor_usd <= 0)
    throw new SnapshotError('snapshot.json has no floor_usd');
  if (!Array.isArray(o.protocols)) throw new SnapshotError('snapshot.json has no protocols array');
  if (!Array.isArray(o.watchlist) || o.watchlist.some((s) => typeof s !== 'string'))
    throw new SnapshotError('snapshot.json has no watchlist of slugs');
  const protocols = o.protocols.map((v, i) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v))
      throw new SnapshotError(`snapshot.json's protocol ${i} is not an object`);
    const p = v as Record<string, unknown>;
    if (typeof p.slug !== 'string' || typeof p.name !== 'string' || typeof p.tvl_usd !== 'number' || !Number.isFinite(p.tvl_usd)) {
      throw new SnapshotError(`snapshot.json's protocol ${i} lacks a slug, a name or a TVL`);
    }
    return {
      slug: p.slug,
      name: p.name,
      category: typeof p.category === 'string' ? p.category : null,
      chains: Array.isArray(p.chains) ? p.chains.filter((c): c is string => typeof c === 'string') : [],
      tvl_usd: p.tvl_usd,
      change_7d: typeof p.change_7d === 'number' && Number.isFinite(p.change_7d) ? p.change_7d : null,
      mcap_usd: typeof p.mcap_usd === 'number' && Number.isFinite(p.mcap_usd) ? p.mcap_usd : null,
      listed_at: typeof p.listed_at === 'string' ? p.listed_at : null,
      gecko_id: typeof p.gecko_id === 'string' ? p.gecko_id : null,
      symbol: typeof p.symbol === 'string' ? p.symbol : null,
    };
  });
  return {
    as_of: o.as_of,
    source: o.source,
    floor_usd: o.floor_usd,
    protocols,
    watchlist: o.watchlist as string[],
  };
}

/** Why a board is not one the gate will take, or null: coverage, ranks, order, values, steps. */
export function boardIssue(board: BoardRow[], snapshot: Snapshot): string | null {
  const slugs = new Set(board.map((r) => r.slug));
  const missing = snapshot.watchlist.filter((s) => !slugs.has(s));
  if (missing.length > 0)
    return `the board misses ${missing.length} watchlist slug${missing.length === 1 ? '' : 's'}: ${missing.slice(0, 5).join(', ')}`;
  const ranks = board.map((r) => r.rank).sort((a, b) => a - b);
  for (let i = 0; i < ranks.length; i++) if (ranks[i] !== i + 1) return `rank ${i + 1} is ${ranks[i]}`;
  for (let i = 1; i < board.length; i++)
    if (board[i]!.implied_value_usd > board[i - 1]!.implied_value_usd)
      return `row ${i + 1} outranks row ${i} on implied value`;
  if (board.length >= 2 && board[0]!.implied_value_usd === board[board.length - 1]!.implied_value_usd) {
    return `all ${board.length} rows share the same implied value $${board[0]!.implied_value_usd}: a board that ranks nothing by value is not a ranking`;
  }
  for (const r of board) {
    const steps = r.farm_steps;
    if (steps.length < 3 || steps.length > 12) return `${r.slug} has ${steps.length} farm steps`;
    for (const s of steps)
      if (s.length < 20 || s.length > 600) return `${r.slug} has a farm step of ${s.length} characters`;
    if (!Number.isSafeInteger(r.implied_value_usd) || r.implied_value_usd <= 0)
      return `${r.slug} has implied value ${r.implied_value_usd}`;
  }
  return null;
}

/** A compact data.js: the dashboard's whole dataset as one script, no fetch and no network. */
export function dataScript(radar: RadarData): string {
  return `window.RADAR=${JSON.stringify(radar)};\n`;
}
