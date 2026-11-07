
/*
    LazyLoop
    Type E Thermocouple Calculator

    Reference:
        NIST Monograph 175 / ITS-90

    Temperature range:
        -270 °C to +1000 °C

    Cold-junction compensation:
        Emeasured = Ehot - Ecold

    Decimal comma and point supported
    through shared parseInput().
*/


// --------------------------------------------------
// Temperature limits
// --------------------------------------------------

const MIN_TEMP = -270;
const MAX_TEMP = 1000;


// --------------------------------------------------
// NIST Type E coefficients
// --------------------------------------------------

// -270 °C to 0 °C

const LOW_COEFFICIENTS = [
    0.000000000000e+0,
    0.586655087080e-1,
    0.454109771240e-4,
    -0.779980486860e-6,
    -0.258001608430e-7,
    -0.594525830570e-9,
    -0.932140586670e-11,
    -0.102876055340e-12,
    -0.803701236210e-15,
    -0.439794973910e-17,
    -0.164147763550e-19,
    -0.396736195160e-22,
    -0.558273287210e-25,
    -0.346578420130e-28
];


// 0 °C to +1000 °C

const HIGH_COEFFICIENTS = [
    0.000000000000e+0,
    0.586655087100e-1,
    0.450322755820e-4,
    0.289084072120e-7,
    -0.330568966520e-9,
    0.650244032700e-12,
    -0.191974955040e-15,
    -0.125366004970e-17,
    0.214892175690e-20,
    -0.143880417820e-23,
    0.359608994810e-27
];


// --------------------------------------------------
// HTML elements
// --------------------------------------------------

const coldJunction =
    document.getElementById("coldJunction");

const emf =
    document.getElementById("emf");

const temperature =
    document.getElementById("temperature");

const cjcDisplay =
    document.getElementById("cjcDisplay");

const hotDisplay =
    document.getElementById("hotDisplay");

const emfDisplay =
    document.getElementById("emfDisplay");


// --------------------------------------------------
// Shared input parsing
// --------------------------------------------------

function read(element) {
    return parseInput(element.value);
}


// --------------------------------------------------
// Temperature validation
// --------------------------------------------------

function temperatureIsValid(t) {
    return (
        Number.isFinite(t) &&
        t >= MIN_TEMP &&
        t <= MAX_TEMP
    );
}


// --------------------------------------------------
// NIST reference function
//
// Temperature -> EMF relative to 0 °C
// Result in millivolts
// --------------------------------------------------

function referenceEmf(t) {

    if (!temperatureIsValid(t)) {
        return NaN;
    }

    const coefficients =
        t < 0
            ? LOW_COEFFICIENTS
            : HIGH_COEFFICIENTS;

    // Horner's polynomial evaluation

    let result = 0;

    for (
        let i = coefficients.length - 1;
        i >= 0;
        i--
    ) {
        result =
            result * t + coefficients[i];
    }

    return result;
}


// --------------------------------------------------
// Number formatting
// --------------------------------------------------

function formatEmf(value) {
    return Number(
        value.toFixed(4)
    ).toString();
}


function formatTemperature(value) {
    return Number(
        value.toFixed(2)
    ).toString();
}


// --------------------------------------------------
// Summary displays
// --------------------------------------------------

function updateDisplays() {

    const cold = read(coldJunction);
    const hot = read(temperature);
    const measured = read(emf);

    cjcDisplay.textContent =
        temperatureIsValid(cold)
            ? formatTemperature(cold) + " °C"
            : "—";

    hotDisplay.textContent =
        temperatureIsValid(hot)
            ? formatTemperature(hot) + " °C"
            : "—";

    emfDisplay.textContent =
        Number.isFinite(measured)
            ? formatEmf(measured) + " mV"
            : "—";
}


// --------------------------------------------------
// Hot junction -> measured EMF
// --------------------------------------------------

function temperatureToEmf() {

    const hot = read(temperature);
    const cold = read(coldJunction);

    if (
        !temperatureIsValid(hot) ||
        !temperatureIsValid(cold)
    ) {
        emf.value = "";
        updateDisplays();
        return;
    }

    const measured =
        referenceEmf(hot) -
        referenceEmf(cold);

    emf.value =
        formatEmf(measured);

    updateDisplays();
}


// --------------------------------------------------
// Measured EMF -> hot junction
// --------------------------------------------------

function emfToTemperature() {

    const measured = read(emf);
    const cold = read(coldJunction);

    if (
        !Number.isFinite(measured) ||
        !temperatureIsValid(cold)
    ) {
        temperature.value = "";
        updateDisplays();
        return;
    }

    // Cold-junction compensation

    const target =
        measured + referenceEmf(cold);

    const minimumEmf =
        referenceEmf(MIN_TEMP);

    const maximumEmf =
        referenceEmf(MAX_TEMP);

    if (
        target < minimumEmf ||
        target > maximumEmf
    ) {
        temperature.value = "";
        updateDisplays();
        return;
    }

    // Bisection solver
    // Type E is monotonic over the supported range.

    let low = MIN_TEMP;
    let high = MAX_TEMP;

    for (let i = 0; i < 80; i++) {

        const middle =
            (low + high) / 2;

        const middleEmf =
            referenceEmf(middle);

        if (middleEmf < target) {
            low = middle;
        } else {
            high = middle;
        }
    }

    temperature.value =
        formatTemperature(
            (low + high) / 2
        );

    updateDisplays();
}


// --------------------------------------------------
// Event listeners
// --------------------------------------------------

temperature.addEventListener(
    "input",
    temperatureToEmf
);

emf.addEventListener(
    "input",
    emfToTemperature
);

coldJunction.addEventListener(
    "input",
    temperatureToEmf
);


// --------------------------------------------------
// Initial calculation
// --------------------------------------------------

temperatureToEmf();
