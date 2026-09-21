/*
    LazyLoop
    Type K Thermocouple Calculator

    Reference:
        NIST Monograph 175
        ITS-90

    Reference-function range:
        -270 °C to +1372 °C

    Thermocouple EMF is calculated relative
    to a 0 °C reference junction.

    For an arbitrary cold-junction temperature:

        Emeasured = Ehot - Ecold
*/


// --------------------------------------------------
// Temperature limits
// --------------------------------------------------

const MIN_TEMP = -270;
const MAX_TEMP = 1372;


// --------------------------------------------------
// NIST Type K coefficients
// --------------------------------------------------

// -270 °C to 0 °C

const NEGATIVE_COEFFICIENTS = [

    0.000000000000e+0,
    0.394501280250e-1,
    0.236223735980e-4,
    -0.328589067840e-6,
    -0.499048287770e-8,
    -0.675090591730e-10,
    -0.574103274280e-12,
    -0.310888728940e-14,
    -0.104516093650e-16,
    -0.198892668780e-19,
    -0.163226974860e-22

];


// 0 °C to 1372 °C

const POSITIVE_COEFFICIENTS = [

    -0.176004136860e-1,
    0.389212049750e-1,
    0.185587700320e-4,
    -0.994575928740e-7,
    0.318409457190e-9,
    -0.560728448890e-12,
    0.560750590590e-15,
    -0.320207200030e-18,
    0.971511471520e-22,
    -0.121047212750e-25

];


// Exponential correction used above 0 °C

const EXP_A0 =
    0.118597600000e+0;

const EXP_A1 =
    -0.118343200000e-3;

const EXP_A2 =
    0.126968600000e+3;


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

    let coefficients;


    if (t < 0) {

        coefficients =
            NEGATIVE_COEFFICIENTS;
    }

    else {

        coefficients =
            POSITIVE_COEFFICIENTS;
    }


    /*
        Evaluate polynomial using Horner's method.

        This is numerically cleaner than repeatedly
        calculating t^2, t^3, t^4...
    */

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


    /*
        Type K requires an additional exponential
        term for the positive-temperature function.
    */

    if (t >= 0) {

        result +=
            EXP_A0 *
            Math.exp(
                EXP_A1 *
                Math.pow(
                    t - EXP_A2,
                    2
                )
            );
    }


    return result;
}


// --------------------------------------------------
// Reference EMF -> temperature
//
// The Type K reference function is monotonic over
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


/*
    Changing the cold junction changes the physical
    relationship between the existing hot-junction
    temperature and the voltage.

    Keep temperature as the reference and recalculate
    the expected measured EMF.
*/

coldJunction.addEventListener(
    "input",
    temperatureToEmf
);


// --------------------------------------------------
// Initial calculation
// --------------------------------------------------

temperatureToEmf();