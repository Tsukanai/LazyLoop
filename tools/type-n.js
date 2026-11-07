
/*
    LazyLoop
    Type N Thermocouple Calculator

    NIST Monograph 175 / ITS-90

    Temperature range:
        -270 °C to +1300 °C

    Cold-junction compensation:
        Emeasured = Ehot - Ecold

    Decimal comma and point supported
    through shared parseInput().
*/


// --------------------------------------------------
// Temperature limits
// --------------------------------------------------

const MIN_TEMP = -270;
const MAX_TEMP = 1300;


// --------------------------------------------------
// NIST Type N coefficients
// --------------------------------------------------

// -270 °C to 0 °C

const NEGATIVE_COEFFICIENTS = [
    0,
    0.026159105962,
    1.0957484228e-05,
    -9.3841111554e-08,
    -4.6412039759e-11,
    -2.6303357716e-12,
    -2.2653438003e-14,
    -7.6089300791e-17,
    -9.3419667835e-20
];


// 0 °C to +1300 °C

const POSITIVE_COEFFICIENTS = [
    0,
    0.025929394601,
    1.571014188e-05,
    4.3825627237e-08,
    -2.5261169794e-10,
    6.4311819339e-13,
    -1.0063471519e-15,
    9.9745338992e-19,
    -6.0863245607e-22,
    2.0849229339e-25,
    -3.0682196151e-29
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
// Shared numeric parsing
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
        t <= 0
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
    // Type N is monotonic over the supported range.

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
