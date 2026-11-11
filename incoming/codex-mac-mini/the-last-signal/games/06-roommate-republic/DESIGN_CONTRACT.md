# DESIGN CONTRACT — Game 06: Roommate Republic

**Subtitle**: Incentive Prediction, Experiment & Policy Simulation Lab  
**Brief**: Brief F (Social Science, Policy & Incentive Lab)  
**Primary Reference**: *The Evolution of Trust* (Nicky Case)  
**Supporting Reference**: *Lichess* Post-Game Computer Analysis & Counterfactual Review  

---

## 1. Player Fantasy
You are the **Household Constitutional Architect & Behavioral Economist** for Apartment 4B. Four roommates—**Maya** (Steady Cooperator), **Devon** (Cash-Strapped Grad Student), **Priya** (Power-User Remote Worker), and **Leo** (Opportunistic Optimizer)—are trying to survive a 4-week billing cycle without going broke, freezing in the dark, or tearing their shared lease apart. You inspect their transparent behavioral parameters, commit to a testable prediction on a clip-board ledger, enact a household billing constitution, and audit the resulting double-entry transaction trace like a forensic game-theory analyst.

## 2. Repeated Core Decision
Across **3 household scenarios** and **4 simulated weeks per run**, the player repeatedly:
1. **Inspects** the roommate incentive parameters (`weeklyIncome`, `usageAppetite`, `freeRideTemptation`, `auditSensitivity`, `fairnessThreshold`) and the frozen 4-week external shock schedule.
2. **Commits to a 3-part Prediction** *before* seeing the outcome (Who pays the highest net cost? Does everyone survive the Week 3 surprise shock without a liquidity crunch? Who shifts their behavior the most?).
3. **Selects 1 of 4 Household Policies** (Equal Split, Income-Proportional + 10% Reserve, Self-Reported Usage, or Metered Usage + Chore-Credit Rebate).
4. **Replays the exact same frozen external event schedule** in the **Same-Events Comparison View** under an alternative policy or custom assumption slider to isolate causal policy deltas with zero RNG drift.

## 3. Scarce Resources
1. **Roommate Liquid Cash (`$`)**: Each roommate starts with finite cash (`$250`) and earns a very different weekly income (`$160/wk` for Devon up to `$420/wk` for Priya). If weekly bills + surprise shocks drop a roommate below `$40`, they enter **Liquidity Stress**; below `$0` triggers an **Overdraft Crisis**.
2. **Shared Household Reserve (`$`)**: A collective buffer funded only if the active policy collects reserve contributions. It absorbs Week 3 surprise shocks before roommates have to pay out-of-pocket, at the cost of locking up cash in Weeks 1–2.
3. **Household Trust & Chore Cooperation (`0–100%`)**: When roommates perceive that their bill share exceeds their true consumption + fairness threshold, or when others underreport usage, morale drops and chore shirking increases.

## 4. Failure & Insight Conditions
- **Household Breakdown (Failure State)**: Any roommate falls into overdraft (`< $0`) or severe liquidity stress (`< $40`), OR household average trust collapses below `45%` due to unverified free-riding or perceived billing unfairness.
- **Empirical Insight (Victory State)**: The player tests at least two policies on the **exact same saved External Event Schedule**, verifies why their initial prediction succeeded or failed by inspecting specific `TX-W#` ledger rows, and answers the **3 Debrief Prompts** linking ledger outcomes to explicit model assumptions and limitations.

## 5. Target Session Length
- **8 to 12 minutes** for a full 3-scenario experimental walkthrough (2–3 minutes per scenario: 30s inspection & prediction, 45s 4-week simulation & ledger trace review, 60s side-by-side counterfactual comparison & debrief).

## 6. Two Plausible Policy Hypotheses (Testable in Simulation)
- **Hypothesis A (The Commons Overconsumption & Regressive Burden Hypothesis)**:
  Under **Policy 1: Equal Split (25% each)** in *Scenario 1: The Winter Thermostat Spike*, high-appetite **Priya** and opportunistic **Leo** face only $0.25 of marginal cost per $1.00 of extra heating they consume, inflating total household utility bills, while low-income **Devon** (`$160/wk`) suffers severe liquidity stress in Week 3 despite consuming the least energy.
