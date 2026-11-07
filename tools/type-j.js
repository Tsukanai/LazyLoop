
/*
    LazyLoop
    Type J Thermocouple Calculator

    Reference:
        NIST Monograph 175
        ITS-90

    Reference-function range:
        -210 °C to +1200 °C

    Emeasured = Ehot - Ecold

    Decimal comma and point supported
    through shared parseInput().
*/


// --------------------------------------------------
// Temperature limits
// --------------------------------------------------

const MIN_TEMP = -210;
const MAX_TEMP = 1200;


// --------------------------------------------------
// NIST Type J coefficients
// --------------------------------------------------

// -210 °C to +760 °C

const LOW_COEFFICIENTS = [

    0.000000000000e+0,
    0.503811878150e-1,
    0.304758369300e-4,
    -0.856810657200e-7,
    0.132281952950e-9,
    -0.170529583370e-12,
    0.209480906970e-15,
    -0.125383953360e-18,
    0.156317256970e-22

];


// +760 °C to +1200 °C

const HIGH_COEFFICIENTS = [

    0.296456256810e+3,
    -0.149761277860e+1,
    0.317871039240e-2,
    -0.318476867010e-5,
    0.157208190040e-8,
    -0.306913690560e-12

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
// Temperature -> measured EMF
// --------------------------------------------------

function temperatureToEmf() {

    const hotTemperature =
        parseInput(temperature.value);

    const coldTemperature =
        parseInput(coldJunction.value);

    if (
        !Number.isFinite(hotTemperature) ||
        !Number.isFinite(coldTemperature)
    ) {
        updateDisplays();
        return;
    }

    if (
        !temperatureIsValid(hotTemperature) ||
        !temperatureIsValid(coldTemperature)
    ) {
        emf.value = "";
        updateDisplays();
        return;
    }

    const hotEmf =
        referenceEmf(hotTemperature);

    const coldEmf =
        referenceEmf(coldTemperature);

    const measuredEmf =
        hotEmf - coldEmf;

    emf.value =
        formatEmf(measuredEmf);

    updateDisplays();
}


// --------------------------------------------------
// Measured EMF -> temperature
// --------------------------------------------------

function emfToTemperature() {

    const measuredEmf =
        parseInput(emf.value);

    const coldTemperature =
        parseInput(coldJunction.value);

    if (
        !Number.isFinite(measuredEmf) ||
        !Number.isFinite(coldTemperature)
    ) {
        updateDisplays();
        return;
    }

    if (!temperatureIsValid(coldTemperature)) {
        temperature.value = "";
        updateDisplays();
        return;
    }

    /*
        Cold-junction compensation:

        Ehot = Emeasured + Ecold
    */

    const coldEmf =
        referenceEmf(coldTemperature);

    const hotReferenceEmf =
        measuredEmf + coldEmf;

    const minimumEmf =
        referenceEmf(MIN_TEMP);

    const maximumEmf =
        referenceEmf(MAX_TEMP);

    if (
        hotReferenceEmf < minimumEmf ||
        hotReferenceEmf > maximumEmf
    ) {
        temperature.value = "";
        updateDisplays();
        return;
    }

    const hotTemperature =
        temperatureFromReferenceEmf(
            hotReferenceEmf
        );

    temperature.value =
        formatTemperature(hotTemperature);

    updateDisplays();
}


// --------------------------------------------------
// NIST reference function
// Temperature -> EMF (mV), referenced to 0 °C
// --------------------------------------------------

function referenceEmf(t) {

    const coefficients =
        t <= 760
            ? LOW_COEFFICIENTS
            : HIGH_COEFFICIENTS;

    let result = 0;

    // Horner's polynomial evaluation

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
// Reference EMF -> temperature
// Bisection solver
// --------------------------------------------------

function temperatureFromReferenceEmf(targetEmf) {

    let low = MIN_TEMP;
    let high = MAX_TEMP;

    for (let i = 0; i < 80; i++) {

        const middle =
            (low + high) / 2;

        const middleEmf =
            referenceEmf(middle);

        if (middleEmf < targetEmf) {
            low = middle;
        } else {
            high = middle;
        }
    }

    return (low + high) / 2;
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
// Summary displays
// --------------------------------------------------

function updateDisplays() {

    const cold =
        parseInput(coldJunction.value);

    const hot =
        parseInput(temperature.value);

    const measured =
        parseInput(emf.value);

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
// Formatting
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
