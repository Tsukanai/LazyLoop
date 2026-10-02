/* LazyLoop thermocouple. NIST Monograph 175 / SRD 60 ITS-90 forward coefficients. */

const CFG = {"min":-50,"max":1768.1,"parts":[[1064.18,[0,0.00540313308631,1.2593428974e-05,-2.32477968689e-08,3.22028823036e-11,-3.31465196389e-14,2.55744251786e-17,-1.25068871393e-20,2.71443176145e-24]],[1664.5,[1.32900444085,0.00334509311344,6.54805192818e-06,-1.64856259209e-09,1.29989605174e-14]],[1768.1,[146.628232636,-0.258430516752,0.000163693574641,-3.30439046987e-08,-9.43223690612e-15]]],"type":"S"};
const coldJunction = document.getElementById('coldJunction');
const emf = document.getElementById('emf');
const temperature = document.getElementById('temperature');
const cjcDisplay = document.getElementById('cjcDisplay');
const hotDisplay = document.getElementById('hotDisplay');
const emfDisplay = document.getElementById('emfDisplay');
const read = el => el.value.trim() === '' ? NaN : Number(el.value);
const valid = t => Number.isFinite(t) && t >= CFG.min && t <= CFG.max;
function referenceEmf(t) {
    if (!valid(t)) return NaN;
    const coefficients = CFG.parts.find(part => t <= part[0] + 1e-9)[1];
    let v = 0;
    for (let i = coefficients.length - 1; i >= 0; i--) v = v * t + coefficients[i];
    return v;
}
const fmt = (x, places) => Number(x.toFixed(places)).toString();
function updateDisplays() {
    const values = [[coldJunction,cjcDisplay,' °C',2],[temperature,hotDisplay,' °C',2],[emf,emfDisplay,' mV',4]];
    for (const [field,display,unit,places] of values) {
        const v=read(field);
        display.textContent=Number.isFinite(v) ? fmt(v,places)+unit : '—';
    }
}
function temperatureToEmf() {
    const hot=read(temperature), cold=read(coldJunction);
    emf.value=valid(hot)&&valid(cold) ? fmt(referenceEmf(hot)-referenceEmf(cold),4) : '';
    updateDisplays();
}
function emfToTemperature() {
    const measured=read(emf), cold=read(coldJunction);
    if (!Number.isFinite(measured)||!valid(cold)) {temperature.value='';updateDisplays();return;}
    const target=measured+referenceEmf(cold);

    // Type B has a non-monotonic low-temperature section: the inverse is ambiguous.
    // The NIST inverse function is specified only from 0.291 mV (~250 °C) upwards.

    const low=CFG.type==='B'?250:CFG.min;
    const bottom=referenceEmf(low), top=referenceEmf(CFG.max);
    if (target<bottom-0.0000001||target>top+0.0000001) {temperature.value='';updateDisplays();return;}
    let a=low,b=CFG.max;
    for(let i=0;i<80;i++) {
        const mid=(a+b)/2;
        if(referenceEmf(mid)<target) a=mid; else b=mid;
    }
    temperature.value=fmt((a+b)/2,2);
    updateDisplays();
}
temperature.addEventListener('input',temperatureToEmf);
emf.addEventListener('input',emfToTemperature);
coldJunction.addEventListener('input',temperatureToEmf);
temperatureToEmf();
