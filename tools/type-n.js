/* LazyLoop thermocouple. NIST Monograph 175 / SRD 60 ITS-90 forward coefficients. */

const CFG = {"min":-270,"max":1300,"parts":[[0,[0,0.026159105962,1.0957484228e-05,-9.3841111554e-08,-4.6412039759e-11,-2.6303357716e-12,-2.2653438003e-14,-7.6089300791e-17,-9.3419667835e-20]],[1300,[0,0.025929394601,1.571014188e-05,4.3825627237e-08,-2.5261169794e-10,6.4311819339e-13,-1.0063471519e-15,9.9745338992e-19,-6.0863245607e-22,2.0849229339e-25,-3.0682196151e-29]]],"type":"N"};
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
