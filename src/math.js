// M0VE scenario tools. All price comparisons refer to the sourced historical street snapshot.
// Property-type adjustments are transparent demo assumptions, not vendor supplied rates.
export const STREET = Object.freeze({average:435500,ratePerSqft:308,typicalArea:1351,minSale:340000,maxSale:615000,sales:18,sector:421800,district:230800,city:211000});
export const PROPERTY_MULTIPLIER = Object.freeze({benchmark:1,detached:1.22,semi:1.07,terraced:.91,flat:.78});
export const TYPE_LABEL = Object.freeze({benchmark:'Street benchmark',detached:'Detached',semi:'Semi-detached',terraced:'Terraced',flat:'Apartment'});
const formatGbp = (n, round=0) => new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:round,minimumFractionDigits:round}).format(Number.isFinite(n)?n:0);
const compact = n=>new Intl.NumberFormat('en-GB',{maximumFractionDigits:0}).format(n);
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const $ = s=>document.querySelector(s);
const $$ = s=>[...document.querySelectorAll(s)];
function asNumber(selector,fallback,min,max){const n=Number($(selector)?.value);return Number.isFinite(n)?clamp(n,min,max):fallback}
function setText(selector,value){let elem=$(selector);if(elem)elem.textContent=value}
export function calculateValuation(areaSqft=STREET.typicalArea,type='benchmark',newBuild=false){let area=clamp(Number(areaSqft)||STREET.typicalArea,200,10000);let rate=STREET.ratePerSqft*(PROPERTY_MULTIPLIER[type]??1)*(newBuild?1.1:1);return {area,rate,value:Math.round(area*rate/100)*100};}
export function calculateMortgage(price=435500,depositPercent=20,annualRate=4.5,years=25){price=clamp(Number(price)||0,0,100000000);depositPercent=clamp(Number(depositPercent)||0,0,95);annualRate=clamp(Number(annualRate)||0,0,25);years=clamp(Number(years)||1,1,40);const deposit=price*depositPercent/100,loan=price-deposit,months=years*12,r=annualRate/1200,monthly=r?loan*(r*Math.pow(1+r,months))/(Math.pow(1+r,months)-1):loan/months;return {deposit,loan,monthly,interest:Math.max(0,monthly*months-loan),total:monthly*months};}
export function calculateStampDuty(price=435500,status='standard'){
 price=clamp(Number(price)||0,0,100000000); // England only, bands in force after 1 April 2025, verified against GOV.UK in Oct 2026.
 const bands=(status==='first'&&price<=500000)?[[300000,0],[500000,.05]]:[[125000,0],[250000,.02],[925000,.05],[1500000,.1],[Infinity,.12]];
 let previous=0,total=0;for(const [ceiling,rate]of bands){const taxable=Math.max(0,Math.min(price,ceiling)-previous);total+=taxable*(rate+(status==='additional'?.05:0));previous=ceiling;if(price<=ceiling)break;}
 total=Math.round(total*100)/100;return {total,price,grand:price+total,effective:price?total/price*100:0};
}
export function calculateRentalYield(price=435500,monthlyRent=1800,annualCosts=2500,emptyMonths=1){price=Math.max(1,Number(price)||1);monthlyRent=Math.max(0,Number(monthlyRent)||0);annualCosts=Math.max(0,Number(annualCosts)||0);emptyMonths=clamp(Number(emptyMonths)||0,0,12);const received=monthlyRent*(12-emptyMonths),gross=monthlyRent*12/price*100,netIncome=received-annualCosts,net=netIncome/price*100;return{received,gross,netIncome,net};}
export function calculateOffer(asking=450000,offer=425000){asking=Math.max(0,Number(asking)||0);offer=Math.max(0,Number(offer)||0);return {difference:asking-offer,relative:asking?(offer-asking)/asking*100:0,vsStreet:(offer-STREET.average)/STREET.average*100};}
const compareNames={sector:'CV4 7 POSTCODE SECTOR',district:'CV4 POSTCODE DISTRICT',city:'COVENTRY CITY'};
function directionalPercent(value){return `${Math.abs(value).toFixed(1)}% ${value<0?'lower':value>0?'higher':'equal'}`;}
export function initCalculators(){
 const state={type:'benchmark',newBuild:false,unit:'sqft',sqft:1351};
 const areaInput=$('#areaInput'),range=$('#areaRange');
 const updateValuation=()=>{const calc=calculateValuation(state.sqft,state.type,state.newBuild);const sqft=Math.round(calc.area);const description=`${TYPE_LABEL[state.type]} · ${state.newBuild?'New build scenario':'Existing home'} · ${compact(sqft)} sq ft`;
 setText('#valuationTotal',formatGbp(calc.value));setText('#valuationSubtitle',description);setText('#valuationEquation',`${compact(sqft)} sq ft × ${formatGbp(calc.rate,2)} per sq ft`);
 setText('#valuationDisclosure',(state.type!=='benchmark'||state.newBuild)?'Property-type and new build adjustments are transparent hypothetical scenario assumptions, not independently calibrated local rates.':'Baseline from the published street average £308 per sq ft, not an individual valuation.');
 const marker=$('#spectrumMarker');marker.style.left=`${clamp((calc.value-STREET.minSale)/(STREET.maxSale-STREET.minSale)*100,0,100)}%`;
 areaInput.value=state.unit==='sqft'?Math.round(state.sqft):Math.round(state.sqft/10.7639);range.value=clamp(state.sqft,300,3500);
 };
 const setArea=val=>{const n=Number(val);if(!Number.isFinite(n))return;state.sqft=clamp(state.unit==='sqft'?n:n*10.7639,200,10000);updateValuation();};
 $$('.property-options button').forEach(btn=>btn.addEventListener('click',()=>{state.type=btn.dataset.property;$$('.property-options button').forEach(b=>{b.classList.toggle('selected',b===btn);b.setAttribute('aria-pressed',b===btn?'true':'false')});updateValuation()}));
 $$('[data-newbuild]').forEach(btn=>btn.addEventListener('click',()=>{state.newBuild=btn.dataset.newbuild==='true';$$('[data-newbuild]').forEach(b=>{b.classList.toggle('selected',b===btn);b.setAttribute('aria-pressed',b===btn?'true':'false')});updateValuation()}));
 $$('[data-unit]').forEach(btn=>btn.addEventListener('click',()=>{state.unit=btn.dataset.unit;$$('[data-unit]').forEach(b=>b.classList.toggle('active',b===btn));setText('#areaUnit',state.unit==='sqft'?'sq ft':'sq m');setText('#minArea',state.unit==='sqft'?'300 sq ft':'28 sq m');setText('#maxArea',state.unit==='sqft'?'3,500 sq ft':'325 sq m');updateValuation()}));
 areaInput.addEventListener('input',()=>{if(areaInput.value!=='')setArea(areaInput.value)});range.addEventListener('input',()=>{state.sqft=Number(range.value);updateValuation()});
 $('#areaReset').addEventListener('click',()=>{state.sqft=STREET.typicalArea;updateValuation()});$('#valuationReset').addEventListener('click',()=>{state.type='benchmark';state.newBuild=false;state.unit='sqft';state.sqft=STREET.typicalArea;$$('.property-options button').forEach(b=>b.classList.toggle('selected',b.dataset.property==='benchmark'));$$('[data-newbuild]').forEach(b=>b.classList.toggle('selected',b.dataset.newbuild==='false'));$$('[data-unit]').forEach(b=>b.classList.toggle('active',b.dataset.unit==='sqft'));setText('#areaUnit','sq ft');setText('#minArea','300 sq ft');setText('#maxArea','3,500 sq ft');updateValuation()});
 $('#comparisonSelect').addEventListener('change',e=>{const key=e.target.value,n=STREET[key],delta=(n/STREET.average-1)*100;setText('#compareName',compareNames[key]);setText('#comparePrice',formatGbp(n));setText('#compareDelta',`${Math.round(Math.abs(delta))}% ${delta<0?'lower':'higher'}`);setText('#compareText',`The ${key==='city'?'city':key} average is ${formatGbp(Math.abs(STREET.average-n))} ${n<STREET.average?'below':'above'} Merynton Avenue's £435,500 historical average.`);$('#compareBar').style.width=`${n/STREET.average*100}%`;});
 function renderMortgage(){const x=calculateMortgage(asNumber('#mortgagePrice',435500,10000,100000000),asNumber('#mortgageDeposit',20,0,95),asNumber('#mortgageRate',4.5,0,25),asNumber('#mortgageTerm',25,1,40));setText('#mortgageMonthly',formatGbp(Math.round(x.monthly)));setText('#mortgageDepositAmount',formatGbp(x.deposit));setText('#mortgageLoan',formatGbp(x.loan));setText('#mortgageInterest',formatGbp(x.interest));const p=x.total?x.loan/x.total*100:100;$('#mortgagePrincipalBar').style.width=`${p}%`;$('#mortgageInterestBar').style.width=`${100-p}%`}
 ['#mortgagePrice','#mortgageDeposit','#mortgageRate','#mortgageTerm'].forEach(s=>$(s).addEventListener('input',renderMortgage));
 function renderStamp(){const x=calculateStampDuty(asNumber('#stampPrice',435500,0,100000000),$('#stampBuyer').value);setText('#stampTotal',formatGbp(x.total));setText('#stampPropertyPrice',formatGbp(x.price));setText('#stampEffective',`${x.effective.toFixed(2)}%`);setText('#stampGrand',formatGbp(x.grand))}
 ['#stampPrice','#stampBuyer'].forEach(s=>$(s).addEventListener('input',renderStamp));
 function renderOffer(){const x=calculateOffer(asNumber('#offerAsking',450000,0,100000000),asNumber('#offerPrice',425000,0,100000000));setText('#offerDifference',directionalPercent(x.relative));setText('#offerSaving',formatGbp(Math.abs(x.difference)));setText('#offerAgainstStreet',directionalPercent(x.vsStreet))}
 ['#offerAsking','#offerPrice'].forEach(s=>$(s).addEventListener('input',renderOffer));
 function renderYield(){const v=calculateRentalYield(asNumber('#yieldPrice',435500,1,1e9),asNumber('#yieldRent',1800,0,1e8),asNumber('#yieldCosts',2500,0,1e8),asNumber('#yieldVacancy',1,0,12));setText('#yieldNet',`${v.net.toFixed(2)}%`);setText('#yieldGross',`${v.gross.toFixed(2)}%`);setText('#yieldReceived',formatGbp(v.received));setText('#yieldIncome',formatGbp(v.netIncome));}
 ['#yieldPrice','#yieldRent','#yieldCosts','#yieldVacancy'].forEach(s=>$(s).addEventListener('input',renderYield));
 $$('.tools-tabs button').forEach(btn=>btn.addEventListener('click',()=>{$$('.tools-tabs button').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-selected',b===btn?'true':'false')});$$('.tool-panel').forEach(p=>{let active=p.id===`tool-${btn.dataset.tool}`;p.hidden=!active;p.classList.toggle('active',active)})}));
 $('#offerCopy').addEventListener('click',async()=>{const x=calculateOffer(asNumber('#offerAsking',450000,0,100000000),asNumber('#offerPrice',425000,0,100000000));const msg=`M0VE illustrative offer scenario: asking ${formatGbp(asNumber('#offerAsking',450000,0,100000000))}, offer ${formatGbp(asNumber('#offerPrice',425000,0,100000000))}, ${directionalPercent(x.relative)} than asking, ${directionalPercent(x.vsStreet)} versus the Merynton Avenue historical average (£435,500). Not a comparable valuation or offer recommendation.`;try{await navigator.clipboard.writeText(msg);setText('#copyStatus','Scenario copied to clipboard.')}catch{setText('#copyStatus','Copy unavailable in this browser.')}});
 updateValuation();renderMortgage();renderStamp();renderOffer();renderYield();
}
