/*
    LazyLoop
    Type E Thermocouple Calculator

    Reference:
        NIST Monograph 175
        ITS-90

    Reference-function range:
        -270 °C to +1000 °C

    Thermocouple EMF is calculated relative
    to a 0 °C reference junction.

    For an arbitrary cold-junction temperature:

        Emeasured = Ehot - Ecold
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
        Convert cold-junction temperature to its
        equivalent 0 °C referenced EMF.

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
        t < 0
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