- **Hypothesis B (The Verification vs. Transaction-Cost Tradeoff Hypothesis)**:
  Under **Policy 3: Self-Reported Usage Billing** in *Scenario 2: The Honor-System Grocery Jar*, **Leo** (`freeRideTemptation = 0.80`) underreports consumption when unverified, shifting an "Unexplained Shortfall Surcharge" onto honest roommates and eroding trust. Switching to **Policy 4: Metered Usage + Chore-Credit Rebate** on the *exact same event schedule* eliminates Leo's underreporting and restrains Priya's consumption, but extracts a fixed `$16/week` (`$64` total) metering/admin fee paid to an external vendor—meaning metering only improves net roommate welfare when baseline free-riding losses exceed `$64`.

## 7. First 60 Seconds User Experience
- **0–15s**: The player lands on the **Roommate Republic Ledger Desk** with **Scenario 1: The Winter Thermostat Spike** loaded. All 4 roommates' cards display their SVG portraits, weekly incomes, and transparent behavioral bars (`Usage Appetite`, `Free-Ride Temptation`, `Audit Sensitivity`, `Fairness Threshold`).
- **15–35s**: In the **Step 1–2 Prediction & Policy Commit Card**, the player selects their prediction for Highest Net Payer, Week 3 Shock Survival, and Primary Behavioral Shift, then picks **Policy 1: Equal Split (25% each)**.
- **35–60s**: The player clicks **"Commit Prediction & Run 4-Week Simulation"**. An animated 4-week timeline steps through Weeks 1–4 (with a crisp cash-register chime each week and an alert bell on the Week 3 Polar Vortex shock), immediately grading the player's prediction against clickable `TX-W#` double-entry ledger rows and unlocking the **Same-Events Policy Comparison View**.

## 8. Out-of-Scope Features (Strict Scope Caps)
- More than 4 roommates or more than 4 simulated weeks per run.
- Unbounded free-text chat or LLM-generated dialogue (all explanations are deterministically generated from actual ledger transactions and model parameter equations).
- Hidden RNG inside policy execution (all external weather/market shocks and Week 3 surprise expenses are frozen once in `ExternalEventSchedule` before any policy runs).
- Presenting simplified behavioral equations as universal truths about real human psychology (every explanation explicitly attributes behavior to the chosen parameter assumptions).

## 9. Playtest Script
1. Launch **Roommate Republic** (`Scenario 1: The Winter Thermostat Spike`, Seed `404`).
2. Inspect the 4 roommate profiles and commit a prediction:
   - Highest Net Payer: `Priya` (or `Devon`)
   - Week 3 Shock Outcome: `Liquidity Crunch (< $40 cash for at least one roommate)`
   - Largest Behavioral Shift: `Priya`
3. Select **Policy 1: Equal Split (25% each)** and click **Run 4-Week Simulation**.
4. Verify in the **Money Conservation Banner** that `Initial Cash + Total Income - Total Expenses === Ending Roommate Cash + Ending Household Reserve` to the exact cent (`$0.00` discrepancy).
5. Read the **Trace-Backed Ledger Explanations** and click a cited transaction chip (e.g., `TX-W3-009`) to highlight the corresponding row in the **Double-Entry Transaction Ledger**.
6. Open the **Same-Events Comparison View**, select **Policy 2: Income-Proportional Split + Shared Reserve (10% buffer)** (or **Policy 4: Metered Usage + Chore-Credit Rebate**), and click **Run Counterfactual on Same Event Schedule**.
7. Observe that the external weather multipliers and Week 3 Surprise Expense are **100% identical**, isolating how Policy 2 protects Devon's cash balance and uses the Shared Reserve to absorb the Week 3 shock.
8. Tweak **Leo's Free-Ride Temptation** slider in the **Editable Assumptions Panel** and re-run to observe how sensitivity changes the outcome.
9. Complete the **3 Debrief Prompts** at the bottom of the lab to synthesize ledger evidence and model limitations.

## 10. Next Experiment
- **Multi-Period Constitutional Voting**: Allow the 4 roommate agents to vote at the end of Week 4 on whether to keep or repeal the player's policy for a second 4-week lease cycle based on their realized net cash delta versus their fairness threshold.
