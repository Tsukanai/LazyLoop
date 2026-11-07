
/*
    LazyLoop
    Type B Thermocouple Calculator

    Reference:
        NIST Monograph 175 / ITS-90

    Forward range:
        0 °C to +1820 °C

    Reverse range:
        +250 °C to +1820 °C

    Type B is non-monotonic at low temperatures.
    The inverse calculation therefore uses the
    restricted high-temperature branch.

    Cold-junction compensation:
        Emeasured = Ehot - Ecold

    Decimal comma and point supported
    through shared parseInput().
*/


// --------------------------------------------------
// Temperature limits
// --------------------------------------------------

const MIN_TEMP = 0;
const MAX_TEMP = 1820;
const MIN_INVERSE_TEMP = 250;


// --------------------------------------------------
// NIST Type B coefficients
// --------------------------------------------------

// 0 °C to +630.615 °C

const LOW_COEFFICIENTS = [
    0,
    -0.00024650818346,
    5.9040421171e-06,
    -1.3257931636e-09,
    1.5668291901e-12,
    -1.694452924e-15,
    6.2990347094e-19
];


// +630.615 °C to +1820 °C

const HIGH_COEFFICIENTS = [
    -3.8938168621,
    0.02857174747,
    -8.4885104785e-05,
    1.5785280164e-07,
    -1.6835344864e-10,
    1.1109794013e-13,
    -4.4515431033e-17,
    9.8975640821e-21,
    -9.3791330289e-25
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
        t <= 630.615
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

    /*
        Type B is not monotonic near zero.

        The original LazyLoop implementation
        restricts inverse calculation to the
        high-temperature branch starting at
        approximately 250 °C.

        This prevents ambiguous low-temperature
        solutions.
    */

    const minimumEmf =
        referenceEmf(MIN_INVERSE_TEMP);

    const maximumEmf =
        referenceEmf(MAX_TEMP);

    const tolerance = 1e-7;

    if (
        target < minimumEmf - tolerance ||
        target > maximumEmf + tolerance
    ) {
        temperature.value = "";
        updateDisplays();
        return;
    }

    // Bisection over the monotonic branch

    let low = MIN_INVERSE_TEMP;
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
