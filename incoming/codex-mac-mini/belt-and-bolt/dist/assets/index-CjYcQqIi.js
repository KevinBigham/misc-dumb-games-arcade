const L={GAME_ID:"06-roommate-republic",GAME_NUMBER:6,TITLE:"Roommate Republic",SUBTITLE:"Incentive Prediction, Experiment & Policy Simulation Lab",ACCENT_COLOR:"#d97706",STORAGE_KEY:"argon_game06_roommate_republic_v1",SCHEMA_VERSION:1,DEFAULT_SEED:202606,WEEKS_PER_RUN:4,SURPRISE_EXPENSE_WEEK:3,INITIAL_ROOMMATE_CASH:120,LIQUIDITY_STRESS_THRESHOLD:40,OVERDRAFT_THRESHOLD:0,POLICY_2_RESERVE_RATE:.1,POLICY_4_WEEKLY_ADMIN_FEE:16,POLICY_4_CHORE_CREDIT_RATE:15,BASE_CHORES_PER_ROOMMATE_PER_WEEK:2,TOTAL_WEEKLY_CHORES:8},w=["maya","devon","priya","leo"],T={maya:{id:"maya",name:"Maya",archetype:"Steady Cooperator — Mid Income, Low Free-Ride",shortLabel:"Steady Cooperator",color:"#d97706",badgeText:"Civic Planner",bio:"Mid-income urban planner ($280/wk). Keeps steady utility habits, reports honestly on honor systems, and completes her 2 weekly kitchen chores reliably unless household trust collapses.",defaultParams:{weeklyIncome:280,usageAppetite:1,freeRideTemptation:.1,auditSensitivity:.75,fairnessThreshold:.7,initialCash:L.INITIAL_ROOMMATE_CASH}},devon:{id:"devon",name:"Devon",archetype:"Cash-Strapped Grad Student — Low Income, High Price Sensitivity",shortLabel:"Grad Student",color:"#059669",badgeText:"Tight Stipend",bio:"Lives on a $145/wk teaching stipend. Uses minimal heat and pantry goods (0.75x appetite) and gladly picks up extra cleaning chores when Policy 4 pays a $15/chore rebate—but faces acute liquidity risk under Equal Split.",defaultParams:{weeklyIncome:145,usageAppetite:.75,freeRideTemptation:.15,auditSensitivity:.9,fairnessThreshold:.55,initialCash:L.INITIAL_ROOMMATE_CASH}},priya:{id:"priya",name:"Priya",archetype:"Power-User Remote Worker — High Income, High Utility Usage",shortLabel:"Power User",color:"#7c3aed",badgeText:"24/7 Home Office",bio:"Senior software contractor ($445/wk) running dual GPU rigs, studio lighting, and a space heater (1.65x appetite). Under Equal Split she only pays 25 cents on the marginal dollar; under Metered Billing she trims excess draw.",defaultParams:{weeklyIncome:445,usageAppetite:1.65,freeRideTemptation:.35,auditSensitivity:.65,fairnessThreshold:.75,initialCash:L.INITIAL_ROOMMATE_CASH}},leo:{id:"leo",name:"Leo",archetype:"Opportunistic Optimizer — Mid-High Income, Underreports When Unverified",shortLabel:"Opportunist",color:"#e11d48",badgeText:"Incentive Hacker",bio:"Freelance growth analyst ($330/wk) who treats household rules strictly as an optimization game (0.85 free-ride temptation). Under Self-Reported Billing he understates his share, shifting a shortfall surcharge onto the house—until sub-meters verify usage.",defaultParams:{weeklyIncome:330,usageAppetite:1.25,freeRideTemptation:.85,auditSensitivity:.85,fairnessThreshold:.6,initialCash:L.INITIAL_ROOMMATE_CASH}}},z={"scenario-1-thermostat":{id:"scenario-1-thermostat",number:1,title:"Scenario 1: The Winter Thermostat Spike",subtitle:"Unequal Usage + Equal-Split Friction",premise:"January cold snaps hit Apartment 4B. Priya works from home with a space heater while Devon wears two sweaters in a cold bedroom. In Week 3, a Polar Vortex spike plus a drafty window repair hits the winter heating bill.",utilityLabel:"Winter Heating & Electric Grid",baseWeeklyBillDollars:520,initialReserveDollars:0,commonsElasticity:.24,surpriseExpenseTemplate:{title:"Week 3 Polar Vortex Surge & Window Seal Emergency",category:"HEATING_SPIKE",baseAmountDollars:240,description:"Sub-zero wind chills trigger peak kilowatt pricing and an urgent weatherstripping service call in Week 3."},defaultPolicyId:"policy-1-equal-split",recommendedComparisonPolicyId:"policy-2-income-reserve",hypothesisPrompt:"Compare how Policy 1 (Equal Split) pools Priya’s high heating draw onto low-income Devon versus how Policy 2 (Income-Proportional + Reserve) or Policy 4 (Metered Usage) redistributes cash flow on the exact same weather schedule."},"scenario-2-grocery-jar":{id:"scenario-2-grocery-jar",number:2,title:"Scenario 2: The Honor-System Grocery Jar",subtitle:"Self-Reported Usage & Underreporting Incentives",premise:"The apartment stocks a shared kitchen pantry, espresso beans, and high-speed fiber bundle. Under the honor jar (Policy 3), each roommate logs their own weekly consumption—and any unpaid gap at the end of the week is split equally as an Unexplained Shortfall Surcharge.",utilityLabel:"Shared Pantry, Espresso & Household Supplies",baseWeeklyBillDollars:480,initialReserveDollars:20,commonsElasticity:.22,surpriseExpenseTemplate:{title:"Week 3 Bulk Pantry & Espresso Machine Descaling Bill",category:"PANTRY_SHORTFALL",baseAmountDollars:200,description:"A quarterly bulk delivery of cold-pressed olive oil, oat milk cases, and espresso grinder replacement burrs arrives in Week 3."},defaultPolicyId:"policy-3-self-reported",recommendedComparisonPolicyId:"policy-4-metered-rebate",hypothesisPrompt:"Test whether Leo’s high Free-Ride Temptation (0.85) under Policy 3 (Self-Reported Billing) costs honest roommates more in Shortfall Surcharges than the fixed $16/wk sub-metering fee under Policy 4."},"scenario-3-boiler-emergency":{id:"scenario-3-boiler-emergency",number:3,title:"Scenario 3: The Week-3 Boiler Emergency",subtitle:"Liquidity Shock vs. Shared Reserve Buffer",premise:"Everything looks manageable in Weeks 1 and 2, tempting the household to keep 100% of their cash in personal pockets with zero shared reserve buffer. Then in Week 3, the basement hot-water boiler valve ruptures, demanding immediate cash settlement.",utilityLabel:"Water, Gas & Basement Boiler Maintenance",baseWeeklyBillDollars:500,initialReserveDollars:40,commonsElasticity:.2,surpriseExpenseTemplate:{title:"Week 3 Burst Hot-Water Boiler Emergency Valve Replacement",category:"BOILER_REPAIR",baseAmountDollars:340,description:"An after-hours plumbing crew replaces a ruptured pressure valve in Week 3, requiring immediate settlement from the Household Reserve or direct roommate cash."},defaultPolicyId:"policy-1-equal-split",recommendedComparisonPolicyId:"policy-2-income-reserve",hypothesisPrompt:"Compare an unbuffered policy (Policy 1 or Policy 3) against Policy 2 (Income-Proportional Split + 10% Shared Reserve) when the $340 boiler repair hits in Week 3."}},ze=[z["scenario-1-thermostat"],z["scenario-2-grocery-jar"],z["scenario-3-boiler-emergency"]],W={"policy-1-equal-split":{id:"policy-1-equal-split",number:1,shortTitle:"Policy 1: Equal Split (25%)",title:"Policy 1: Equal Split (25% Each)",tagline:"Zero admin overhead, but pools overconsumption and strains low-income roommates.",mechanismSummary:"Every weekly utility bill and Week 3 surprise shock is divided 25% / 25% / 25% / 25% regardless of income or actual usage. No shared reserve is collected and no metering fee is charged.",tradeoffWarning:'Because each roommate only pays $0.25 per $1.00 of marginal consumption, high-appetite and high-temptation agents inflate total consumption ("tragedy of the commons"), while low-income Devon bears a regressive cash burden.',marginalPriceSignal:.25,collectsReserveBuffer:!1,allowsUnverifiedUnderreporting:!1,chargesMeteringAdminFee:!1,enablesChoreRebate:!1},"policy-2-income-reserve":{id:"policy-2-income-reserve",number:2,shortTitle:"Policy 2: Income Split + 10% Reserve",title:"Policy 2: Income-Proportional Split + Shared Reserve (10% Buffer)",tagline:"Protects low-income cash flow and buffers Week 3 shocks, at the cost of locking up cash.",mechanismSummary:"Weekly bills are split in proportion to weekly income (Devon ~13.8%, Maya ~23.3%, Leo ~27.1%, Priya ~35.8%). Each week, roommates also contribute an extra 10% buffer into the Shared Household Reserve, which automatically absorbs the Week 3 Surprise Expense first.",tradeoffWarning:"Reduces discretionary cash in Weeks 1–2 by locking funds into the Shared Reserve, and higher-income Priya pays a larger share even if she moderates usage.",marginalPriceSignal:.35,collectsReserveBuffer:!0,allowsUnverifiedUnderreporting:!1,chargesMeteringAdminFee:!1,enablesChoreRebate:!1},"policy-3-self-reported":{id:"policy-3-self-reported",number:3,shortTitle:"Policy 3: Self-Reported Billing",title:"Policy 3: Self-Reported Usage Billing (Honor Jar)",tagline:"Rewards frugal honest users, but invites opportunists to underreport usage.",mechanismSummary:'Roommates pay in proportion to their self-reported usage log. However, each roommate discounts their reported usage by (freeRideTemptation * 52%). The resulting unpaid gap between the vendor bill and self-reported payments is split equally (25% each) as an "Unexplained Shortfall Surcharge".',tradeoffWarning:"When freeRideTemptation is high (e.g. Leo at 0.85), underreporting shifts a heavy Shortfall Surcharge onto honest roommates and rapidly erodes household trust.",marginalPriceSignal:.65,collectsReserveBuffer:!1,allowsUnverifiedUnderreporting:!0,chargesMeteringAdminFee:!1,enablesChoreRebate:!1},"policy-4-metered-rebate":{id:"policy-4-metered-rebate",number:4,shortTitle:"Policy 4: Metered + Chore Rebate",title:"Policy 4: Metered Usage + Chore-Credit Rebate",tagline:"Aligns marginal usage and rewards extra chores, but costs a fixed $16/wk metering fee.",mechanismSummary:"Smart sub-meters verify 100% of each roommate’s true consumption (eliminating underreporting and curbing excess draw via auditSensitivity), plus a $16/week fixed metering/admin fee paid to the external metering vendor. Roommates who do extra chores earn a $15/chore rebate funded by a $15/chore surcharge on shirkers.",tradeoffWarning:"Extracts $16/week ($64 over 4 weeks) in deadweight administrative overhead paid to an external vendor, and does not automatically build a Shared Reserve buffer for Week 3 shocks.",marginalPriceSignal:1,collectsReserveBuffer:!1,allowsUnverifiedUnderreporting:!1,chargesMeteringAdminFee:!0,enablesChoreRebate:!0}},Ne=[W["policy-1-equal-split"],W["policy-2-income-reserve"],W["policy-3-self-reported"],W["policy-4-metered-rebate"]];function Ce(){const l={};for(const a of w)l[a]={...T[a].defaultParams};return{roommates:l,reserveContributionRate:L.POLICY_2_RESERVE_RATE,weeklyMeteringAdminFee:L.POLICY_4_WEEKLY_ADMIN_FEE,choreCreditDollarValue:L.POLICY_4_CHORE_CREDIT_RATE}}function De(l){const a={};for(const e of w)a[e]={...l.roommates[e]};return{roommates:a,reserveContributionRate:l.reserveContributionRate,weeklyMeteringAdminFee:l.weeklyMeteringAdminFee,choreCreditDollarValue:l.choreCreditDollarValue}}const Me=[{id:"debrief-1-commons-vs-reserve",number:1,category:"LEDGER_EVIDENCE",question:"Ledger Audit #1: When comparing Policy 1 (Equal Split) against Policy 2 (Income-Proportional + 10% Reserve) on the exact same Event Schedule, why does Devon’s ending cash improve under Policy 2 despite the extra 10% reserve contributions?",contextHint:"Inspect Devon’s UTILITY_BILL_CONTRIBUTION and SURPRISE_SHOCK_PAYMENT ledger entries across Weeks 1–4.",options:[{id:"opt-1a",label:"Devon’s income share (~13.8% of $1,200 total household income) is much lower than 25%, and the Shared Reserve absorbs the Week 3 surprise shock before out-of-pocket surcharges hit.",isCorrect:!0,explanation:"Correct! Under the model’s income-proportional equation, Devon ($165/wk out of $1,200/wk) pays ~13.8% of bills + reserve buffer rather than a flat 25%, and the accumulated Shared Reserve absorbs the Week 3 Surprise Expense."},{id:"opt-1b",label:"Policy 2 cancels the Week 3 Surprise Expense in the external event schedule so the vendor never bills the household.",isCorrect:!1,explanation:"Incorrect. The External Event Schedule is frozen and identical across policy runs; the Week 3 Surprise Expense still occurs and is paid to the external vendor, but the Household Reserve absorbs it first."},{id:"opt-1c",label:"Policy 2 increases Devon’s weekly stipend from $165/wk to $300/wk in Weeks 3 and 4.",isCorrect:!1,explanation:"Incorrect. Weekly employer inflows (`INCOME_INFLOW`) remain fixed at $165/wk unless you manually edit Devon’s income slider in the Assumptions Panel."}]},{id:"debrief-2-self-report-vs-metering",number:2,category:"COUNTERFACTUAL_CAUSALITY",question:"Ledger Audit #2: Under Policy 3 (Self-Reported Usage Billing), which specific ledger mechanism transfers cost from an opportunistic agent (Leo) onto honest roommates, and what happens to that transfer under Policy 4 (Metered Usage)?",contextHint:"Filter the Transaction Ledger by Week 1–4 for `SHORTFALL_SURCHARGE` vs `ADMIN_METERING_FEE`.",options:[{id:"opt-2a",label:"Leo’s `freeRideTemptation` reduces his self-reported payment, creating an uncollected vendor gap that triggers `SHORTFALL_SURCHARGE` entries split 25% each; Policy 4 eliminates `SHORTFALL_SURCHARGE` but adds `$16/wk` in `ADMIN_METERING_FEE`.",isCorrect:!0,explanation:"Spot on! In our simulation equations, Policy 3 lets `freeRideTemptation` discount reported usage, generating explicit `SHORTFALL_SURCHARGE` ledger rows for all 4 roommates. Policy 4 replaces unverified reporting with exact sub-metering at a fixed `$16/wk` (`$64` total) external fee."},{id:"opt-2b",label:"Policy 3 charges a $50/week fine only to Maya, while Policy 4 refunds all utility bills to $0.",isCorrect:!1,explanation:"Incorrect. The shortfall is caused by the gap between total vendor billing and self-reported payments, which is split across all four roommates as `SHORTFALL_SURCHARGE`."},{id:"opt-2c",label:"Policy 4 generates fresh random weather numbers that happen to be warmer than Policy 3.",isCorrect:!1,explanation:"Incorrect! Both policies read the exact same frozen `ExternalEventSchedule`; the consumption reduction comes strictly from `marginalPriceSignal = 1.0` interacting with each roommate’s `auditSensitivity`."}]},{id:"debrief-3-model-limitations",number:3,category:"MODEL_LIMITATION",question:"Epistemic Humility #3: Which statement best describes an important limitation of this simulation’s mathematical equations compared to a real-world apartment?",contextHint:"Consider what the 5 numerical sliders per roommate capture—and what real social norms or non-monetary dynamics they leave out.",options:[{id:"opt-3a",label:"The simulation assumes deterministic linear/multiplicative responses to price signals and fixed `freeRideTemptation` sliders, omitting real-world verbal negotiation, friendship bonds, intrinsic guilt, or social ostracism outside the ledger.",isCorrect:!0,explanation:"Exactly right. Our agent equations isolate specific economic incentives (marginal cost sharing, reserve buffering, underreporting gaps, and admin overhead), but real roommates also negotiate face-to-face, care about friendship, and adapt norms in ways a 5-parameter equation cannot claim as universal law."},{id:"opt-3b",label:"The simulation equations prove as a universal scientific law that every real-world freelancer named Leo will always underreport 44% of their grocery consumption.",isCorrect:!1,explanation:"Never! A stylized incentive model illustrates conditional *if-then* consequences of explicit assumptions (`freeRideTemptation = 0.85`), not universal truths about real people."},{id:"opt-3c",label:"Money is not conserved in the simulation because utilities disappear without being recorded.",isCorrect:!1,explanation:"Incorrect. Money is strictly conserved to the exact cent in the double-entry ledger (`Initial Cash + Total Income - Total Expenses === Ending Roommate Cash + Ending Household Reserve`). The limitation is behavioral simplification, not accounting drift."}]}];function Ae(l){let a=2166136261;for(let e=0;e<l.length;e++)a^=l.charCodeAt(e),a=Math.imul(a,16777619)>>>0;return a>>>0}class Oe{state;constructor(a){const e=Math.floor(a)>>>0||1831565813;this.state=e}nextFloat(){let a=this.state+=1831565813;return a=Math.imul(a^a>>>15,a|1),a^=a+Math.imul(a^a>>>7,a|61),((a^a>>>14)>>>0)/4294967296}nextRange(a,e){return a+this.nextFloat()*(e-a)}nextInt(a,e){return Math.floor(this.nextRange(a,e+1))}fork(a){const e=(this.state^Ae(a))>>>0;return new Oe(e||1337)}}function ee(l){return Math.round(l*100)}function s(l){return Number((l/100).toFixed(2))}function We(l,a,e){return Math.max(a,Math.min(e,l))}function ve(l,a){const e=Math.max(0,Math.round(l));let i=0;for(const b of w)i+=Math.max(0,a[b]);const c={maya:i>0?Math.max(0,a.maya)/i:.25,devon:i>0?Math.max(0,a.devon)/i:.25,priya:i>0?Math.max(0,a.priya)/i:.25,leo:i>0?Math.max(0,a.leo)/i:.25},h={},o=[];let d=0;w.forEach((b,f)=>{const R=e*c[b],C=Math.floor(R);h[b]=C,d+=C,o.push({id:b,rem:R-C,idx:f})});const E=e-d;o.sort((b,f)=>f.rem!==b.rem?f.rem-b.rem:b.idx-f.idx);for(let b=0;b<E;b++)h[o[b].id]+=1;return h}const tt={"scenario-1-thermostat":["Week 1: Crisp early-January frost; radiator runs steady overnight.","Week 2: Freezing sleet keeps everyone indoors; workstation & heater draw rises.","Week 3: POLAR VORTEX ALERT — Sub-zero gusts + emergency window seal repair!","Week 4: Late-January thaw moderates baseline heating demand."],"scenario-2-grocery-jar":["Week 1: Fresh bulk pantry restock of espresso beans, oat milk, and cooking oils.","Week 2: Busy deadline week; late-night kitchen snacking and coffee pulls accelerate.","Week 3: QUARTERLY RESTOCK SHOCK — Specialty coffee burrs & pantry invoice arrives!","Week 4: End-of-month pantry audit as roommates finish remaining staples."],"scenario-3-boiler-emergency":["Week 1: Routine winter water & gas usage; basement boiler hums quietly.","Week 2: Cold rain increases hot shower draw; pressure gauge ticks slightly upward.","Week 3: BOILER VALVE RUPTURE — Emergency after-hours plumbing crew requires cash!","Week 4: New boiler valve operates efficiently as household settles final month balances."]};function $e(l,a=L.DEFAULT_SEED){const e=typeof l=="string"?z[l]:l,i=Math.floor(a)>>>0,c=new Oe((i^Ae(`schedule:${e.id}`))>>>0),h=[],o=[1,2,3,4];for(const b of o){const f=b===3?1.08:b===2?1.03:b===1?.99:.96,R=(c.nextFloat()-.5)*.06,C=Number((f+R).toFixed(3)),I={};for(const $ of w){const A=(c.nextFloat()-.5)*.06;I[$]=Number(A.toFixed(3))}let D=null;if(b===L.SURPRISE_EXPENSE_WEEK){const $=c.nextInt(-2,3)*4,A=e.surpriseExpenseTemplate.baseAmountDollars+$;D={id:`SHOCK-W3-${e.id.toUpperCase()}`,week:3,title:e.surpriseExpenseTemplate.title,category:e.surpriseExpenseTemplate.category,amountDollars:A,description:e.surpriseExpenseTemplate.description}}h.push({week:b,weatherOrDemandIndex:C,ambientNote:tt[e.id][b-1],roommateExogenousNoise:I,surpriseExpense:D})}const d=JSON.stringify({scenarioId:e.id,seed:i,weeks:h}),E=`SIG-${e.id}-${i}-${Ae(d).toString(16)}`;return Object.freeze({scheduleId:`sched-${e.id}-${i}`,scenarioId:e.id,seed:i,scheduleSignature:E,weeks:Object.freeze(h)})}function Pe(l,a,e,i){const c=typeof l=="string"?z[l]:l,h=typeof a=="string"?W[a]:a,o=De(e),d=[],E=[],b=[],f={maya:ee(o.roommates.maya.initialCash),devon:ee(o.roommates.devon.initialCash),priya:ee(o.roommates.priya.initialCash),leo:ee(o.roommates.leo.initialCash)},R=f.maya+f.devon+f.priya+f.leo;let C=ee(c.initialReserveDollars);const I=C,D={maya:82,devon:80,priya:82,leo:78};let $=0;const A=p=>($+=1,`TX-W${p}-${String($).padStart(3,"0")}`),v={};for(const p of w)v[p]={totalIncomeCents:0,totalTrueUtilityCents:0,totalReportedUtilityCents:0,totalUnderreportedCents:0,totalCommonsAddedCents:0,totalMeteredSavedCents:0,totalUtilityBillPaidCents:0,totalShortfallPaidCents:0,totalReservePaidCents:0,totalSurprisePaidCents:0,totalAdminFeePaidCents:0,totalChoreRebateNetCents:0,minWeeklyCashCents:f[p],experiencedLiquidityStress:s(f[p])<L.LIQUIDITY_STRESS_THRESHOLD,experiencedOverdraft:s(f[p])<L.OVERDRAFT_THRESHOLD,totalChoresCompleted:0};const _={maya:1,devon:1,priya:1,leo:1},H={maya:Math.max(1,o.roommates.maya.weeklyIncome),devon:Math.max(1,o.roommates.devon.weeklyIncome),priya:Math.max(1,o.roommates.priya.weeklyIncome),leo:Math.max(1,o.roommates.leo.weeklyIncome)};for(const p of i.weeks){const n=p.week,Y={...f},le={maya:0,devon:0,priya:0,leo:0};for(const r of w){const u=ee(o.roommates[r].weeklyIncome);le[r]=u,f[r]+=u,v[r].totalIncomeCents+=u,d.push({id:A(n),week:n,type:"INCOME_INFLOW",flowCategory:"EXTERNAL_INFLOW",fromAccount:"EXTERNAL_EMPLOYER",toAccount:`ROOMMATE:${r}`,amount:s(u),amountCents:u,roommateId:r,description:`${T[r].name} receives Week ${n} income ($${s(u).toFixed(2)}).`,assumptionDrivers:[`${r}.weeklyIncome=$${o.roommates[r].weeklyIncome}/wk`]})}const J=.25*c.baseWeeklyBillDollars*p.weatherOrDemandIndex,N={maya:0,devon:0,priya:0,leo:0},fe={maya:0,devon:0,priya:0,leo:0},K={maya:0,devon:0,priya:0,leo:0};for(const r of w){const u=o.roommates[r],m=p.roommateExogenousNoise[r]??0,y=Math.max(.35,u.usageAppetite+m),U=J*y,q=Math.max(0,1-h.marginalPriceSignal)*c.commonsElasticity*(.55*u.freeRideTemptation+.45*Math.max(0,u.usageAppetite-.85))*2.1,ie=U*q,Ee=h.chargesMeteringAdminFee||h.marginalPriceSignal>=.95?.16*u.auditSensitivity:0,Re=U*Ee,Te=Math.max(20,U+ie-Re);N[r]=ee(Te),fe[r]=ee(ie),K[r]=ee(Re),v[r].totalTrueUtilityCents+=N[r],v[r].totalCommonsAddedCents+=fe[r],v[r].totalMeteredSavedCents+=K[r]}const X=N.maya+N.devon+N.priya+N.leo,ae={maya:0,devon:0,priya:0,leo:0},ye={maya:N.maya,devon:N.devon,priya:N.priya,leo:N.leo},ne={maya:0,devon:0,priya:0,leo:0},me={maya:0,devon:0,priya:0,leo:0};if(h.id==="policy-1-equal-split"){const r=ve(X,_);for(const u of w)ae[u]=r[u],f[u]-=r[u],v[u].totalUtilityBillPaidCents+=r[u],v[u].totalReportedUtilityCents+=ye[u],d.push({id:A(n),week:n,type:"UTILITY_BILL_CONTRIBUTION",flowCategory:"INTERNAL_TRANSFER",fromAccount:`ROOMMATE:${u}`,toAccount:"HOUSEHOLD_POT",amount:s(r[u]),amountCents:r[u],roommateId:u,description:`${T[u].name} pays 25% Equal Split of Week ${n} utility bill ($${s(r[u]).toFixed(2)}; true usage was $${s(N[u]).toFixed(2)}).`,assumptionDrivers:["policy=Equal Split (25% share)",`${u}.usageAppetite=${o.roommates[u].usageAppetite.toFixed(2)}`,`marginalPriceSignal=${h.marginalPriceSignal}`]})}else if(h.id==="policy-2-income-reserve"){const r=ve(X,H),u=H.maya+H.devon+H.priya+H.leo;for(const m of w){const y=(H[m]/u*100).toFixed(1);ae[m]=r[m],f[m]-=r[m],v[m].totalUtilityBillPaidCents+=r[m],v[m].totalReportedUtilityCents+=ye[m],d.push({id:A(n),week:n,type:"UTILITY_BILL_CONTRIBUTION",flowCategory:"INTERNAL_TRANSFER",fromAccount:`ROOMMATE:${m}`,toAccount:"HOUSEHOLD_POT",amount:s(r[m]),amountCents:r[m],roommateId:m,description:`${T[m].name} pays ${y}% Income-Proportional share of Week ${n} utility bill ($${s(r[m]).toFixed(2)}).`,assumptionDrivers:[`policy=Income-Proportional Split (${y}%)`,`${m}.weeklyIncome=$${o.roommates[m].weeklyIncome}/wk`]})}}else if(h.id==="policy-3-self-reported"){let r=0;for(const m of w){const y=o.roommates[m],U=We(y.freeRideTemptation*.52*(1-.3*y.auditSensitivity),0,.6),pe=Math.round(N[m]*U),q=Math.max(0,N[m]-pe);ye[m]=q,ne[m]=pe,ae[m]=q,r+=q,f[m]-=q,v[m].totalUtilityBillPaidCents+=q,v[m].totalReportedUtilityCents+=q,v[m].totalUnderreportedCents+=pe,d.push({id:A(n),week:n,type:"UTILITY_BILL_CONTRIBUTION",flowCategory:"INTERNAL_TRANSFER",fromAccount:`ROOMMATE:${m}`,toAccount:"HOUSEHOLD_POT",amount:s(q),amountCents:q,roommateId:m,description:`${T[m].name} self-reports $${s(q).toFixed(2)} of Week ${n} usage (true usage $${s(N[m]).toFixed(2)}, underreported gap $${s(pe).toFixed(2)}).`,assumptionDrivers:["policy=Self-Reported Usage Billing (unverified)",`${m}.freeRideTemptation=${y.freeRideTemptation.toFixed(2)}`,`${m}.auditSensitivity=${y.auditSensitivity.toFixed(2)}`]})}const u=Math.max(0,X-r);if(u>0){const m=ve(u,_);for(const y of w)me[y]=m[y],f[y]-=m[y],v[y].totalShortfallPaidCents+=m[y],d.push({id:A(n),week:n,type:"SHORTFALL_SURCHARGE",flowCategory:"INTERNAL_TRANSFER",fromAccount:`ROOMMATE:${y}`,toAccount:"HOUSEHOLD_POT",amount:s(m[y]),amountCents:m[y],roommateId:y,description:`${T[y].name} pays 25% of Week ${n} Unexplained Shortfall Surcharge ($${s(m[y]).toFixed(2)} of $${s(u).toFixed(2)} uncollected gap).`,assumptionDrivers:["policy=Self-Reported Shortfall Split (25% each)",`leo.freeRideTemptation=${o.roommates.leo.freeRideTemptation.toFixed(2)}`]})}}else for(const r of w){const u=N[r];ae[r]=u,ye[r]=u,f[r]-=u,v[r].totalUtilityBillPaidCents+=u,v[r].totalReportedUtilityCents+=u,d.push({id:A(n),week:n,type:"UTILITY_BILL_CONTRIBUTION",flowCategory:"INTERNAL_TRANSFER",fromAccount:`ROOMMATE:${r}`,toAccount:"HOUSEHOLD_POT",amount:s(u),amountCents:u,roommateId:r,description:`${T[r].name} pays exact sub-metered Week ${n} usage ($${s(u).toFixed(2)}; saved $${s(K[r]).toFixed(2)} via metered price response).`,assumptionDrivers:["policy=Metered Usage (100% marginal price signal)",`${r}.usageAppetite=${o.roommates[r].usageAppetite.toFixed(2)}`,`${r}.auditSensitivity=${o.roommates[r].auditSensitivity.toFixed(2)}`]})}d.push({id:A(n),week:n,type:"UTILITY_VENDOR_PAYMENT",flowCategory:"EXTERNAL_OUTFLOW",fromAccount:"HOUSEHOLD_POT",toAccount:"EXTERNAL_UTILITY_VENDOR",amount:s(X),amountCents:X,description:`Household Pot settles Week ${n} ${c.utilityLabel} invoice ($${s(X).toFixed(2)}) with external utility vendor.`,assumptionDrivers:[`weatherOrDemandIndex=${p.weatherOrDemandIndex}`,`baseWeeklyBill=$${c.baseWeeklyBillDollars}`]});const ge={maya:0,devon:0,priya:0,leo:0};if(h.collectsReserveBuffer&&o.reserveContributionRate>0){const r=Math.round(X*o.reserveContributionRate),u=ve(r,H);for(const m of w){const y=u[m];ge[m]=y,f[m]-=y,C+=y,v[m].totalReservePaidCents+=y,d.push({id:A(n),week:n,type:"RESERVE_CONTRIBUTION",flowCategory:"INTERNAL_TRANSFER",fromAccount:`ROOMMATE:${m}`,toAccount:"HOUSEHOLD_RESERVE",amount:s(y),amountCents:y,roommateId:m,description:`${T[m].name} contributes $${s(y).toFixed(2)} into the Shared Household Reserve (${Math.round(o.reserveContributionRate*100)}% buffer).`,assumptionDrivers:[`policy=Shared Reserve Buffer (${Math.round(o.reserveContributionRate*100)}%)`,`${m}.weeklyIncome=$${o.roommates[m].weeklyIncome}/wk`]})}}const we={maya:0,devon:0,priya:0,leo:0};if(h.chargesMeteringAdminFee&&o.weeklyMeteringAdminFee>0){const r=ee(o.weeklyMeteringAdminFee),u=ve(r,_);for(const m of w){const y=u[m];we[m]=y,f[m]-=y,v[m].totalAdminFeePaidCents+=y,d.push({id:A(n),week:n,type:"ADMIN_METERING_FEE",flowCategory:"EXTERNAL_OUTFLOW",fromAccount:`ROOMMATE:${m}`,toAccount:"EXTERNAL_ADMIN_VENDOR",amount:s(y),amountCents:y,roommateId:m,description:`${T[m].name} pays $${s(y).toFixed(2)} share of Week ${n} smart sub-metering & chore-ledger admin fee.`,assumptionDrivers:[`policy=Metered Usage Admin Fee ($${o.weeklyMeteringAdminFee}/wk)`]})}}const de={maya:0,devon:0,priya:0,leo:0};let se=0,Q=0;if(p.surpriseExpense){se=ee(p.surpriseExpense.amountDollars),Q=Math.min(C,se),Q>0&&(C-=Q,d.push({id:A(n),week:n,type:"RESERVE_WITHDRAWAL",flowCategory:"INTERNAL_TRANSFER",fromAccount:"HOUSEHOLD_RESERVE",toAccount:"HOUSEHOLD_POT",amount:s(Q),amountCents:Q,description:`Shared Household Reserve absorbs $${s(Q).toFixed(2)} of ${p.surpriseExpense.title}.`,assumptionDrivers:[`surpriseExpense=$${p.surpriseExpense.amountDollars}`,`availableReserve=$${s(Q+C).toFixed(2)}`]}));const r=se-Q;if(r>0){const u=h.id==="policy-2-income-reserve"?H:_,m=ve(r,u);for(const y of w){const U=m[y];de[y]=U,f[y]-=U,v[y].totalSurprisePaidCents+=U,d.push({id:A(n),week:n,type:"SURPRISE_SHOCK_CONTRIBUTION",flowCategory:"INTERNAL_TRANSFER",fromAccount:`ROOMMATE:${y}`,toAccount:"HOUSEHOLD_POT",amount:s(U),amountCents:U,roommateId:y,description:`${T[y].name} pays $${s(U).toFixed(2)} out-of-pocket toward uncovered Week 3 Surprise Expense (${p.surpriseExpense.title}).`,assumptionDrivers:[`surpriseExpense=${p.surpriseExpense.id}`,`uncoveredAfterReserve=$${s(r).toFixed(2)}`,`policy=${h.shortTitle}`]})}}d.push({id:A(n),week:n,type:"SURPRISE_VENDOR_PAYMENT",flowCategory:"EXTERNAL_OUTFLOW",fromAccount:"HOUSEHOLD_POT",toAccount:"EXTERNAL_REPAIR_VENDOR",amount:s(se),amountCents:se,description:`Household Pot pays $${s(se).toFixed(2)} to external vendor for ${p.surpriseExpense.title}.`,assumptionDrivers:[`eventSchedule.surpriseExpense=$${p.surpriseExpense.amountDollars} (frozen seed=${i.seed})`]})}const oe={maya:0,devon:0,priya:0,leo:0},Z=w.map(r=>{const u=o.roommates[r],m=u.auditSensitivity*.75-u.freeRideTemptation*.7+(320-u.weeklyIncome)/900;return{id:r,score:m}}).sort((r,u)=>u.score-r.score),be={maya:0,devon:0,priya:0,leo:0};if(h.enablesChoreRebate&&o.choreCreditDollarValue>0){const r=ee(o.choreCreditDollarValue),u=Z[0].id,m=Z[3].id;Z[0].score-Z[3].score>=.15&&(be[u]=1,be[m]=-1,f[m]-=r,f[u]+=r,oe[u]+=r,oe[m]-=r,v[u].totalChoreRebateNetCents+=r,v[m].totalChoreRebateNetCents-=r,d.push({id:A(n),week:n,type:"CHORE_REBATE_TRANSFER",flowCategory:"INTERNAL_TRANSFER",fromAccount:`ROOMMATE:${m}`,toAccount:`ROOMMATE:${u}`,amount:s(r),amountCents:r,roommateId:u,counterpartyRoommateId:m,description:`${T[m].name} pays $${s(r).toFixed(2)} Chore-Credit Rebate to ${T[u].name} for covering 1 extra kitchen/cleaning chore in Week ${n}.`,assumptionDrivers:[`policy=Chore-Credit Rebate ($${o.choreCreditDollarValue}/chore)`,`${u}.auditSensitivity=${o.roommates[u].auditSensitivity.toFixed(2)}`,`${m}.freeRideTemptation=${o.roommates[m].freeRideTemptation.toFixed(2)}`]}));const y=Z[1].id,U=Z[2].id;Z[1].score-Z[2].score>=.25&&(be[y]=1,be[U]=-1,f[U]-=r,f[y]+=r,oe[y]+=r,oe[U]-=r,v[y].totalChoreRebateNetCents+=r,v[U].totalChoreRebateNetCents-=r,d.push({id:A(n),week:n,type:"CHORE_REBATE_TRANSFER",flowCategory:"INTERNAL_TRANSFER",fromAccount:`ROOMMATE:${U}`,toAccount:`ROOMMATE:${y}`,amount:s(r),amountCents:r,roommateId:y,counterpartyRoommateId:U,description:`${T[U].name} pays $${s(r).toFixed(2)} Chore-Credit Rebate to ${T[y].name} for covering 1 extra kitchen/cleaning chore in Week ${n}.`,assumptionDrivers:[`policy=Chore-Credit Rebate ($${o.choreCreditDollarValue}/chore)`,`${y}.auditSensitivity=${o.roommates[y].auditSensitivity.toFixed(2)}`,`${U}.freeRideTemptation=${o.roommates[U].freeRideTemptation.toFixed(2)}`]}))}else{const r=Z[0].id,u=Z[3].id;o.roommates[u].freeRideTemptation>=.55&&(be[r]=1,be[u]=-1)}const Ue={};for(const r of w){const u=L.BASE_CHORES_PER_ROOMMATE_PER_WEEK,m=be[r],y=u+m;v[r].totalChoresCompleted+=y;const U=ae[r]+me[r]+ge[r]+de[r]+we[r]-oe[r],pe=(ae[r]+me[r]-N[r])/Math.max(100,N[r]),q=(1-o.roommates[r].fairnessThreshold)*.35;let ie=0;pe>q?ie-=Math.round((pe-q)*28):ie+=2,me[r]>0&&ne[r]<me[r]&&(ie-=6),m>0&&!h.enablesChoreRebate?ie-=5:m>0&&h.enablesChoreRebate&&(ie+=3),s(f[r])<L.LIQUIDITY_STRESS_THRESHOLD&&(ie-=8),D[r]=We(D[r]+ie,15,100),E.push({id:`CHORE-W${n}-${r.toUpperCase()}`,week:n,roommateId:r,targetChores:u,completedChores:y,choreDelta:m,rebateOrPenaltyDollars:s(oe[r]),trustDelta:ie,note:m>0?h.enablesChoreRebate?`Completed ${y} chores (+1 extra) and earned +$${s(oe[r]).toFixed(2)} chore rebate.`:`Completed ${y} chores (+1 extra unpaid cover for shirked chore).`:m<0?h.enablesChoreRebate?`Completed ${y} chore (-1) and paid $${Math.abs(s(oe[r])).toFixed(2)} chore rebate to housemate.`:`Completed ${y} chore (-1 shirked without financial penalty).`:`Completed standard ${y} weekly chores.`});const Ee=s(f[r]),Re=Ee<L.LIQUIDITY_STRESS_THRESHOLD,Te=Ee<L.OVERDRAFT_THRESHOLD;f[r]<v[r].minWeeklyCashCents&&(v[r].minWeeklyCashCents=f[r]),Re&&(v[r].experiencedLiquidityStress=!0),Te&&(v[r].experiencedOverdraft=!0),Ue[r]={roommateId:r,week:n,startingCash:s(Y[r]),incomeReceived:s(le[r]),trueUtilityConsumption:s(N[r]),reportedUtilityConsumption:s(ye[r]),underreportedGap:s(ne[r]),commonsOverconsumptionAdded:s(fe[r]),meteredConservationSaved:s(K[r]),utilityBillPaid:s(ae[r]),shortfallSurchargePaid:s(me[r]),reserveContributionPaid:s(ge[r]),surpriseShockPaid:s(de[r]),adminFeePaid:s(we[r]),choreRebateNet:s(oe[r]),totalOutOfPocketPaid:s(U),endingCash:Ee,inLiquidityStress:Re,inOverdraft:Te,endingTrust:D[r]}}const Qe=ne.maya+ne.devon+ne.priya+ne.leo,Ze=f.maya+f.devon+f.priya+f.leo,et=Number(((D.maya+D.devon+D.priya+D.leo)/4).toFixed(1));b.push({week:n,weatherOrDemandIndex:p.weatherOrDemandIndex,ambientNote:p.ambientNote,totalUtilityBill:s(X),totalUnderreportedGap:s(Qe),surpriseExpenseAmount:s(se),reserveUsedForSurprise:s(Q),endingHouseholdReserve:s(C),endingTotalRoommateCash:s(Ze),averageHouseholdTrust:et,roommateStates:Ue})}const P={};let B="priya",ue=-1/0,k="priya",M=-1/0;for(const p of w){const n=v[p],Y=n.totalUtilityBillPaidCents+n.totalShortfallPaidCents+n.totalReservePaidCents+n.totalSurprisePaidCents+n.totalAdminFeePaidCents-n.totalChoreRebateNetCents;Y>ue&&(ue=Y,B=p);const le=n.totalCommonsAddedCents+n.totalUnderreportedCents+n.totalMeteredSavedCents+Math.abs(n.totalChoreRebateNetCents);le>M&&(M=le,k=p);let J="Steady baseline consumption";n.totalUnderreportedCents>2500?J=`Underreported $${s(n.totalUnderreportedCents).toFixed(2)} under unverified billing`:n.totalCommonsAddedCents>3500?J=`Added $${s(n.totalCommonsAddedCents).toFixed(2)} in unpriced commons draw`:n.totalChoreRebateNetCents>0?J=`Earned +$${s(n.totalChoreRebateNetCents).toFixed(2)} in extra chore rebates & saved $${s(n.totalMeteredSavedCents).toFixed(2)} via metering`:n.totalMeteredSavedCents>2e3&&(J=`Curbed usage by $${s(n.totalMeteredSavedCents).toFixed(2)} under 100% metered price signal`),P[p]={roommateId:p,name:T[p].name,initialCash:o.roommates[p].initialCash,totalIncome:s(n.totalIncomeCents),totalTrueUtilityConsumption:s(n.totalTrueUtilityCents),totalReportedUtilityConsumption:s(n.totalReportedUtilityCents),totalUnderreportedGap:s(n.totalUnderreportedCents),totalCommonsOverconsumption:s(n.totalCommonsAddedCents),totalMeteredConservationSaved:s(n.totalMeteredSavedCents),totalUtilityBillPaid:s(n.totalUtilityBillPaidCents),totalShortfallSurchargePaid:s(n.totalShortfallPaidCents),totalReserveContributionPaid:s(n.totalReservePaidCents),totalSurpriseShockPaid:s(n.totalSurprisePaidCents),totalAdminFeePaid:s(n.totalAdminFeePaidCents),totalChoreRebateNet:s(n.totalChoreRebateNetCents),totalOutOfPocketPaid:s(Y),behavioralShiftMagnitude:s(le),primaryBehavioralDriver:J,endingCash:s(f[p]),minWeeklyCash:s(n.minWeeklyCashCents),experiencedLiquidityStress:n.experiencedLiquidityStress,experiencedOverdraft:n.experiencedOverdraft,endingTrust:D[p],totalChoresCompleted:n.totalChoresCompleted}}const V=d.filter(p=>p.flowCategory==="EXTERNAL_INFLOW").reduce((p,n)=>p+n.amountCents,0),ke=d.filter(p=>p.flowCategory==="EXTERNAL_OUTFLOW").reduce((p,n)=>p+n.amountCents,0),he=f.maya+f.devon+f.priya+f.leo,S=C,g=R+I,O=g+V,x=ke,j=O-x,te=he+S,ce=j-te,re={initialRoommateCash:s(R),initialHouseholdReserve:s(I),initialCash:s(g),totalIncome:s(V),totalExpenses:s(ke),totalInflows:s(O),totalOutflows:s(x),endingRoommateCash:s(he),endingHouseholdReserve:s(S),finalRoommateCash:s(he),finalHouseholdReserve:s(S),expectedEndingTotal:s(j),actualEndingTotal:s(te),discrepancyCents:ce,discrepancyDollars:s(ce),isConserved:ce===0},Se=w.some(p=>P[p].experiencedLiquidityStress),G=w.some(p=>P[p].experiencedOverdraft),t=b[b.length-1].averageHouseholdTrust,F={scenarioId:c.id,policyId:h.id,seed:i.seed,scheduleSignature:i.scheduleSignature,eventSchedule:i,assumptions:o,transactions:d,choreLedger:E,weeklySnapshots:b,roommateSummaries:P,conservation:re,explanations:[],highestNetPayerId:B,largestBehavioralShiftId:k,anyLiquidityStress:Se,anyOverdraft:G,endingAverageTrust:t};return F.explanations=je(F),F}function je(l){const{policyId:a,roommateSummaries:e,transactions:i,assumptions:c}=l,h=W[a],o=[],d=i.filter($=>$.roommateId==="devon"&&$.type==="UTILITY_BILL_CONTRIBUTION").map($=>$.id),E=i.filter($=>$.roommateId==="priya"&&$.type==="UTILITY_BILL_CONTRIBUTION").map($=>$.id),b=e[l.highestNetPayerId],f=e.devon;if(o.push({id:"EXP-BILLING-BURDEN",category:"BILLING_SPLIT",headline:`Billing Distribution: ${b.name} paid the highest net total ($${b.totalOutOfPocketPaid.toFixed(2)}); Devon ended at $${f.endingCash.toFixed(2)} cash`,statement:`In the recorded ledger (${[...d.slice(0,2),...E.slice(0,2)].join(", ")}), ${h.shortTitle} resulted in ${b.name} paying $${b.totalOutOfPocketPaid.toFixed(2)} out-of-pocket over 4 weeks while Devon paid $${f.totalOutOfPocketPaid.toFixed(2)} on a $${c.roommates.devon.weeklyIncome}/wk income. Under our model’s billing equation (${h.id}), Devon’s minimum weekly cash reached $${f.minWeeklyCash.toFixed(2)} (${f.experiencedLiquidityStress?"triggering Liquidity Stress < $40":"remaining above the $40 stress threshold"}).`,transactionIds:[...d,...E],assumptionRefs:[`devon.weeklyIncome=$${c.roommates.devon.weeklyIncome}/wk`,`priya.weeklyIncome=$${c.roommates.priya.weeklyIncome}/wk`,`priya.usageAppetite=${c.roommates.priya.usageAppetite.toFixed(2)}`,`policy=${h.id}`],modelLimitationNote:"Model Assumption Note: This cash trajectory follows deterministically from fixed weekly incomes and the selected billing formula; real roommates might renegotiate mid-month or lend cash informally outside the formal ledger."}),a==="policy-3-self-reported"){const $=i.filter(_=>_.type==="SHORTFALL_SURCHARGE").map(_=>_.id),A=i.filter(_=>_.roommateId==="leo"&&_.type==="UTILITY_BILL_CONTRIBUTION").map(_=>_.id),v=[...A.slice(0,2),...$.slice(0,2)];o.push({id:"EXP-INCENTIVE-UNDERREPORT",category:"BEHAVIORAL_INCENTIVE",headline:`Unverified Reporting Gap: $${(e.maya.totalUnderreportedGap+e.devon.totalUnderreportedGap+e.priya.totalUnderreportedGap+e.leo.totalUnderreportedGap).toFixed(2)} shifted via Shortfall Surcharges`,statement:`Because Policy 3 uses unverified self-reporting, our agent equation discounts reported usage by (freeRideTemptation * 0.52 * (1 - 0.30 * auditSensitivity)). Leo (freeRideTemptation=${c.roommates.leo.freeRideTemptation.toFixed(2)}) underreported $${e.leo.totalUnderreportedGap.toFixed(2)} across ${A.join(", ")}, forcing the household to cover an Unexplained Shortfall Surcharge across ${$.slice(0,4).join(", ")}.`,transactionIds:v.length>0?v:A,assumptionRefs:[`leo.freeRideTemptation=${c.roommates.leo.freeRideTemptation.toFixed(2)}`,`leo.auditSensitivity=${c.roommates.leo.auditSensitivity.toFixed(2)}`,"policy.allowsUnverifiedUnderreporting=true"],modelLimitationNote:"Model Assumption Note: The underreporting gap is a conditional consequence of setting Leo’s `freeRideTemptation` slider to a high value in an unverified equation—not a claim that all real roommates cheat on honor jars."})}else if(a==="policy-4-metered-rebate"){const $=i.filter(_=>_.type==="ADMIN_METERING_FEE").map(_=>_.id),A=e.maya.totalMeteredConservationSaved+e.devon.totalMeteredConservationSaved+e.priya.totalMeteredConservationSaved+e.leo.totalMeteredConservationSaved,v=e.maya.totalAdminFeePaid+e.devon.totalAdminFeePaid+e.priya.totalAdminFeePaid+e.leo.totalAdminFeePaid;o.push({id:"EXP-INCENTIVE-METERED",category:"BEHAVIORAL_INCENTIVE",headline:`Metered Verification vs. Admin Overhead: Saved $${A.toFixed(2)} in usage at a $${v.toFixed(2)} metering fee`,statement:`Under Policy 4, setting marginalPriceSignal=1.0 caused roommates to curb consumption by $${A.toFixed(2)} via their auditSensitivity parameters while eliminating underreporting. However, ledger entries ${$.slice(0,4).join(", ")} record $${v.toFixed(2)} paid to EXTERNAL_ADMIN_VENDOR ($${c.weeklyMeteringAdminFee}/wk fixed fee).`,transactionIds:$,assumptionRefs:["policy.marginalPriceSignal=1.0",`weeklyMeteringAdminFee=$${c.weeklyMeteringAdminFee}/wk`,`priya.auditSensitivity=${c.roommates.priya.auditSensitivity.toFixed(2)}`],modelLimitationNote:"Model Assumption Note: In this stylized equation, sub-metering has zero measurement error and a flat weekly fee; real smart-home sub-meters cannot easily separate shared refrigerator or hallway heat draw."})}else{const $=i.filter(v=>v.type==="UTILITY_VENDOR_PAYMENT").map(v=>v.id),A=e.maya.totalCommonsOverconsumption+e.devon.totalCommonsOverconsumption+e.priya.totalCommonsOverconsumption+e.leo.totalCommonsOverconsumption;o.push({id:"EXP-INCENTIVE-COMMONS",category:"BEHAVIORAL_INCENTIVE",headline:`Pooled Marginal Cost Effect: +$${A.toFixed(2)} in unpriced commons consumption`,statement:`Because ${h.shortTitle} sets marginalPriceSignal=${h.marginalPriceSignal.toFixed(2)} (each roommate pays only ${Math.round(h.marginalPriceSignal*100)} cents on an extra dollar of consumption), our model’s commons-elasticity term added $${A.toFixed(2)} to vendor utility invoices (${$.join(", ")}), led by Priya ($${e.priya.totalCommonsOverconsumption.toFixed(2)}) and Leo ($${e.leo.totalCommonsOverconsumption.toFixed(2)}).`,transactionIds:$,assumptionRefs:[`policy.marginalPriceSignal=${h.marginalPriceSignal}`,`priya.usageAppetite=${c.roommates.priya.usageAppetite.toFixed(2)}`,`leo.freeRideTemptation=${c.roommates.leo.freeRideTemptation.toFixed(2)}`],modelLimitationNote:'Model Assumption Note: This "tragedy of the commons" inflation is driven by our multiplicative price-elasticity equation; real roommates may conserve energy out of environmental values even when bills are split equally.'})}const R=i.filter($=>$.type==="RESERVE_WITHDRAWAL"||$.type==="SURPRISE_SHOCK_CONTRIBUTION"||$.type==="SURPRISE_VENDOR_PAYMENT").map($=>$.id),C=l.weeklySnapshots[2];o.push({id:"EXP-WEEK3-SHOCK",category:"SURPRISE_SHOCK",headline:`Week 3 Surprise Expense ($${C.surpriseExpenseAmount.toFixed(2)}): $${C.reserveUsedForSurprise.toFixed(2)} buffered by Reserve`,statement:`When the frozen Week 3 Surprise Expense hit (${R.join(", ")}), the Shared Household Reserve absorbed $${C.reserveUsedForSurprise.toFixed(2)} first, leaving $${(C.surpriseExpenseAmount-C.reserveUsedForSurprise).toFixed(2)} to be paid out-of-pocket by roommates during Week 3.`,transactionIds:R,assumptionRefs:[`policy.collectsReserveBuffer=${h.collectsReserveBuffer}`,`reserveContributionRate=${Math.round(c.reserveContributionRate*100)}%`,`eventSchedule.week3Surprise=$${C.surpriseExpenseAmount.toFixed(2)}`],modelLimitationNote:"Model Assumption Note: The model treats the Week 3 repair as requiring immediate full settlement in Week 3; real landlords or utilities sometimes allow multi-month payment plans."});const I=i.filter($=>$.type==="CHORE_REBATE_TRANSFER").map($=>$.id),D=i.filter($=>$.week===4).slice(0,2).map($=>$.id);return o.push({id:"EXP-CHORE-TRUST",category:"CHORE_EQUITY",headline:I.length>0?`Chore-Credit Rebates transferred $${(c.choreCreditDollarValue*I.length).toFixed(2)} to extra-chore helpers`:`Uncompensated Chore Imbalance & Billing Friction left Household Trust at ${l.endingAverageTrust.toFixed(1)}%`,statement:I.length>0?`Under Policy 4, explicit Chore-Credit Rebate transfers (${I.slice(0,4).join(", ")}) compensated roommates who completed 3 weekly chores (+1 extra) via a $${c.choreCreditDollarValue.toFixed(2)} transfer from roommates who completed 1 chore (-1), maintaining average household trust at ${l.endingAverageTrust.toFixed(1)}%.`:`Without a financial chore rebate (${D.join(", ")}), high freeRideTemptation caused chore shirking that cooperative roommates covered unpaid, combining with billing friction to leave Week 4 household trust at ${l.endingAverageTrust.toFixed(1)}%.`,transactionIds:I.length>0?I:D,assumptionRefs:[`policy.enablesChoreRebate=${h.enablesChoreRebate}`,`choreCreditDollarValue=$${c.choreCreditDollarValue}`,`devon.fairnessThreshold=${c.roommates.devon.fairnessThreshold.toFixed(2)}`],modelLimitationNote:"Model Assumption Note: Paying cash rebates for chores can align budget incentives in our ledger equation, though behavioral economics research shows monetizing household favors can sometimes crowd out intrinsic goodwill."}),o}function _e(l,a){const{roommateSummaries:e,transactions:i}=a,c=a.highestNetPayerId,h=l.highestNetPayer===c,o=i.filter(P=>P.roommateId===c&&(P.type==="UTILITY_BILL_CONTRIBUTION"||P.type==="SURPRISE_SHOCK_CONTRIBUTION"||P.type==="RESERVE_CONTRIBUTION")).slice(0,4).map(P=>P.id),d={field:"highestNetPayer",title:"1. Highest 4-Week Net Household Payer",predictedLabel:`${T[l.highestNetPayer].name} ($${e[l.highestNetPayer].totalOutOfPocketPaid.toFixed(2)})`,actualLabel:`${T[c].name} ($${e[c].totalOutOfPocketPaid.toFixed(2)})`,isCorrect:h,explanation:`${T[c].name} paid the highest 4-week net out-of-pocket total ($${e[c].totalOutOfPocketPaid.toFixed(2)}) across ledger entries ${o.join(", ")}, while you predicted ${T[l.highestNetPayer].name} ($${e[l.highestNetPayer].totalOutOfPocketPaid.toFixed(2)}).`,evidenceTransactionIds:o,assumptionNote:`Driven by ${W[a.policyId].shortTitle}, ${c}.weeklyIncome=$${a.assumptions.roommates[c].weeklyIncome}, and ${c}.usageAppetite=${a.assumptions.roommates[c].usageAppetite.toFixed(2)}.`},E=a.anyLiquidityStress?"liquidity_crunch":"all_solvent_buffered",b=l.week3ShockOutcome===E,f=i.filter(P=>P.week===3&&P.type!=="INCOME_INFLOW").slice(0,4).map(P=>P.id),R=w.filter(P=>e[P].experiencedLiquidityStress).map(P=>`${T[P].name} (min cash $${e[P].minWeeklyCash.toFixed(2)})`),C={field:"week3ShockOutcome",title:"2. Week 3 Surprise Expense & Liquidity Survival",predictedLabel:l.week3ShockOutcome==="all_solvent_buffered"?"All Roommates Stay Above $40 Stress Threshold":"Liquidity Crunch (< $40 Cash for >= 1 Roommate)",actualLabel:E==="all_solvent_buffered"?"All Roommates Stayed >= $40 (Buffered/Solvent)":`Liquidity Crunch Triggered (${R.join(", ")})`,isCorrect:b,explanation:E==="liquidity_crunch"?`During the Week 3 shock settlement (${f.join(", ")}), ${R.join(" and ")} dropped below the $40 Liquidity Stress threshold.`:`Every roommate remained above the $40 Liquidity Stress threshold across all 4 weeks (${f.join(", ")}); Devon’s minimum cash was $${e.devon.minWeeklyCash.toFixed(2)}.`,evidenceTransactionIds:f,assumptionNote:`Driven by devon.initialCash=$${a.assumptions.roommates.devon.initialCash}, devon.weeklyIncome=$${a.assumptions.roommates.devon.weeklyIncome}/wk, and Week 3 reserve absorption ($${a.weeklySnapshots[2].reserveUsedForSurprise.toFixed(2)}).`},I=a.largestBehavioralShiftId,D=l.behavioralShift===I,$=i.filter(P=>P.roommateId===I&&P.type!=="INCOME_INFLOW").slice(0,4).map(P=>P.id),A={field:"behavioralShift",title:"3. Largest Incentive-Driven Behavioral Shift",predictedLabel:`${T[l.behavioralShift].name} ($${e[l.behavioralShift].behavioralShiftMagnitude.toFixed(2)} shift)`,actualLabel:`${T[I].name} ($${e[I].behavioralShiftMagnitude.toFixed(2)} shift — ${e[I].primaryBehavioralDriver})`,isCorrect:D,explanation:`${T[I].name} exhibited the largest modeled behavioral shift ($${e[I].behavioralShiftMagnitude.toFixed(2)}: ${e[I].primaryBehavioralDriver}) in transactions ${$.join(", ")}.`,evidenceTransactionIds:$,assumptionNote:`Driven by ${I}.freeRideTemptation=${a.assumptions.roommates[I].freeRideTemptation.toFixed(2)}, ${I}.auditSensitivity=${a.assumptions.roommates[I].auditSensitivity.toFixed(2)}, and ${W[a.policyId].shortTitle}.`},v=[d,C,A],_=v.filter(P=>P.isCorrect).length;return{totalCorrect:_,maxScore:3,summaryHeadline:_===3?"3/3 Predictions Confirmed by the Double-Entry Ledger!":_===2?"2/3 Predictions Matched — Inspect the 1 Counterintuitive Ledger Outcome!":_===1?"1/3 Predictions Matched — The Incentive Equations Revealed 2 Surprises!":"0/3 Predictions Matched — A Classic Game-Theory Surprise! Audit the Ledger Below.",items:v}}function Ve(l,a,e,i,c,h){const o=Pe(l,a,i,c),d=Pe(l,e,h??i,c),E=o.scheduleSignature===d.scheduleSignature&&o.eventSchedule===d.eventSchedule,b={};for(const k of w){const M=o.roommateSummaries[k],V=d.roommateSummaries[k];b[k]={roommateId:k,name:M.name,endingCashA:M.endingCash,endingCashB:V.endingCash,cashDeltaBMinusA:Number((V.endingCash-M.endingCash).toFixed(2)),outOfPocketA:M.totalOutOfPocketPaid,outOfPocketB:V.totalOutOfPocketPaid,outOfPocketDeltaBMinusA:Number((V.totalOutOfPocketPaid-M.totalOutOfPocketPaid).toFixed(2)),trueConsumptionA:M.totalTrueUtilityConsumption,trueConsumptionB:V.totalTrueUtilityConsumption,consumptionDeltaBMinusA:Number((V.totalTrueUtilityConsumption-M.totalTrueUtilityConsumption).toFixed(2)),underreportedA:M.totalUnderreportedGap,underreportedB:V.totalUnderreportedGap,trustA:M.endingTrust,trustB:V.endingTrust}}const f=o.weeklySnapshots.reduce((k,M)=>k+M.totalUtilityBill,0),R=d.weeklySnapshots.reduce((k,M)=>k+M.totalUtilityBill,0),C=Number((R-f).toFixed(2)),I=Number((d.conservation.endingHouseholdReserve-o.conservation.endingHouseholdReserve).toFixed(2)),D=w.reduce((k,M)=>k+o.roommateSummaries[M].totalShortfallSurchargePaid,0),$=w.reduce((k,M)=>k+d.roommateSummaries[M].totalShortfallSurchargePaid,0),A=Number(($-D).toFixed(2)),v=w.reduce((k,M)=>k+o.roommateSummaries[M].totalAdminFeePaid,0),_=w.reduce((k,M)=>k+d.roommateSummaries[M].totalAdminFeePaid,0),H=Number((_-v).toFixed(2)),P=b.devon,B=b.leo,ue=[{id:"CMP-DEVON-LIQUIDITY",title:`Low-Income Liquidity Impact (Devon): ${P.cashDeltaBMinusA>=0?"+":""}$${P.cashDeltaBMinusA.toFixed(2)} Ending Cash`,body:`On the identical 4-week external schedule (${o.scheduleSignature}), Devon’s ending cash moved from $${P.endingCashA.toFixed(2)} under ${W[o.policyId].shortTitle} to $${P.endingCashB.toFixed(2)} under ${W[d.policyId].shortTitle}. Week 3 Reserve absorption changed from $${o.weeklySnapshots[2].reserveUsedForSurprise.toFixed(2)} to $${d.weeklySnapshots[2].reserveUsedForSurprise.toFixed(2)}.`,runATransactionIds:o.transactions.filter(k=>k.roommateId==="devon"&&k.week===3).map(k=>k.id),runBTransactionIds:d.transactions.filter(k=>k.roommateId==="devon"&&k.week===3).map(k=>k.id),assumptionAttribution:`Isolated strictly by policy change (${o.policyId} -> ${d.policyId}) with identical weather multipliers and Week 3 shock ($${o.weeklySnapshots[2].surpriseExpenseAmount.toFixed(2)}).`},{id:"CMP-TOTAL-EFFICIENCY",title:`Household Consumption & Overhead Delta: ${C>=0?"+":""}$${C.toFixed(2)} Utility Bill, ${H>=0?"+":""}$${H.toFixed(2)} Admin Fee`,body:`Total 4-week utility consumption changed from $${f.toFixed(2)} to $${R.toFixed(2)} (${C>=0?"+":""}$${C.toFixed(2)}), while Leo’s cumulative underreported gap shifted from $${B.underreportedA.toFixed(2)} to $${B.underreportedB.toFixed(2)} and external metering fees shifted by ${H>=0?"+":""}$${H.toFixed(2)}.`,runATransactionIds:o.transactions.filter(k=>k.type==="UTILITY_VENDOR_PAYMENT").map(k=>k.id),runBTransactionIds:d.transactions.filter(k=>k.type==="UTILITY_VENDOR_PAYMENT").map(k=>k.id),assumptionAttribution:`Driven by marginalPriceSignal (${W[o.policyId].marginalPriceSignal} vs ${W[d.policyId].marginalPriceSignal}) and chargesMeteringAdminFee (${W[o.policyId].chargesMeteringAdminFee} vs ${W[d.policyId].chargesMeteringAdminFee}).`}];return{scenarioId:o.scenarioId,sameScheduleVerified:E,scheduleSignature:o.scheduleSignature,runA:o,runB:d,totalUtilityBillDeltaBMinusA:C,endingReserveDeltaBMinusA:I,totalShortfallDeltaBMinusA:A,totalAdminFeeDeltaBMinusA:H,roommateDeltas:b,comparisonInsights:ue}}const Le={"scenario-1-thermostat":{highestNetPayer:"priya",week3ShockOutcome:"liquidity_crunch",behavioralShift:"priya"},"scenario-2-grocery-jar":{highestNetPayer:"priya",week3ShockOutcome:"all_solvent_buffered",behavioralShift:"leo"},"scenario-3-boiler-emergency":{highestNetPayer:"priya",week3ShockOutcome:"liquidity_crunch",behavioralShift:"priya"}};function xe(l=L.DEFAULT_SEED){const a=Math.floor(l)>>>0,e="scenario-1-thermostat";return{schemaVersion:L.SCHEMA_VERSION,seed:a,activeScenarioId:e,activePolicyId:z[e].defaultPolicyId,comparisonPolicyId:z[e].recommendedComparisonPolicyId,predictionsByScenario:{"scenario-1-thermostat":{...Le["scenario-1-thermostat"]},"scenario-2-grocery-jar":{...Le["scenario-2-grocery-jar"]},"scenario-3-boiler-emergency":{...Le["scenario-3-boiler-emergency"]}},committedPredictionsByScenario:{"scenario-1-thermostat":!1,"scenario-2-grocery-jar":!1,"scenario-3-boiler-emergency":!1},frozenSchedulesByScenario:{"scenario-1-thermostat":$e("scenario-1-thermostat",a),"scenario-2-grocery-jar":$e("scenario-2-grocery-jar",a),"scenario-3-boiler-emergency":$e("scenario-3-boiler-emergency",a)},assumptionsByScenario:{"scenario-1-thermostat":Ce(),"scenario-2-grocery-jar":Ce(),"scenario-3-boiler-emergency":Ce()},completedScenarios:[],completedComparisons:[],debriefAnswers:{}}}function Fe(l){return typeof l=="string"&&l in z}function He(l){return typeof l=="string"&&l in W}function rt(l){const a=Ce();if(!l||typeof l!="object")return a;const e=l,i=e.roommates&&typeof e.roommates=="object"?e.roommates:{};for(const c of w){const h=i[c];if(h&&typeof h=="object"){const o=h;typeof o.weeklyIncome=="number"&&Number.isFinite(o.weeklyIncome)&&(a.roommates[c].weeklyIncome=o.weeklyIncome),typeof o.usageAppetite=="number"&&Number.isFinite(o.usageAppetite)&&(a.roommates[c].usageAppetite=o.usageAppetite),typeof o.freeRideTemptation=="number"&&Number.isFinite(o.freeRideTemptation)&&(a.roommates[c].freeRideTemptation=o.freeRideTemptation),typeof o.auditSensitivity=="number"&&Number.isFinite(o.auditSensitivity)&&(a.roommates[c].auditSensitivity=o.auditSensitivity),typeof o.fairnessThreshold=="number"&&Number.isFinite(o.fairnessThreshold)&&(a.roommates[c].fairnessThreshold=o.fairnessThreshold),typeof o.initialCash=="number"&&Number.isFinite(o.initialCash)&&(a.roommates[c].initialCash=o.initialCash)}}return typeof e.reserveContributionRate=="number"&&Number.isFinite(e.reserveContributionRate)&&(a.reserveContributionRate=e.reserveContributionRate),typeof e.weeklyMeteringAdminFee=="number"&&Number.isFinite(e.weeklyMeteringAdminFee)&&(a.weeklyMeteringAdminFee=e.weeklyMeteringAdminFee),typeof e.choreCreditDollarValue=="number"&&Number.isFinite(e.choreCreditDollarValue)&&(a.choreCreditDollarValue=e.choreCreditDollarValue),De(a)}function Be(l,a=L.DEFAULT_SEED){if(!l||typeof l!="object")return null;const e=l;if(e.schemaVersion!==L.SCHEMA_VERSION)return null;const i=typeof e.seed=="number"&&Number.isFinite(e.seed)?Math.floor(e.seed)>>>0:a,c=xe(i);if(Fe(e.activeScenarioId)&&(c.activeScenarioId=e.activeScenarioId),He(e.activePolicyId)&&(c.activePolicyId=e.activePolicyId),He(e.comparisonPolicyId)&&(c.comparisonPolicyId=e.comparisonPolicyId),e.predictionsByScenario&&typeof e.predictionsByScenario=="object"){const h=e.predictionsByScenario;for(const o of Object.keys(z)){const d=h[o];d&&typeof d=="object"&&(typeof d.highestNetPayer=="string"&&w.includes(d.highestNetPayer)&&(c.predictionsByScenario[o].highestNetPayer=d.highestNetPayer),(d.week3ShockOutcome==="all_solvent_buffered"||d.week3ShockOutcome==="liquidity_crunch")&&(c.predictionsByScenario[o].week3ShockOutcome=d.week3ShockOutcome),typeof d.behavioralShift=="string"&&w.includes(d.behavioralShift)&&(c.predictionsByScenario[o].behavioralShift=d.behavioralShift))}}if(e.committedPredictionsByScenario&&typeof e.committedPredictionsByScenario=="object"){const h=e.committedPredictionsByScenario;for(const o of Object.keys(z))typeof h[o]=="boolean"&&(c.committedPredictionsByScenario[o]=h[o])}if(e.frozenSchedulesByScenario&&typeof e.frozenSchedulesByScenario=="object"){const h=e.frozenSchedulesByScenario;for(const o of Object.keys(z)){const d=h[o];d&&typeof d=="object"&&d.scenarioId===o&&Array.isArray(d.weeks)&&d.weeks.length===4&&(c.frozenSchedulesByScenario[o]=d)}}if(e.assumptionsByScenario&&typeof e.assumptionsByScenario=="object"){const h=e.assumptionsByScenario;for(const o of Object.keys(z))h[o]&&(c.assumptionsByScenario[o]=rt(h[o]))}if(Array.isArray(e.completedScenarios)&&(c.completedScenarios=e.completedScenarios.filter(Fe)),Array.isArray(e.completedComparisons)&&(c.completedComparisons=e.completedComparisons.filter(Fe)),e.debriefAnswers&&typeof e.debriefAnswers=="object"){const h=e.debriefAnswers;for(const[o,d]of Object.entries(h))typeof d=="string"&&(c.debriefAnswers[o]=d)}return c}function Ie(l,a){try{const e=a??(typeof window<"u"?window.localStorage:void 0);return e?(e.setItem(L.STORAGE_KEY,JSON.stringify(l)),!0):!1}catch{return!1}}function qe(l=L.DEFAULT_SEED,a){try{const e=a??(typeof window<"u"?window.localStorage:void 0);if(!e)return xe(l);const i=e.getItem(L.STORAGE_KEY);if(!i)return xe(l);const c=JSON.parse(i);return Be(c,l)??xe(l)}catch{return xe(l)}}function Ge(l){return JSON.stringify(l,null,2)}function ot(l,a=L.DEFAULT_SEED){try{const e=JSON.parse(l);return Be(e,a)}catch{return null}}function it(l){try{(l??(typeof window<"u"?window.localStorage:void 0))?.removeItem(L.STORAGE_KEY)}catch{}}class Ye{ctx=null;muted=!1;getContext(){if(this.muted||typeof window>"u")return null;const a=window.AudioContext||window.webkitAudioContext;if(!a)return null;if(!this.ctx)try{this.ctx=new a}catch{return null}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}setMuted(a){this.muted=a}isMuted(){return this.muted}playPenClick(){const a=this.getContext();if(a)try{const e=a.currentTime,i=a.createOscillator(),c=a.createGain();i.type="triangle",i.frequency.setValueAtTime(1150,e),i.frequency.exponentialRampToValueAtTime(340,e+.035),c.gain.setValueAtTime(.08,e),c.gain.exponentialRampToValueAtTime(.001,e+.035),i.connect(c),c.connect(a.destination),i.start(e),i.stop(e+.04)}catch{}}playCashChime(a=1){const e=this.getContext();if(e)try{const i=e.currentTime,c=587.33+(a-1)*55;[c,c*1.25].forEach((o,d)=>{const E=e.createOscillator(),b=e.createGain();E.type="sine";const f=i+d*.055;E.frequency.setValueAtTime(o,f),b.gain.setValueAtTime(.07,f),b.gain.exponentialRampToValueAtTime(.001,f+.16),E.connect(b),b.connect(e.destination),E.start(f),E.stop(f+.17)})}catch{}}playShockBell(){const a=this.getContext();if(a)try{const e=a.currentTime;[440,392].forEach((c,h)=>{const o=a.createOscillator(),d=a.createGain();o.type="sawtooth";const E=e+h*.09;o.frequency.setValueAtTime(c,E),d.gain.setValueAtTime(.06,E),d.gain.exponentialRampToValueAtTime(.001,E+.22),o.connect(d),d.connect(a.destination),o.start(E),o.stop(E+.23)})}catch{}}playRevealFanfare(a=2){const e=this.getContext();if(e)try{const i=e.currentTime;(a>=2?[523.25,659.25,783.99,1046.5]:[440,523.25,659.25]).forEach((h,o)=>{const d=e.createOscillator(),E=e.createGain();d.type="triangle";const b=i+o*.065;d.frequency.setValueAtTime(h,b),E.gain.setValueAtTime(.075,b),E.gain.exponentialRampToValueAtTime(.001,b+.25),d.connect(E),E.connect(e.destination),d.start(b),d.stop(b+.26)})}catch{}}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}const at={maya:`<svg viewBox="0 0 64 64" width="48" height="48" role="img" aria-label="Maya avatar">
    <circle cx="32" cy="32" r="30" fill="#fef3c7" stroke="#d97706" stroke-width="2.5"/>
    <path d="M16 54 C16 42 48 42 48 54" fill="#d97706"/>
    <circle cx="32" cy="26" r="11" fill="#fde68a" stroke="#92400e" stroke-width="1.8"/>
    <path d="M20 24 C20 14 44 14 44 24 C41 19 23 19 20 24 Z" fill="#78350f"/>
    <rect x="23" y="23" width="7" height="5" rx="1.5" fill="none" stroke="#451a03" stroke-width="1.6"/>
    <rect x="34" y="23" width="7" height="5" rx="1.5" fill="none" stroke="#451a03" stroke-width="1.6"/>
    <line x1="30" y1="25" x2="34" y2="25" stroke="#451a03" stroke-width="1.6"/>
    <path d="M28 32 Q32 35 36 32" fill="none" stroke="#78350f" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,devon:`<svg viewBox="0 0 64 64" width="48" height="48" role="img" aria-label="Devon avatar">
    <circle cx="32" cy="32" r="30" fill="#d1fae5" stroke="#059669" stroke-width="2.5"/>
    <path d="M15 54 C15 41 49 41 49 54" fill="#059669"/>
    <circle cx="32" cy="26" r="11" fill="#a7f3d0" stroke="#065f46" stroke-width="1.8"/>
    <path d="M21 21 C22 13 42 13 43 21 Z" fill="#064e3b"/>
    <circle cx="28" cy="26" r="1.7" fill="#064e3b"/>
    <circle cx="36" cy="26" r="1.7" fill="#064e3b"/>
    <path d="M28 32 Q32 34 36 32" fill="none" stroke="#064e3b" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="42" y="42" width="9" height="10" rx="2" fill="#ffffff" stroke="#065f46" stroke-width="1.5"/>
  </svg>`,priya:`<svg viewBox="0 0 64 64" width="48" height="48" role="img" aria-label="Priya avatar">
    <circle cx="32" cy="32" r="30" fill="#ede9fe" stroke="#7c3aed" stroke-width="2.5"/>
    <path d="M16 54 C16 42 48 42 48 54" fill="#7c3aed"/>
    <circle cx="32" cy="26" r="11" fill="#ddd6fe" stroke="#4c1d95" stroke-width="1.8"/>
    <path d="M19 26 A13 13 0 0 1 45 26" fill="none" stroke="#5b21b6" stroke-width="3"/>
    <rect x="17" y="23" width="4" height="7" rx="2" fill="#5b21b6"/>
    <rect x="43" y="23" width="4" height="7" rx="2" fill="#5b21b6"/>
    <circle cx="28" cy="26" r="1.8" fill="#4c1d95"/>
    <circle cx="36" cy="26" r="1.8" fill="#4c1d95"/>
    <path d="M28 32 Q32 36 36 32" fill="none" stroke="#4c1d95" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,leo:`<svg viewBox="0 0 64 64" width="48" height="48" role="img" aria-label="Leo avatar">
    <circle cx="32" cy="32" r="30" fill="#ffe4e6" stroke="#e11d48" stroke-width="2.5"/>
    <path d="M16 54 C16 42 48 42 48 54" fill="#e11d48"/>
    <circle cx="32" cy="26" r="11" fill="#fecdd3" stroke="#881337" stroke-width="1.8"/>
    <path d="M22 19 L32 14 L42 19 Z" fill="#881337"/>
    <circle cx="28" cy="25" r="1.8" fill="#881337"/>
    <circle cx="36" cy="25" r="1.8" fill="#881337"/>
    <path d="M27 32 Q33 35 38 30" fill="none" stroke="#881337" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`},nt=`
:root {
  --rr-brand-color: #b45309;
  --rr-bg: #faf7f2;
  --rr-surface: #ffffff;
  --rr-surface-alt: #f4efe6;
  --rr-border: #d6cbb9;
  --rr-text: #1c1917;
  --rr-text-muted: #57534e;
  --rr-success: #047857;
  --rr-success-bg: #ecfdf5;
  --rr-danger: #be123c;
  --rr-danger-bg: #fff1f2;
  --rr-warn: #b45309;
  --rr-warn-bg: #fffbeb;
  --rr-accent-purple: #6d28d9;
}

@media (prefers-color-scheme: dark) {
  :root {
    --rr-brand-color: #f59e0b;
  }
}

.rr-root {
  color-scheme: light dark;
  accent-color: var(--rr-brand-color);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--rr-bg);
  color: var(--rr-text);
  min-block-size: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  line-height: 1.45;
}

.rr-container {
  max-inline-size: 1280px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.rr-header {
  background: var(--rr-surface);
  border: 2px solid var(--rr-border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 6px rgba(28, 25, 23, 0.05);
}

.rr-title-block h1 {
  margin: 0;
  font-size: clamp(1.35rem, 2.5vw, 1.85rem);
  letter-spacing: -0.02em;
  color: #1c1917;
}

.rr-title-block p {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: var(--rr-text-muted);
}

.rr-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.rr-btn {
  appearance: none;
  border: 1.5px solid var(--rr-border);
  background: var(--rr-surface-alt);
  color: var(--rr-text);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease, border-color 0.15s ease;
}

.rr-btn:hover {
  background: #e7dfd1;
  border-color: #a89984;
}

.rr-btn:focus-visible {
  outline: 2px solid var(--rr-brand-color);
  outline-offset: 2px;
}

.rr-btn-primary {
  background: #b45309;
  color: #ffffff;
  border-color: #92400e;
}

.rr-btn-primary:hover {
  background: #92400e;
  color: #ffffff;
}

.rr-btn-active {
  background: #1c1917;
  color: #ffffff;
  border-color: #1c1917;
}

.rr-scenario-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.75rem;
}

.rr-scenario-tab {
  text-align: left;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 2px solid var(--rr-border);
  background: var(--rr-surface);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rr-scenario-tab[aria-selected="true"] {
  border-color: #b45309;
  background: #fffbeb;
  box-shadow: 0 0 0 2px rgba(180, 83, 9, 0.15);
}

.rr-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--rr-surface-alt);
  color: var(--rr-text);
}

.rr-badge-shock {
  background: var(--rr-danger-bg);
  color: var(--rr-danger);
  border: 1px solid #fecdd3;
}

.rr-badge-ok {
  background: var(--rr-success-bg);
  color: var(--rr-success);
  border: 1px solid #a7f3d0;
}

.rr-section {
  background: var(--rr-surface);
  border: 1.5px solid var(--rr-border);
  border-radius: 12px;
  padding: 1.15rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.rr-section-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-block-end: 0.85rem;
  border-block-end: 1px solid var(--rr-surface-alt);
  padding-block-end: 0.5rem;
}

.rr-section-header h2 {
  margin: 0;
  font-size: 1.15rem;
}

.rr-roommate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
  gap: 0.85rem;
}

.rr-roommate-card {
  border: 1.5px solid var(--rr-border);
  border-radius: 10px;
  padding: 0.85rem;
  background: #fdfcfa;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.rr-roommate-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rr-stat-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem 0.65rem;
  font-size: 0.8rem;
  background: var(--rr-surface-alt);
  padding: 0.55rem;
  border-radius: 8px;
}

.rr-grid-2col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

.rr-policy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.75rem;
}

.rr-policy-card {
  text-align: left;
  border: 2px solid var(--rr-border);
  border-radius: 10px;
  padding: 0.8rem;
  background: var(--rr-surface);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.rr-policy-card[aria-checked="true"] {
  border-color: #b45309;
  background: #fffbeb;
}

.rr-conservation-banner {
  background: var(--rr-success-bg);
  border: 1.5px solid #6ee7b7;
  color: #065f46;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  font-weight: 600;
}

.rr-tx-chip {
  display: inline-block;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 0.12rem 0.45rem;
  border-radius: 5px;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
  cursor: pointer;
  margin-inline: 0.15rem;
}

.rr-tx-chip:hover {
  background: #fde68a;
}

/* Responsive Data Table per modern-web-guidance (responsive-table) */
.rr-table-wrapper {
  overflow: auto;
  max-inline-size: 100%;
  max-block-size: min(500px, 80vh);
  container-type: inline-size;
  border: 1px solid var(--rr-border);
  border-radius: 8px;
}

.rr-table-wrapper table {
  inline-size: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.83rem;
}

.rr-table-wrapper caption {
  text-align: left;
  padding: 0.6rem 0.85rem;
  font-weight: 700;
  background: var(--rr-surface-alt);
  border-block-end: 1px solid var(--rr-border);
}

.rr-table-wrapper thead {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
  background: #eae2d3;
}

.rr-table-wrapper th,
.rr-table-wrapper td {
  padding: 0.55rem 0.75rem;
  text-align: left;
  border-block-end: 1px solid #e7e0d3;
  vertical-align: top;
}

.rr-table-wrapper tbody th {
  position: sticky;
  inset-inline-start: 0;
  background: #ffffff;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: nowrap;
}

.rr-table-wrapper tr.rr-tx-highlighted th,
.rr-table-wrapper tr.rr-tx-highlighted td {
  background: #fef3c7 !important;
  transition: background 0.25s ease;
}

@container (width < 600px) {
  .rr-table-wrapper table,
  .rr-table-wrapper thead,
  .rr-table-wrapper tbody,
  .rr-table-wrapper tr,
  .rr-table-wrapper th,
  .rr-table-wrapper td {
    display: block;
  }

  .rr-table-wrapper thead {
    display: none;
  }

  .rr-table-wrapper tr {
    margin-block-end: 1rem;
    border: 1px solid var(--rr-border);
  }

  .rr-table-wrapper tbody th {
    position: sticky;
    inset-block-start: 0;
    z-index: 2;
    background: #f4efe6;
  }

  .rr-table-wrapper table {
    --label-2: "Week";
    --label-3: "Type";
    --label-4: "From -> To";
    --label-5: "Amount";
    --label-6: "Explanation & Model Drivers";
  }

  .rr-table-wrapper td:nth-child(2)::before {
    content: var(--label-2) ": ";
    font-weight: 700;
  }
  .rr-table-wrapper td:nth-child(3)::before {
    content: var(--label-3) ": ";
    font-weight: 700;
  }
  .rr-table-wrapper td:nth-child(4)::before {
    content: var(--label-4) ": ";
    font-weight: 700;
  }
  .rr-table-wrapper td:nth-child(5)::before {
    content: var(--label-5) ": ";
    font-weight: 700;
  }
  .rr-table-wrapper td:nth-child(6)::before {
    content: var(--label-6) ": ";
    font-weight: 700;
  }
}

/* Native Range Slider per modern-web-guidance (slider + brand-consistent-forms) */
input[type="range"].rr-slider {
  --slider-track-size: 0.45rem;
  --slider-thumb-size: 1.15rem;
  --slider-track-radius: 999px;
  --slider-thumb-radius: 50%;
  --slider-track-color: #d6cbb9;
  --slider-fill-color: var(--rr-brand-color);
  --slider-thumb-color: var(--slider-fill-color);
  --slider-direction: to right;

  --attr-min: attr(min type(<number>), 0);
  --attr-max: attr(max type(<number>), 100);
  --control-value: attr(value type(<number>), 50);
  --slider-progress: calc(
    progress(var(--control-value), var(--attr-min), var(--attr-max)) * 100%
  );

  appearance: none;
  inline-size: 100%;
  block-size: 2rem;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
}

input[type="range"].rr-slider:dir(rtl) {
  --slider-direction: to left;
}

@supports not (opacity: progress(1, 0, 100)) {
  input[type="range"].rr-slider {
    --slider-progress: calc(
      (var(--control-value) - var(--attr-min)) /
      (var(--attr-max) - var(--attr-min)) * 100%
    );
  }
}

input[type="range"].rr-slider::-webkit-slider-runnable-track {
  block-size: var(--slider-track-size);
  border: 0;
  border-radius: var(--slider-track-radius);
  background: linear-gradient(
    var(--slider-direction),
    var(--slider-fill-color) var(--slider-progress),
    var(--slider-track-color) var(--slider-progress)
  );
}

input[type="range"].rr-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  inline-size: var(--slider-thumb-size);
  block-size: var(--slider-thumb-size);
  margin-block-start: calc(
    (var(--slider-track-size) - var(--slider-thumb-size)) / 2
  );
  border: 0;
  border-radius: var(--slider-thumb-radius);
  background: var(--slider-thumb-color);
}

input[type="range"].rr-slider::-moz-range-track {
  block-size: var(--slider-track-size);
  border: 0;
  border-radius: var(--slider-track-radius);
  background: var(--slider-track-color);
}

input[type="range"].rr-slider::-moz-range-progress {
  block-size: var(--slider-track-size);
  border-radius: var(--slider-track-radius);
  background: var(--slider-fill-color);
}

input[type="range"].rr-slider::-moz-range-thumb {
  inline-size: var(--slider-thumb-size);
  block-size: var(--slider-thumb-size);
  border: 0;
  border-radius: var(--slider-thumb-radius);
  background: var(--slider-thumb-color);
}

input[type="range"].rr-slider:focus-visible {
  outline: 2px solid var(--slider-fill-color);
  outline-offset: 4px;
}

/* Fallback for older browsers without accent-color per brand-consistent-forms */
@supports not (accent-color: var(--rr-brand-color)) {
  input[type="radio"].rr-visually-hidden {
    position: absolute !important;
    clip-path: inset(50%) !important;
    overflow: hidden !important;
    width: 1px !important;
    height: 1px !important;
    margin: -1px !important;
    padding: 0 !important;
    border: 0 !important;
    white-space: nowrap !important;
  }
}

.rr-explanation-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.85rem;
}

.rr-explanation-card {
  border: 1px solid var(--rr-border);
  border-left: 4px solid var(--rr-brand-color);
  border-radius: 8px;
  padding: 0.8rem;
  background: #fdfcfa;
  font-size: 0.85rem;
}

.rr-limitation-box {
  margin-block-start: 0.5rem;
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  background: var(--rr-surface-alt);
  color: var(--rr-text-muted);
  font-size: 0.78rem;
}

.rr-debug-drawer {
  background: #1c1917;
  color: #f5f5f4;
  padding: 1rem;
  border-radius: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  overflow-x: auto;
}
`;function Ke(l,a){const e=a?.initialSeed??L.DEFAULT_SEED;let i=qe(e);if(a?.initialSeed!==void 0&&i.seed!==a.initialSeed){i.seed=Math.floor(a.initialSeed)>>>0;for(const S of Object.keys(z))i.frozenSchedulesByScenario[S]=$e(S,i.seed);Ie(i)}let c=!!a?.debug,h="ALL",o="ALL",d="ALL",E="TRANSACTIONS",b=null,f=!1;const R=new Ye;let C=$(),I=_e(i.predictionsByScenario[i.activeScenarioId],C),D=A();function $(){const S=i.activeScenarioId,g=i.frozenSchedulesByScenario[S]??$e(S,i.seed);return i.frozenSchedulesByScenario[S]=g,Pe(S,i.activePolicyId,i.assumptionsByScenario[S],g)}function A(){const S=i.activeScenarioId,g=i.frozenSchedulesByScenario[S];return Ve(S,i.activePolicyId,i.comparisonPolicyId,i.assumptionsByScenario[S],g)}function v(){C=$(),I=_e(i.predictionsByScenario[i.activeScenarioId],C),D=A(),Ie(i)}function _(S){S.querySelectorAll('input[type="range"].rr-slider').forEach(O=>{O.style.setProperty("--attr-min",O.min||"0"),O.style.setProperty("--attr-max",O.max||"100"),O.style.setProperty("--control-value",O.value)})}function H(S){return S.slice(0,4).map(g=>`<button type="button" class="rr-tx-chip" data-action="focus-tx" data-tx-id="${g}" title="Jump to transaction ${g} in ledger">${g}</button>`).join(" ")}function P(S){let G=400,t=0;for(const N of S.weeklySnapshots){N.endingHouseholdReserve>G&&(G=N.endingHouseholdReserve);for(const fe of w){const K=N.roommateStates[fe].endingCash;K>G&&(G=K),K<t&&(t=K)}}G=Math.ceil((G+30)/50)*50,t=Math.min(0,Math.floor((t-20)/50)*50);const F=Math.max(100,G-t),p=N=>176-(N-t)/F*152,n=p(0),Y=p(L.LIQUIDITY_STRESS_THRESHOLD),le=612/4,J=[];return S.weeklySnapshots.forEach((N,fe)=>{const K=48+fe*le,X=22;w.forEach((ge,we)=>{const de=N.roommateStates[ge].endingCash,se=K+14+we*(X+4),Q=de>=0?p(de):n,oe=Math.max(3,Math.abs(p(de)-n)),Z=T[ge].color;J.push(`<rect x="${se}" y="${Q.toFixed(1)}" width="${X}" height="${oe.toFixed(1)}" rx="3" fill="${Z}">
            <title>Week ${N.week} ${T[ge].name}: $${de.toFixed(2)}</title>
          </rect>
          <text x="${se+X/2}" y="${(Q-4).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="700" fill="#1c1917">$${Math.round(de)}</text>`)});const ae=N.endingHouseholdReserve,ye=K+14+4*(X+4)+3,ne=p(ae),me=Math.max(2,Math.abs(n-ne));J.push(`<rect x="${ye}" y="${ne.toFixed(1)}" width="16" height="${me.toFixed(1)}" rx="2" fill="#f59e0b" stroke="#78350f" stroke-width="1">
          <title>Week ${N.week} Shared Household Reserve: $${ae.toFixed(2)}</title>
        </rect>`),J.push(`<text x="${K+le/2}" y="200" text-anchor="middle" font-size="11" font-weight="700" fill="#1c1917">Week ${N.week}${N.week===3?" ⚡":""}</text>`)}),`<svg viewBox="0 0 680 210" width="100%" height="210" role="img" aria-label="4-Week Roommate Cash and Shared Reserve Trajectory Chart">
      <rect x="0" y="0" width="680" height="210" rx="8" fill="#fdfcfa" stroke="#e7dfd1"/>
      <line x1="48" y1="${n.toFixed(1)}" x2="660" y2="${n.toFixed(1)}" stroke="#57534e" stroke-width="1.2"/>
      <line x1="48" y1="${Y.toFixed(1)}" x2="660" y2="${Y.toFixed(1)}" stroke="#e11d48" stroke-dasharray="4 3" stroke-width="1.2"/>
      <text x="52" y="${(Y-4).toFixed(1)}" font-size="9" font-weight="700" fill="#be123c">$40 Liquidity Stress Threshold</text>
      <text x="42" y="${32 .toFixed(1)}" text-anchor="end" font-size="9" fill="#57534e">$${G}</text>
      <text x="42" y="${(n+3).toFixed(1)}" text-anchor="end" font-size="9" fill="#57534e">$0</text>
      ${J.join(`
`)}
    </svg>`}function B(){const S=z[i.activeScenarioId],g=W[i.activePolicyId],O=W[i.comparisonPolicyId],x=i.predictionsByScenario[i.activeScenarioId],j=i.committedPredictionsByScenario[i.activeScenarioId],te=i.frozenSchedulesByScenario[i.activeScenarioId],ce=te.weeks[2].surpriseExpense,re=C.conservation,Se=C.transactions.filter(t=>!(h!=="ALL"&&t.week!==h||o!=="ALL"&&t.roommateId!==o&&t.counterpartyRoommateId!==o||d!=="ALL"&&t.flowCategory!==d)),G=C.choreLedger.filter(t=>!(h!=="ALL"&&t.week!==h||o!=="ALL"&&t.roommateId!==o));l.innerHTML=`
      <style>${nt}</style>
      <div class="rr-root" data-game-id="${L.GAME_ID}">
        <div class="rr-container">
          <!-- Header -->
          <header class="rr-header">
            <div class="rr-title-block">
              <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                <span class="rr-badge" style="background:#fef3c7;color:#92400e;">GAME 06 · BRIEF F</span>
                <span class="rr-badge">Seed #${i.seed}</span>
                <span class="rr-badge" title="External event schedule is frozen so policy comparisons have zero RNG drift">${te.scheduleSignature}</span>
              </div>
              <h1>${L.TITLE}: ${L.SUBTITLE}</h1>
              <p>Inspect household incentives, commit to a testable prediction, enact a billing policy, and audit the double-entry ledger on a frozen 4-week event schedule.</p>
            </div>
            <div class="rr-toolbar">
              <button type="button" class="rr-btn" data-action="toggle-assumptions" aria-expanded="${f}">
                ${f?"Hide Assumptions Sliders":"Edit Assumptions Sliders"}
              </button>
              <button type="button" class="rr-btn" data-action="new-seed">
                New Event Seed
              </button>
              <button type="button" class="rr-btn" data-action="toggle-mute">
                ${R.isMuted()?"Audio: Muted":"Audio: On"}
              </button>
              <button type="button" class="rr-btn" data-action="export-json">
                Export Save
              </button>
              <button type="button" class="rr-btn ${c?"rr-btn-active":""}" data-action="toggle-debug">
                Debug [D]
              </button>
            </div>
          </header>

          <!-- Scenario Selector Bar -->
          <nav class="rr-scenario-bar" aria-label="Household Scenarios">
            ${ze.map(t=>{const F=t.id===i.activeScenarioId,p=i.completedScenarios.includes(t.id);return`
                <button type="button" class="rr-scenario-tab" role="tab" aria-selected="${F}" data-action="select-scenario" data-scenario-id="${t.id}">
                  <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
                    <span style="font-weight:700;font-size:0.95rem;">${t.title}</span>
                    ${p?'<span class="rr-badge rr-badge-ok">Audited ✓</span>':'<span class="rr-badge">4 Weeks</span>'}
                  </div>
                  <span style="font-size:0.8rem;color:var(--rr-text-muted);">${t.subtitle}</span>
                </button>
              `}).join("")}
          </nav>

          <!-- Scenario Premise & Frozen Week 3 Shock Banner -->
          <section class="rr-section" aria-label="Scenario Briefing">
            <div class="rr-section-header">
              <h2>${S.title} — ${S.utilityLabel}</h2>
              <span class="rr-badge rr-badge-shock">Frozen Week 3 Shock: ${ce.title} ($${ce.amountDollars.toFixed(2)})</span>
            </div>
            <p style="margin:0 0 0.6rem;font-size:0.92rem;">${S.premise}</p>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;font-size:0.82rem;color:var(--rr-text-muted);">
              <span><strong>Base Weekly Bill:</strong> $${S.baseWeeklyBillDollars}/wk</span>
              <span>·</span>
              <span><strong>Initial Shared Reserve:</strong> $${S.initialReserveDollars.toFixed(2)}</span>
              <span>·</span>
              <span><strong>Week 1–4 Weather/Demand Multipliers:</strong> ${te.weeks.map(t=>`W${t.week}: ${t.weatherOrDemandIndex}x`).join(", ")}</span>
            </div>
          </section>

          <!-- 4 Roommate Agent Cards -->
          <section class="rr-section" aria-label="Roommate Behavioral Profiles">
            <div class="rr-section-header">
              <h2>Step 1: Inspect the 4 Roommate Behavioral Models</h2>
              <span style="font-size:0.82rem;color:var(--rr-text-muted);">All agent parameters are transparent and editable in the Assumptions Panel.</span>
            </div>
            <div class="rr-roommate-grid">
              ${w.map(t=>{const F=T[t],p=i.assumptionsByScenario[i.activeScenarioId].roommates[t],n=C.roommateSummaries[t];return`
                  <article class="rr-roommate-card" data-roommate-card="${t}">
                    <div class="rr-roommate-top">
                      ${at[t]}
                      <div>
                        <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                          <strong style="font-size:1rem;">${F.name}</strong>
                          <span class="rr-badge" style="border-left:3px solid ${F.color};">${F.badgeText}</span>
                        </div>
                        <div style="font-size:0.77rem;color:var(--rr-text-muted);">${F.shortLabel}</div>
                      </div>
                    </div>
                    <p style="margin:0;font-size:0.8rem;color:var(--rr-text-muted);">${F.bio}</p>
                    <div class="rr-stat-list">
                      <div><strong>Income:</strong> $${p.weeklyIncome}/wk</div>
                      <div><strong>Start Cash:</strong> $${p.initialCash}</div>
                      <div><strong>Usage Appetite:</strong> ${p.usageAppetite.toFixed(2)}x</div>
                      <div><strong>Free-Ride Tempt:</strong> ${Math.round(p.freeRideTemptation*100)}%</div>
                      <div><strong>Audit Sensitivity:</strong> ${Math.round(p.auditSensitivity*100)}%</div>
                      <div><strong>Fairness Floor:</strong> ${Math.round(p.fairnessThreshold*100)}%</div>
                    </div>
                    <div style="border-top:1px dashed var(--rr-border);padding-top:0.45rem;display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;">
                      <span><strong>4-Wk Out-of-Pocket:</strong> $${n.totalOutOfPocketPaid.toFixed(2)}</span>
                      <span class="rr-badge ${n.experiencedLiquidityStress?"rr-badge-shock":"rr-badge-ok"}">
                        End Cash: $${n.endingCash.toFixed(2)}
                      </span>
                    </div>
                  </article>
                `}).join("")}
            </div>
          </section>

          <!-- Editable Assumptions Sliders Panel (Collapsible) -->
          ${f?`
          <section class="rr-section" aria-label="Editable Behavioral Assumptions Panel" id="rr-assumptions-panel">
            <div class="rr-section-header">
              <h2>Editable Assumptions Panel (Test Sensitivity on Same Event Schedule)</h2>
              <button type="button" class="rr-btn" data-action="reset-assumptions">Reset Default Assumptions</button>
            </div>
            <p style="margin:0 0 0.85rem;font-size:0.85rem;color:var(--rr-text-muted);">
              Adjusting these sliders changes the agent parameters while keeping the frozen External Event Schedule (${te.scheduleSignature}) untouched.
            </p>
            <div class="rr-roommate-grid">
              ${w.map(t=>{const F=T[t],p=i.assumptionsByScenario[i.activeScenarioId].roommates[t];return`
                  <div class="rr-roommate-card">
                    <strong>${F.name} Parameters</strong>
                    <div>
                      <label for="slider-income-${t}" style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">
                        <span>Weekly Income ($/wk)</span>
                        <span>$${p.weeklyIncome}</span>
                      </label>
                      <input type="range" id="slider-income-${t}" class="rr-slider" min="110" max="550" step="5" value="${p.weeklyIncome}" aria-valuetext="$${p.weeklyIncome} per week" data-action="assumption-slider" data-roommate="${t}" data-field="weeklyIncome"/>
                    </div>
                    <div>
                      <label for="slider-appetite-${t}" style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">
                        <span>Usage Appetite</span>
                        <span>${p.usageAppetite.toFixed(2)}x</span>
                      </label>
                      <input type="range" id="slider-appetite-${t}" class="rr-slider" min="0.5" max="2.0" step="0.05" value="${p.usageAppetite}" aria-valuetext="${p.usageAppetite.toFixed(2)}x baseline usage" data-action="assumption-slider" data-roommate="${t}" data-field="usageAppetite"/>
                    </div>
                    <div>
                      <label for="slider-freeride-${t}" style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">
                        <span>Free-Ride Temptation</span>
                        <span>${p.freeRideTemptation.toFixed(2)}</span>
                      </label>
                      <input type="range" id="slider-freeride-${t}" class="rr-slider" min="0" max="1" step="0.05" value="${p.freeRideTemptation}" aria-valuetext="${Math.round(p.freeRideTemptation*100)} percent free ride temptation" data-action="assumption-slider" data-roommate="${t}" data-field="freeRideTemptation"/>
                    </div>
                    <div>
                      <label for="slider-audit-${t}" style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">
                        <span>Audit / Price Sensitivity</span>
                        <span>${p.auditSensitivity.toFixed(2)}</span>
                      </label>
                      <input type="range" id="slider-audit-${t}" class="rr-slider" min="0" max="1" step="0.05" value="${p.auditSensitivity}" aria-valuetext="${Math.round(p.auditSensitivity*100)} percent audit sensitivity" data-action="assumption-slider" data-roommate="${t}" data-field="auditSensitivity"/>
                    </div>
                  </div>
                `}).join("")}
            </div>
          </section>
          `:""}

          <!-- Step 2 & 3: Commit Prediction & Select Policy -->
          <div class="rr-grid-2col">
            <section class="rr-section" aria-label="Commit to a Prediction">
              <div class="rr-section-header">
                <h2>Step 2: Commit to a Prediction Before Running</h2>
                <span class="rr-badge ${j?"rr-badge-ok":"rr-badge-shock"}">
                  ${j?`Graded: ${I.totalCorrect}/3 Correct`:"Awaiting Commit"}
                </span>
              </div>
              <div style="display:flex;flex-direction:column;gap:0.75rem;font-size:0.86rem;">
                <div>
                  <label for="pred-highest-payer" style="font-weight:700;display:block;margin-bottom:0.25rem;">
                    1. Who will pay the highest 4-week total out-of-pocket household contribution?
                  </label>
                  <select id="pred-highest-payer" class="rr-btn" style="width:100%;" data-action="update-prediction" data-pred-field="highestNetPayer">
                    ${w.map(t=>`<option value="${t}" ${x.highestNetPayer===t?"selected":""}>${T[t].name} (${T[t].shortLabel})</option>`).join("")}
                  </select>
                </div>

                <div>
                  <label for="pred-shock-outcome" style="font-weight:700;display:block;margin-bottom:0.25rem;">
                    2. Will everyone stay solvent (&gt;= $40 cash) through the Week 3 Surprise Expense?
                  </label>
                  <select id="pred-shock-outcome" class="rr-btn" style="width:100%;" data-action="update-prediction" data-pred-field="week3ShockOutcome">
                    <option value="liquidity_crunch" ${x.week3ShockOutcome==="liquidity_crunch"?"selected":""}>Liquidity Crunch (&lt; $40 cash for at least one roommate)</option>
                    <option value="all_solvent_buffered" ${x.week3ShockOutcome==="all_solvent_buffered"?"selected":""}>All Roommates Stay Above $40 Stress Threshold</option>
                  </select>
                </div>

                <div>
                  <label for="pred-behavioral-shift" style="font-weight:700;display:block;margin-bottom:0.25rem;">
                    3. Who will show the largest incentive-driven behavioral shift (overconsumption, underreporting, or conservation/chore rebate)?
                  </label>
                  <select id="pred-behavioral-shift" class="rr-btn" style="width:100%;" data-action="update-prediction" data-pred-field="behavioralShift">
                    ${w.map(t=>`<option value="${t}" ${x.behavioralShift===t?"selected":""}>${T[t].name} (${T[t].shortLabel})</option>`).join("")}
                  </select>
                </div>

                <button type="button" class="rr-btn rr-btn-primary" style="padding:0.7rem 1rem;font-size:0.95rem;" data-action="commit-and-run">
                  Commit Prediction &amp; Run 4-Week Simulation
                </button>
              </div>
            </section>

            <section class="rr-section" aria-label="Choose Household Policy">
              <div class="rr-section-header">
                <h2>Step 3: Choose Active Household Policy (Policy A)</h2>
                <span class="rr-badge">${g.shortTitle}</span>
              </div>
              <div class="rr-policy-grid" role="radiogroup" aria-label="Household Billing Policies">
                ${Ne.map(t=>`
                    <button type="button" class="rr-policy-card" role="radio" aria-checked="${t.id===i.activePolicyId}" data-action="select-policy" data-policy-id="${t.id}">
                      <strong style="font-size:0.9rem;">${t.shortTitle}</strong>
                      <span style="font-size:0.78rem;color:var(--rr-text-muted);">${t.tagline}</span>
                      <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-top:auto;">
                        <span class="rr-badge">Marginal Price: ${Math.round(t.marginalPriceSignal*100)}%</span>
                        ${t.collectsReserveBuffer?'<span class="rr-badge rr-badge-ok">+10% Reserve</span>':""}
                        ${t.chargesMeteringAdminFee?'<span class="rr-badge rr-badge-shock">$16/wk Fee</span>':""}
                      </div>
                    </button>
                  `).join("")}
              </div>
            </section>
          </div>

          <!-- Strict Money Conservation Banner -->
          <div class="rr-conservation-banner" role="status" aria-label="Strict Double-Entry Money Conservation Check">
            <div>
              <span>DOUBLE-ENTRY CONSERVATION AUDIT:</span>
              <span>Initial Cash ($${re.initialCash.toFixed(2)}) + Total Income ($${re.totalIncome.toFixed(2)}) - External Vendor Expenses ($${re.totalExpenses.toFixed(2)}) = Ending Roommate Cash ($${re.endingRoommateCash.toFixed(2)}) + Ending Household Reserve ($${re.endingHouseholdReserve.toFixed(2)})</span>
            </div>
            <span class="rr-badge rr-badge-ok">
              Discrepancy: $${re.discrepancyDollars.toFixed(2)} (${re.isConserved?"100% CONSERVED ✓":"ERROR"})
            </span>
          </div>

          <!-- 4-Week Animated Timeline & SVG Cash Bar Chart -->
          <section class="rr-section" aria-label="4-Week Simulation Timeline and Cash Trajectory">
            <div class="rr-section-header">
              <h2>Step 4: 4-Week Simulation Trajectory (${g.title})</h2>
              <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                <button type="button" class="rr-btn ${h==="ALL"?"rr-btn-active":""}" data-action="filter-week" data-week="ALL">All 4 Weeks</button>
                ${[1,2,3,4].map(t=>`<button type="button" class="rr-btn ${h===t?"rr-btn-active":""}" data-action="filter-week" data-week="${t}">Week ${t}${t===3?" ⚡":""}</button>`).join("")}
              </div>
            </div>

            <div class="rr-grid-2col" style="align-items:center;">
              <div>
                ${P(C)}
                <div style="display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center;font-size:0.78rem;margin-top:0.35rem;">
                  ${w.map(t=>`<span style="display:inline-flex;align-items:center;gap:0.3rem;"><span style="width:10px;height:10px;border-radius:2px;background:${T[t].color};display:inline-block;"></span>${T[t].name}</span>`).join("")}
                  <span style="display:inline-flex;align-items:center;gap:0.3rem;"><span style="width:10px;height:10px;border-radius:2px;background:#f59e0b;border:1px solid #78350f;display:inline-block;"></span>Shared Reserve ($${re.endingHouseholdReserve.toFixed(2)})</span>
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:0.55rem;">
                ${C.weeklySnapshots.map(t=>`
                  <div style="border:1px solid var(--rr-border);border-radius:8px;padding:0.6rem 0.8rem;background:${t.week===3?"#fff1f2":"#fdfcfa"};font-size:0.82rem;">
                    <div style="display:flex;justify-content:space-between;font-weight:700;">
                      <span>${t.ambientNote}</span>
                      <span>Utility Bill: $${t.totalUtilityBill.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;color:var(--rr-text-muted);margin-top:0.2rem;flex-wrap:wrap;gap:0.4rem;">
                      <span>End Cash: Maya $${t.roommateStates.maya.endingCash.toFixed(0)} · Devon $${t.roommateStates.devon.endingCash.toFixed(0)} · Priya $${t.roommateStates.priya.endingCash.toFixed(0)} · Leo $${t.roommateStates.leo.endingCash.toFixed(0)}</span>
                      <span>Reserve: $${t.endingHouseholdReserve.toFixed(2)} · Trust: ${t.averageHouseholdTrust}%</span>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </section>

          <!-- Step 5: Prediction Outcome & Trace-Backed Explanations -->
          <section class="rr-section" aria-label="Prediction Grading and Trace-Backed Ledger Explanations">
            <div class="rr-section-header">
              <h2>Step 5: Prediction Audit &amp; Trace-Backed Ledger Explanations</h2>
              <span class="rr-badge ${I.totalCorrect>=2?"rr-badge-ok":"rr-badge-shock"}">
                ${I.summaryHeadline}
              </span>
            </div>

            <div class="rr-explanation-list" style="margin-bottom:1rem;">
              ${I.items.map(t=>`
                <div class="rr-explanation-card" style="border-left-color:${t.isCorrect?"#059669":"#e11d48"};">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                    <strong>${t.title}</strong>
                    <span class="rr-badge ${t.isCorrect?"rr-badge-ok":"rr-badge-shock"}">${t.isCorrect?"Predicted ✓":"Surprise!"}</span>
                  </div>
                  <div style="font-size:0.8rem;margin-bottom:0.3rem;">
                    <strong>Your Prediction:</strong> ${t.predictedLabel}<br/>
                    <strong>Ledger Outcome:</strong> ${t.actualLabel}
                  </div>
                  <p style="margin:0 0 0.35rem;">${t.explanation}</p>
                  <div><strong>Ledger Evidence:</strong> ${H(t.evidenceTransactionIds)}</div>
                  <div class="rr-limitation-box">${t.assumptionNote}</div>
                </div>
              `).join("")}
            </div>

            <h3 style="font-size:0.98rem;margin:0 0 0.5rem;">Causal Ledger Trace &amp; Explicit Model Assumptions</h3>
            <div class="rr-explanation-list">
              ${C.explanations.map(t=>`
                <article class="rr-explanation-card">
                  <strong style="display:block;margin-bottom:0.25rem;">${t.headline}</strong>
                  <p style="margin:0 0 0.4rem;">${t.statement}</p>
                  <div style="margin-bottom:0.35rem;">
                    <strong>Cited Transactions:</strong> ${H(t.transactionIds)}
                  </div>
                  <div style="font-size:0.76rem;color:var(--rr-text-muted);">
                    <strong>Active Model Parameters:</strong> ${t.assumptionRefs.join(" · ")}
                  </div>
                  <div class="rr-limitation-box">${t.modelLimitationNote}</div>
                </article>
              `).join("")}
            </div>
          </section>

          <!-- Auditable Double-Entry Transaction & Chore Ledger Table -->
          <section class="rr-section" aria-label="Double-Entry Transaction and Chore Ledger">
            <div class="rr-section-header">
              <h2>Auditable Double-Entry Transaction &amp; Chore Ledger</h2>
              <div style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;">
                <button type="button" class="rr-btn ${E==="TRANSACTIONS"?"rr-btn-active":""}" data-action="set-ledger-tab" data-tab="TRANSACTIONS">
                  Financial Ledger (${Se.length})
                </button>
                <button type="button" class="rr-btn ${E==="CHORES"?"rr-btn-active":""}" data-action="set-ledger-tab" data-tab="CHORES">
                  Chore &amp; Morale Ledger (${G.length})
                </button>
                <select class="rr-btn" aria-label="Filter ledger by roommate" data-action="filter-roommate">
                  <option value="ALL" ${o==="ALL"?"selected":""}>All Roommates</option>
                  ${w.map(t=>`<option value="${t}" ${o===t?"selected":""}>${T[t].name}</option>`).join("")}
                </select>
                <select class="rr-btn" aria-label="Filter ledger by flow type" data-action="filter-flow">
                  <option value="ALL" ${d==="ALL"?"selected":""}>All Flow Categories</option>
                  <option value="EXTERNAL_INFLOW" ${d==="EXTERNAL_INFLOW"?"selected":""}>External Inflows (Income)</option>
                  <option value="INTERNAL_TRANSFER" ${d==="INTERNAL_TRANSFER"?"selected":""}>Internal Household Transfers</option>
                  <option value="EXTERNAL_OUTFLOW" ${d==="EXTERNAL_OUTFLOW"?"selected":""}>External Vendor Outflows</option>
                </select>
              </div>
            </div>

            ${E==="TRANSACTIONS"?`
              <div tabindex="0" role="region" aria-labelledby="rr-ledger-caption" class="rr-table-wrapper">
                <table>
                  <caption id="rr-ledger-caption">
                    Double-Entry Household Financial Ledger (${g.shortTitle} · ${Se.length} entries shown)
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Tx ID</th>
                      <th scope="col">Week</th>
                      <th scope="col">Type</th>
                      <th scope="col">From &rarr; To Account</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Explanation &amp; Model Parameter Drivers</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Se.map(t=>{const F=t.id===b;return`
                          <tr id="row-${t.id}" class="${F?"rr-tx-highlighted":""}">
                            <th scope="row">${t.id}</th>
                            <td>W${t.week}</td>
                            <td><span class="rr-badge">${t.type}</span></td>
                            <td style="font-family:ui-monospace,monospace;font-size:0.77rem;">${t.fromAccount} &rarr; ${t.toAccount}</td>
                            <td style="font-weight:700;">$${t.amount.toFixed(2)}</td>
                            <td>
                              <div>${t.description}</div>
                              <div style="font-size:0.74rem;color:var(--rr-text-muted);margin-top:0.15rem;">
                                Drivers: ${t.assumptionDrivers.join(" | ")}
                              </div>
                            </td>
                          </tr>
                        `}).join("")}
                  </tbody>
                </table>
              </div>
            `:`
              <div tabindex="0" role="region" aria-labelledby="rr-chore-caption" class="rr-table-wrapper">
                <table>
                  <caption id="rr-chore-caption">
                    Weekly Kitchen &amp; Cleaning Chore Ledger (${g.shortTitle})
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Chore ID</th>
                      <th scope="col">Week</th>
                      <th scope="col">Roommate</th>
                      <th scope="col">Completed / Target</th>
                      <th scope="col">Rebate / Surcharge</th>
                      <th scope="col">Explanation &amp; Trust Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${G.map(t=>`
                        <tr>
                          <th scope="row">${t.id}</th>
                          <td>W${t.week}</td>
                          <td><strong>${T[t.roommateId].name}</strong></td>
                          <td>${t.completedChores} / ${t.targetChores} (${t.choreDelta>=0?"+":""}${t.choreDelta})</td>
                          <td style="font-weight:700;">${t.rebateOrPenaltyDollars>=0?"+":""}$${t.rebateOrPenaltyDollars.toFixed(2)}</td>
                          <td>${t.note} (Trust delta: ${t.trustDelta>=0?"+":""}${t.trustDelta})</td>
                        </tr>
                      `).join("")}
                  </tbody>
                </table>
              </div>
            `}
          </section>

          <!-- Step 6: Side-by-Side Same-Events Counterfactual Policy Comparison View -->
          <section class="rr-section" aria-label="Same-Events Policy Comparison View">
            <div class="rr-section-header">
              <h2>Step 6: Same-Events Counterfactual Policy Comparison View</h2>
              <span class="rr-badge rr-badge-ok">
                Same Frozen Event Schedule Verified: ${D.sameScheduleVerified?"YES ✓":"NO"} (${D.scheduleSignature})
              </span>
            </div>
            <p style="margin:0 0 0.75rem;font-size:0.86rem;color:var(--rr-text-muted);">
              <strong>Hypothesis Prompt:</strong> ${S.hypothesisPrompt}
            </p>

            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center;margin-bottom:0.9rem;">
              <span style="font-weight:700;font-size:0.88rem;">Compare Policy A (${g.shortTitle}) against Counterfactual Policy B:</span>
              ${Ne.map(t=>`
                  <button type="button" class="rr-btn ${t.id===i.comparisonPolicyId?"rr-btn-active":""}" data-action="select-comparison-policy" data-policy-id="${t.id}">
                    ${t.shortTitle}
                  </button>
                `).join("")}
            </div>

            <div tabindex="0" role="region" aria-labelledby="rr-comp-caption" class="rr-table-wrapper" style="margin-bottom:0.9rem;">
              <table>
                <caption id="rr-comp-caption">
                  Side-by-Side Counterfactual Outcome Table on Identical Schedule (${g.shortTitle} vs. ${O.shortTitle})
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Roommate</th>
                    <th scope="col">End Cash (Policy A)</th>
                    <th scope="col">End Cash (Policy B)</th>
                    <th scope="col">Net Cash Delta (B - A)</th>
                    <th scope="col">True Usage (A &rarr; B)</th>
                    <th scope="col">Underreported (A &rarr; B)</th>
                  </tr>
                </thead>
                <tbody>
                  ${w.map(t=>{const F=D.roommateDeltas[t],p=F.cashDeltaBMinusA>=0;return`
                      <tr>
                        <th scope="row">${F.name}</th>
                        <td>$${F.endingCashA.toFixed(2)}</td>
                        <td>$${F.endingCashB.toFixed(2)}</td>
                        <td style="font-weight:700;color:${p?"var(--rr-success)":"var(--rr-danger)"};">
                          ${p?"+":""}$${F.cashDeltaBMinusA.toFixed(2)}
                        </td>
                        <td>$${F.trueConsumptionA.toFixed(2)} &rarr; $${F.trueConsumptionB.toFixed(2)} (${F.consumptionDeltaBMinusA>=0?"+":""}$${F.consumptionDeltaBMinusA.toFixed(2)})</td>
                        <td>$${F.underreportedA.toFixed(2)} &rarr; $${F.underreportedB.toFixed(2)}</td>
                      </tr>
                    `}).join("")}
                </tbody>
              </table>
            </div>

            <div class="rr-explanation-list">
              ${D.comparisonInsights.map(t=>`
                <div class="rr-explanation-card">
                  <strong style="display:block;margin-bottom:0.25rem;">${t.title}</strong>
                  <p style="margin:0 0 0.35rem;">${t.body}</p>
                  <div style="font-size:0.78rem;margin-bottom:0.25rem;">
                    <strong>Policy A Ledger Refs:</strong> ${H(t.runATransactionIds)}
                  </div>
                  <div class="rr-limitation-box">${t.assumptionAttribution}</div>
                </div>
              `).join("")}
            </div>
          </section>

          <!-- Step 7: 3 Short Interactive Debrief Prompts -->
          <section class="rr-section" aria-label="Experimental Debrief Prompts">
            <div class="rr-section-header">
              <h2>Step 7: Experimental Debrief — Ledger Evidence &amp; Model Limitations</h2>
              <span class="rr-badge">
                ${Object.keys(i.debriefAnswers).length} / ${Me.length} Answered
              </span>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.9rem;">
              ${Me.map(t=>{const F=i.debriefAnswers[t.id],p=t.options.find(n=>n.id===F);return`
                  <div class="rr-explanation-card" style="border-left-color:#6d28d9;">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                      <strong>Prompt #${t.number} (${t.category}): ${t.question}</strong>
                    </div>
                    <p style="margin:0.25rem 0 0.5rem;font-size:0.79rem;color:var(--rr-text-muted);">${t.contextHint}</p>
                    <div style="display:flex;flex-direction:column;gap:0.4rem;">
                      ${t.options.map(n=>{const Y=F===n.id;return`
                            <label style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.45rem 0.6rem;border-radius:6px;border:1px solid ${Y?"#b45309":"var(--rr-border)"};background:${Y?"#fffbeb":"#ffffff"};cursor:pointer;font-size:0.82rem;">
                              <input type="radio" name="debrief-${t.id}" value="${n.id}" ${Y?"checked":""} data-action="answer-debrief" data-prompt-id="${t.id}" data-option-id="${n.id}"/>
                              <span>${n.label}</span>
                            </label>
                          `}).join("")}
                    </div>
                    ${p?`
                      <div style="margin-top:0.5rem;padding:0.5rem 0.7rem;border-radius:6px;background:${p.isCorrect?"var(--rr-success-bg)":"var(--rr-danger-bg)"};color:${p.isCorrect?"var(--rr-success)":"var(--rr-danger)"};font-size:0.81rem;font-weight:600;">
                        ${p.explanation}
                      </div>
                    `:""}
                  </div>
                `}).join("")}
            </div>
          </section>

          ${c?`
            <section class="rr-debug-drawer" aria-label="Debug Telemetry Inspector">
              <h3 style="margin-top:0;color:#fbbf24;">DEBUG INSPECTOR [D] — Frozen Schedule &amp; Conservation Telemetry</h3>
              <pre style="margin:0;white-space:pre-wrap;">${JSON.stringify({seed:i.seed,scenarioId:i.activeScenarioId,activePolicyId:i.activePolicyId,comparisonPolicyId:i.comparisonPolicyId,scheduleSignature:C.scheduleSignature,conservation:C.conservation,week3SurpriseExpense:ce},null,2)}</pre>
            </section>
          `:""}
        </div>
      </div>
    `,_(l)}function ue(S){const g=S.target?.closest("[data-action]");if(!g)return;const O=g.dataset.action;if(O==="select-scenario"){const x=g.dataset.scenarioId;x&&x in z&&(R.playPenClick(),i.activeScenarioId=x,i.activePolicyId=z[x].defaultPolicyId,i.comparisonPolicyId=z[x].recommendedComparisonPolicyId,h="ALL",b=null,v(),B())}else if(O==="select-policy"){const x=g.dataset.policyId;x&&x in W&&(R.playPenClick(),i.activePolicyId=x,v(),B())}else if(O==="select-comparison-policy"){const x=g.dataset.policyId;x&&x in W&&(R.playPenClick(),i.comparisonPolicyId=x,i.completedComparisons.includes(i.activeScenarioId)||i.completedComparisons.push(i.activeScenarioId),v(),B())}else if(O==="commit-and-run")i.committedPredictionsByScenario[i.activeScenarioId]=!0,i.completedScenarios.includes(i.activeScenarioId)||i.completedScenarios.push(i.activeScenarioId),v(),R.playCashChime(1),R.playShockBell(),R.playRevealFanfare(I.totalCorrect),B();else if(O==="filter-week"){const x=g.dataset.week;R.playPenClick(),h=x==="ALL"?"ALL":Number(x),B()}else if(O==="set-ledger-tab"){const x=g.dataset.tab;R.playPenClick(),E=x,B()}else if(O==="focus-tx"){const x=g.dataset.txId;if(x){R.playPenClick(),E="TRANSACTIONS",h="ALL",o="ALL",d="ALL",b=x,B();const j=l.querySelector(`#row-${x}`);j&&typeof j.scrollIntoView=="function"&&j.scrollIntoView({behavior:"smooth",block:"center"})}}else if(O==="toggle-assumptions")R.playPenClick(),f=!f,B();else if(O==="reset-assumptions")R.playPenClick(),i.assumptionsByScenario[i.activeScenarioId]=Ce(),v(),B();else if(O==="new-seed"){const x=i.seed+1013>>>0;R.playCashChime(2),ke(x)}else if(O==="toggle-mute")R.setMuted(!R.isMuted()),B();else if(O==="export-json"){R.playPenClick();const x=Ge(i);typeof navigator<"u"&&navigator.clipboard&&navigator.clipboard.writeText(x).catch(()=>{})}else O==="toggle-debug"&&he()}function k(S){const g=S.target;if(!g)return;const O=g.dataset.action;if(O==="update-prediction"){const x=g.dataset.predField;x&&(R.playPenClick(),i.predictionsByScenario[i.activeScenarioId][x]=g.value,v(),B())}else if(O==="filter-roommate")o=g.value,B();else if(O==="filter-flow")d=g.value,B();else if(O==="answer-debrief"){const x=g.dataset.promptId,j=g.dataset.optionId;x&&j&&(R.playPenClick(),i.debriefAnswers[x]=j,Ie(i),B())}else if(O==="assumption-slider"){const x=g.dataset.roommate,j=g.dataset.field,te=Number(g.value);x&&j&&Number.isFinite(te)&&(i.assumptionsByScenario[i.activeScenarioId].roommates[x][j]=te,v(),B())}}function M(S){const g=S.target;g&&g.matches('input[type="range"].rr-slider')&&(g.style.setProperty("--attr-min",g.min||"0"),g.style.setProperty("--attr-max",g.max||"100"),g.style.setProperty("--control-value",g.value))}function V(S){if(S.key==="d"||S.key==="D"){const g=document.activeElement?.tagName.toLowerCase();g!=="input"&&g!=="select"&&g!=="textarea"&&he()}}function ke(S){const g=Math.floor(S)>>>0;i.seed=g;for(const O of Object.keys(z))i.frozenSchedulesByScenario[O]=$e(O,g);v(),B()}function he(S){c=S!==void 0?S:!c,B()}return l.addEventListener("click",ue),l.addEventListener("change",k),l.addEventListener("input",M),typeof window<"u"&&window.addEventListener("keydown",V),B(),{destroy(){l.removeEventListener("click",ue),l.removeEventListener("change",k),l.removeEventListener("input",M),typeof window<"u"&&window.removeEventListener("keydown",V),R.destroy(),l.innerHTML=""},getStateSnapshot(){return{persisted:i,activeRun:C,predictionGrade:I,comparisonResult:D,debugEnabled:c}},restartWithSeed:ke,toggleDebug:he}}const Xe={id:L.GAME_ID,number:L.GAME_NUMBER,title:L.TITLE,subtitle:L.SUBTITLE,genre:"Incentive Prediction, Experiment & Policy Simulation Lab",primaryReference:"The Evolution of Trust (Nicky Case)",supportingReference:"Lichess Post-Game Counterfactual Review",oneSentenceLoop:"Inspect roommate incentive parameters, commit to a testable prediction, enact a household billing policy across 4 simulated weeks, and audit the double-entry ledger side-by-side on the exact same frozen external event schedule.",shortGoal:"Predict who pays the most and whether everyone survives the Week 3 Surprise Expense without liquidity stress.",longGoal:"Compare all 4 household policies across all 3 scenarios on frozen event schedules, test parameter sensitivity via the Assumptions Sliders, and complete the 3 Debrief Prompts.",controlsSummary:"Mouse / Touch / Keyboard: Select scenario & prediction, choose policy, click transaction ID chips to highlight ledger rows, adjust native range sliders, press [D] for Debug telemetry.",accentColor:L.ACCENT_COLOR};function Je(l,a){return Ke(l,a)}const st={metadata:Xe,mountGame:Je},lt=Object.freeze(Object.defineProperty({__proto__:null,DEBRIEF_PROMPTS:Me,GAME_CONFIG:L,POLICIES:W,POLICY_LIST:Ne,ROOMMATE_ORDER:w,ROOMMATE_PROFILES:T,RoommateAudio:Ye,SCENARIOS:z,SCENARIO_LIST:ze,SeededRng:Oe,allocateCentsByWeights:ve,buildLedgerExplanations:je,clearPersistedState:it,cloneAssumptions:De,comparePoliciesOnSameEvents:Ve,createDefaultAssumptions:Ce,createDefaultPersistedState:xe,createRoommateRepublicUI:Ke,default:st,exportStateToJson:Ge,generateExternalEventSchedule:$e,gradePrediction:_e,hashString:Ae,importStateFromJson:ot,loadPersistedState:qe,metadata:Xe,mountGame:Je,savePersistedState:Ie,simulateHouseholdRun:Pe,validateAndNormalizeState:Be},Symbol.toStringTag,{value:"Module"}));export{lt as g,Je as m};
