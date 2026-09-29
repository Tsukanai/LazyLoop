/*
    LazyLoop
    Type J Thermocouple Calculator

    Reference:
        NIST Monograph 175
        ITS-90

    Reference-function range:
        -210 °C to +1200 °C

    Thermocouple EMF is calculated relative
    to a 0 °C reference junction.

    For an arbitrary cold-junction temperature:

        Emeasured = Ehot - Ecold
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
// Hot-junction temperature -> measured EMF
// --------------------------------------------------

function temperatureToEmf() {

    const hotTemperature =
        Number(temperature.value);

    const coldTemperature =
        Number(coldJunction.value);


    if (
        !Number.isFinite(hotTemperature) ||
        !Number.isFinite(coldTemperature)
    ) {
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
// Measured EMF -> hot-junction temperature
// --------------------------------------------------

function emfToTemperature() {

    const measuredEmf =
        Number(emf.value);

    const coldTemperature =
        Number(coldJunction.value);


    if (
        !Number.isFinite(measuredEmf) ||
        !Number.isFinite(coldTemperature)
    ) {
        return;
    }


    if (!temperatureIsValid(coldTemperature)) {

        temperature.value = "";

        updateDisplays();

        return;
    }


    /*
        Convert the editable cold junction to its
        equivalent 0 °C referenced EMF.

        Then add the measured thermocouple EMF:

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
//
// Temperature -> EMF referenced to 0 °C
// Result is millivolts
// --------------------------------------------------

function referenceEmf(t) {

    const coefficients =
        t <= 760
            ? LOW_COEFFICIENTS
            : HIGH_COEFFICIENTS;


    let result = 0;


    for (
        let i = coefficients.length - 1;
        i >= 0;
        i--
    ) {

        result =
            result * t +
            coefficients[i];
    }


    return result;
}


// --------------------------------------------------
// Reference EMF -> temperature
//
// The Type J reference function is monotonic over
// the supported range, so bisection gives a robust
// inverse without requiring a separate approximation.
// --------------------------------------------------

function temperatureFromReferenceEmf(
    targetEmf
) {

    let low =
        MIN_TEMP;

    let high =
        MAX_TEMP;


    for (let i = 0; i < 80; i++) {

        const middle =
            (low + high) / 2;

        const middleEmf =
            referenceEmf(middle);


        if (middleEmf < targetEmf) {

            low =
                middle;
        }

        else {

            high =
                middle;
        }
    }


    return (low + high) / 2;
}


// --------------------------------------------------
// Temperature validation
// --------------------------------------------------

function temperatureIsValid(t) {

    return (
        t >= MIN_TEMP &&
        t <= MAX_TEMP
    );
}


// --------------------------------------------------
// Display
// --------------------------------------------------

function updateDisplays() {

    const cold =
        Number(coldJunction.value);

    const hot =
        Number(temperature.value);

    const measured =
        Number(emf.value);


    cjcDisplay.textContent =
        Number.isFinite(cold)
            ? formatTemperature(cold) + " °C"
            : "—";


    hotDisplay.textContent =
        Number.isFinite(hot)
            ? formatTemperature(hot) + " °C"
            : "—";


    emfDisplay.textContent =
        Number.isFinite(measured)
            ? formatEmf(measured) + " mV"
            : "—";
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