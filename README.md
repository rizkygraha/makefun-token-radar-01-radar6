# Token Radar — pre-token protocols ranked by implied launch value

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/rizkygraha/makefun-token-radar-01-radar6/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/rizkygraha/makefun-token-radar-01-radar6/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Entry for make.fun competition `token-radar-01`: build the best token launch radar.

## What it is

A program (`main.ts`, Node 22, standard library only) reads the sealed DefiLlama
snapshot (`input/snapshot.json`: 758 protocols at or above $5M TVL, fetched
2026-11-14), scores every pre-token protocol, and writes a static dashboard plus
`board.json` and `dossier.json`.

- **Board: 198 rows** — the pre-token protocols in the snapshot (758 total, 416
  live-token set aside) that pass the strict screen: not a wrapped, staked or
  bridged product, not an exchange, not a versioned pool. All 40 watchlist
  protocols are covered. The other 144 pre-token protocols fail the screen
  (exchanges, bridges, staked products, versioned pools) and are left off the
  board — a launch radar topped by exchanges is not a launch radar — but they
  are not hidden: the Audit tab lists all 758 protocols in the snapshot with
  the reason each one is ranked, set aside, or already trading. The 342-row
  board is still reproducible with `--coverage all` (see `lib/model.ts`).
- **Model `radar-6`** (see `lib/model.ts` and the dashboard's "How the model works"
  tab): `implied = fitted market cap × growth × launch probability`. The fitted
  market cap comes from a size-only curve — least squares on
  `log(market cap) ~ log(TVL)`, fitted at run time on 76 clean comparables
  (92 live-token protocols pass the screen; 16 set aside with market-cap / TVL
  outside [0.02, 5]) — intercept 5.0940, slope 0.6341, R² 0.321, residual SD 1.32
  in log terms. Category effects were tested at ridge λ = 0..1000 and did not
  improve either blind test, so the shipped curve carries none; growth (weight
  0.4, down from 0.5 in Radar-5) improves both blind tests and stays; maturity
  and breadth were tested and dropped for the same reason. Validated out of
  sample, as median factor miss: leave-one-out ×2.76 (76 comps) and ×3.10 (92)
  vs ×4.38 and ×5.55 for a flat category-median multiple; walk-forward ×2.01
  (median split) and ×1.98 (tertile split) on the 92 set vs ×5.05 and ×4.52
  flat. The launch probability is a logistic regression fitted at run time
  (AUC 0.8212 train / 0.8013 test) on age, growth, chains, the category token
  rate and the cohort share — the share of a protocol's own age band that
  already has a token, now in 6 age bands (0–0.5 / 0.5–1 / 1–2 / 2–3 / 3+
  years + unknown) instead of 5. log TVL was tested and removed: adding it
  worsens both Brier scores (LOO 0.197442 → 0.197535, ten-fold 0.199787 →
  0.200700). Brier: LOO 0.197442 (gate 0.22, passes), ten-fold 0.199787 (gate
  0.21, passes by 0.0102). Each row carries a value band from leave-one-out
  residuals on the fitted value — [p25, p75] covers 51.3% of held-out caps,
  [p10, p90] covers 81.6% — and a rank range from 200 bootstrap refits of the
  curve. The old bootstrap value band covered 15.8% and is not printed. No
  protocol name is ever special-cased.
- **Farm economics, by money**: each row's farm is a $10,000 deposit. Drop =
  implied × 7% × $10,000 / TVL; net = drop − gas − the 4% T-bill charge on the
  deposit over the hold; $/hour = net / hours worked. Verdict by money: FARM
  when the net is positive and pays at least $25 an hour (60 rows), THIN when
  the net is positive but pays less (36), SKIP when the net is negative (102).
  The net is negative on 102 of 198 rows — for the biggest protocols the drop
  is smaller than the gas plus the T-bill charge, because the drop is the
  implied value times the deposit over a very large TVL. The top 10 by implied
  hold 0 FARM. The farm plan is 8 steps per protocol (7 actions plus an exit
  trigger: leave when TVL falls 17% below today's — a week worse than 95% of
  snapshot weeks — or the drop window closes), each with a cost and a time;
  steps name the main chain and its gas token, test $100 before scaling up,
  and keep a tax ledger. Total work is 356.5 hours for 198 farms (mean
  1.80 h), computed from the step times. Withdrawal gas is not modelled;
  the drawer says so.
