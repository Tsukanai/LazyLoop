
/*
    LazyLoop
    Type T Thermocouple Calculator

    Reference:
        NIST Monograph 175 / ITS-90

    Temperature range:
        -270 °C to +400 °C

    Cold junction compensation:
        Emeasured = Ehot - Ecold

    Decimal comma and point supported
    through shared parseInput().
*/


// --------------------------------------------------
// Temperature limits
// --------------------------------------------------

const MIN_TEMP = -270;
const MAX_TEMP = 400;


// --------------------------------------------------
// NIST Type T coefficients
// --------------------------------------------------

// -270 °C to 0 °C

const NEGATIVE_COEFFICIENTS = [
    0,
    0.038748106364,
    4.4194434347e-05,
    1.1844323105e-07,
    2.0032973554e-08,
    9.0138019559e-10,
    2.2651156593e-11,
    3.6071154205e-13,
    3.8493939883e-15,
    2.8213521925e-17,
    1.4251594779e-19,
    4.8768662286e-22,
    1.079553927e-24,
    1.3945027062e-27,
    7.9795153927e-31
];


// 0 °C to +400 °C

const POSITIVE_COEFFICIENTS = [
    0,
    0.038748106364,
    3.329222788e-05,
    2.0618243404e-07,
    -2.1882256846e-09,
    1.0996880928e-11,
    -3.0815758772e-14,
    4.547913529e-17,
    -2.7512901673e-20
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
// Temperature -> EMF referenced to 0 °C
// Result in millivolts
// --------------------------------------------------

function referenceEmf(t) {

    if (!temperatureIsValid(t)) {
        return NaN;
    }

    const coefficients = t <= 0
        ? NEGATIVE_COEFFICIENTS
        : POSITIVE_COEFFICIENTS;

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

    emf.value = formatEmf(measured);

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
