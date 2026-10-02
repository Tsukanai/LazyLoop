/* LazyLoop thermocouple. NIST Monograph 175 / SRD 60 ITS-90 forward coefficients. */

const CFG = {"min":-270,"max":400,"parts":[[0,[0,0.038748106364,4.4194434347e-05,1.1844323105e-07,2.0032973554e-08,9.0138019559e-10,2.2651156593e-11,3.6071154205e-13,3.8493939883e-15,2.8213521925e-17,1.4251594779e-19,4.8768662286e-22,1.079553927e-24,1.3945027062e-27,7.9795153927e-31]],[400,[0,0.038748106364,3.329222788e-05,2.0618243404e-07,-2.1882256846e-09,1.0996880928e-11,-3.0815758772e-14,4.547913529e-17,-2.7512901673e-20]]],"type":"T"};
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
