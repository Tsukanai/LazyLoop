/* LazyLoop thermocouple. NIST Monograph 175 / SRD 60 ITS-90 forward coefficients. */

const CFG = {"min":0,"max":1820,"parts":[[630.615,[0,-0.00024650818346,5.9040421171e-06,-1.3257931636e-09,1.5668291901e-12,-1.694452924e-15,6.2990347094e-19]],[1820,[-3.8938168621,0.02857174747,-8.4885104785e-05,1.5785280164e-07,-1.6835344864e-10,1.1109794013e-13,-4.4515431033e-17,9.8975640821e-21,-9.3791330289e-25]]],"type":"B"};
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
