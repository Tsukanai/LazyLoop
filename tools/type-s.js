
/*
    LazyLoop
    Type S Thermocouple Calculator

    Reference:
        NIST Monograph 175 / ITS-90

    Valid range:
        -50 °C to +1768.1 °C

    Cold-junction compensation:
        Emeasured = Ehot - Ecold

    Decimal comma and point supported
    through shared parseInput().
*/


// --------------------------------------------------
// Temperature limits
// --------------------------------------------------

const MIN_TEMP = -50;
const MAX_TEMP = 1768.1;


// --------------------------------------------------
// NIST Type S coefficients
// --------------------------------------------------

// -50 °C to +1064.18 °C

const LOW_COEFFICIENTS = [
    0,
    0.00540313308631,
    1.2593428974e-05,
    -2.32477968689e-08,
    3.22028823036e-11,
    -3.31465196389e-14,
    2.55744251786e-17,
    -1.25068871393e-20,
    2.71443176145e-24
];


// +1064.18 °C to +1664.5 °C

const MID_COEFFICIENTS = [
    1.32900444085,
    0.00334509311344,
    6.54805192818e-06,
    -1.64856259209e-09,
    1.29989605174e-14
];


// +1664.5 °C to +1768.1 °C

const HIGH_COEFFICIENTS = [
    146.628232636,
    -0.258430516752,
    0.000163693574641,
    -3.30439046987e-08,
    -9.43223690612e-15
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

    let coefficients;

    if (t <= 1064.18) {
        coefficients = LOW_COEFFICIENTS;
    }
    else if (t <= 1664.5) {
        coefficients = MID_COEFFICIENTS;
    }
    else {
        coefficients = HIGH_COEFFICIENTS;
    }

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
    // Type S is monotonic over its valid range.

    let low = MIN_TEMP;
    let high = MAX_TEMP;

    for (let i = 0; i < 80; i++) {

        const middle =
            (low + high) / 2;

        const middleEmf =
            referenceEmf(middle);

        if (middleEmf < target) {
            low = middle;
        }
        else {
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
