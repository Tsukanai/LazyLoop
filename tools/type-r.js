
/*
    LazyLoop
    Type R Thermocouple Calculator

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
// NIST Type R coefficients
// --------------------------------------------------

// -50 °C to +1064.18 °C

const LOW_COEFFICIENTS = [
    0,
    0.00528961729765,
    1.39166589782e-05,
    -2.38855693017e-08,
    3.56916001063e-11,
    -4.62347666298e-14,
    5.00777441034e-17,
    -3.73105886191e-20,
    1.57716482367e-23,
    -2.81038625251e-27
];


// +1064.18 °C to +1664.5 °C

const MID_COEFFICIENTS = [
    2.95157925316,
    -0.00252061251332,
    1.59564501865e-05,
    -7.64085947576e-09,
    2.05305291024e-12,
    -2.93359668173e-16
];


// +1664.5 °C to +1768.1 °C

const HIGH_COEFFICIENTS = [
    152.232118209,
    -0.268819888545,
    0.000171280280471,
    -3.45895706453e-08,
    -9.34633971046e-15
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
    // Type R is monotonic over its valid range.

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