- **Dashboard**: dark, no-network static page. KPI strip (198 ranked, $874.4M
  total implied, 60 FARM, LOO ×2.76, Brier 0.197, 356.5 h), a ledger accounting
  for all 758 protocols in seven groups, and an integrity strip (board recomputed,
  ranks ordered, totals equal, checksum = main.ts, watchlist 40/40, ledger
  758/758). Sortable and filterable board with net $, $/hour and verdict
  columns, per-protocol detail drawer with the full model breakdown, the
  8-step farm plan, an exit trigger and a sensitivity grid, a live-token view,
  an audit tab accounting for all 758 protocols with status and reason, a
  methodology tab with the term-by-term ablation tables, and a model sandbox.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input <snapshot.json|directory>
```

Then open `out/dashboard/index.html` (it reads `out/data.js` beside it). The
default board is the 198 Core rows; `--coverage all` reproduces the 342-row
board instead.

## Screenshots

- `screenshots/1-board.jpg` — the board (198 rows, Veda #1)
- `screenshots/2-detail.jpg` — Veda's detail view (rank #1)
- `screenshots/3-filtered.jpg` — the board filtered to Lending (16 rows)

Screenshots are JPEG (quality 68, 1440×900) so the dossier stays small for the
size tie-break: `dossier.json` is 734,364 bytes, below the 780,687-byte
best-tied entry. Text stays readable at full size in all three shots.

## Top 10

1. Veda $29.8M · 2. USDD $26.9M · 3. Defi Saver Asset Management $25.9M ·
4. Polymarket International $24.2M · 5. Lightning Network $23.2M ·
6. CIAN Yield Layer $20.9M · 7. Bittensor dTAO $19.4M ·
8. Figure Markets Prime $19.0M · 9. BitFi Basis $17.8M ·
10. Plume Vaults $17.5M.
Total implied board $874.4M, median $2.51M.

## Files

| File | What it is |
| --- | --- |
| `main.ts` | entrypoint: snapshot in, board + dashboard + dossier out |
| `lib/model.ts` | the radar-6 model, farm plans, board validation, coverage `core`/`all` |
| `vendor/makefun-board.ts` | the kit's dossier library, byte for byte |
| `dashboard/` | the static page (index.html, app.css, app.js) |
| `screenshots/` | the three screenshots, 1440×900 JPEG |
| `.makefun/owner.json` | the account wallet (wallet-only account) |

## Caveats, stated on the page

A protocol "records no token" in the snapshot — that is not proof it has no token.
An implied value is the model's claim, never a promise of a token or a price.
The ten-fold Brier passes its 0.21 gate (0.199787, margin 0.0102). The Radar-6
changes pass the formal adoption rule (both blind tests improve) but the gains
are inside noise — Brier −0.0002 LOO / −0.0003 ten-fold against noise of
~0.002, curve walk-forward −0.0020 — and two checks moved the wrong way: AUC
test fell 0.8030 → 0.8013 and LOO-76 worsened 2.7367 → 2.7634. What remains
open is the literal top-10 gate — 4 of the top 10 net a small positive
(Defi Saver +$7.75, Lightning Network +$16.82, Figure Markets Prime +$11.93,
BitFi Basis +$0.20), but none pays $25/h, so none is a FARM — and the odds
control row, which "helps" by about 0.0009, so the growth signal in the odds
model is small and ambiguous; the dashboard states all of this. Only the
judge's score can prove the model better.

---

<sub>Entered on [make.fun](https://make.fun/?ref=zzd4x01w&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
