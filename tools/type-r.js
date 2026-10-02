/* LazyLoop thermocouple. NIST Monograph 175 / SRD 60 ITS-90 forward coefficients. */

const CFG = {"min":-50,"max":1768.1,"parts":[[1064.18,[0,0.00528961729765,1.39166589782e-05,-2.38855693017e-08,3.56916001063e-11,-4.62347666298e-14,5.00777441034e-17,-3.73105886191e-20,1.57716482367e-23,-2.81038625251e-27]],[1664.5,[2.95157925316,-0.00252061251332,1.59564501865e-05,-7.64085947576e-09,2.05305291024e-12,-2.93359668173e-16]],[1768.1,[152.232118209,-0.268819888545,0.000171280280471,-3.45895706453e-08,-9.34633971046e-15]]],"type":"R"};
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
