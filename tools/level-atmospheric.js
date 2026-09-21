/*
    LazyLoop
    Atmospheric / Vented Level

    Fundamental sign convention:

        Transmitter = 0
        Above transmitter = positive
        Below transmitter = negative

    Hydrostatic pressure:

        P = rho × g × h

    Inputs:
        height  = cm relative to transmitter
        density = kg/m³

    Output:
        pressure = mbar
*/


// --------------------------------------------------
// Constants
// --------------------------------------------------

const GRAVITY =
    9.80665;

const WATER_REFERENCE_DENSITY =
    1000;

const PA_PER_MBAR =
    100;


// --------------------------------------------------
// HTML elements
// --------------------------------------------------

const zeroHeight =
    document.getElementById("zeroHeight");

const fullHeight =
    document.getElementById("fullHeight");

const geometricSpan =
    document.getElementById("geometricSpan");

const density =
    document.getElementById("density");

const specificGravity =
    document.getElementById("specificGravity");

const lrv =
    document.getElementById("lrv");

const urv =
    document.getElementById("urv");

const span =
    document.getElementById("span");


// --------------------------------------------------
// Hydrostatic calculation
// --------------------------------------------------

function pressureFromHeight(
    heightCm,
    liquidDensity
) {

    const heightMetres =
        heightCm / 100;

    const pressurePa =
        liquidDensity *
        GRAVITY *
        heightMetres;

    const pressureMbar =
        pressurePa /
        PA_PER_MBAR;

    return pressureMbar;
}


// --------------------------------------------------
// Calculate transmitter range
// --------------------------------------------------

function calculateRange() {

    const zero =
        Number(zeroHeight.value);

    const full =
        Number(fullHeight.value);

    const rho =
        Number(density.value);


    if (
        !Number.isFinite(zero) ||
        !Number.isFinite(full) ||
        !Number.isFinite(rho)
    ) {
        return;
    }
const levelSpan =
    full - zero;

geometricSpan.textContent =
    formatHeight(levelSpan);

    const lowPressure =
        pressureFromHeight(
            zero,
            rho
        );


    const highPressure =
        pressureFromHeight(
            full,
            rho
        );


    const pressureSpan =
        highPressure -
        lowPressure;


    lrv.textContent =
        formatPressure(lowPressure) +
        " mbar";


    urv.textContent =
        formatPressure(highPressure) +
        " mbar";


    span.textContent =
        formatPressure(pressureSpan) +
        " mbar";
}


// --------------------------------------------------
// Density -> SG
// --------------------------------------------------

function densityToSG() {

    const rho =
        Number(density.value);


    if (!Number.isFinite(rho)) {
        return;
    }


    specificGravity.value =
        formatSG(
            rho /
            WATER_REFERENCE_DENSITY
        );


    calculateRange();
}


// --------------------------------------------------
// SG -> density
// --------------------------------------------------

function sgToDensity() {

    const sg =
        Number(specificGravity.value);


    if (!Number.isFinite(sg)) {
        return;
    }


    density.value =
        formatDensity(
            sg *
            WATER_REFERENCE_DENSITY
        );


    calculateRange();
}


// --------------------------------------------------
// Formatting
// --------------------------------------------------

function formatPressure(value) {

    return Number(
        value.toFixed(2)
    ).toString();
}

function formatHeight(value) {

    return Number(
        value.toFixed(2)
    ).toString();
}


function formatDensity(value) {

    return Number(
        value.toFixed(2)
    ).toString();
}


function formatSG(value) {

    return Number(
        value.toFixed(4)
    ).toString();
}


// --------------------------------------------------
// Event listeners
// --------------------------------------------------

zeroHeight.addEventListener(
    "input",
    calculateRange
);


fullHeight.addEventListener(
    "input",
    calculateRange
);


density.addEventListener(
    "input",
    densityToSG
);


specificGravity.addEventListener(
    "input",
    sgToDensity
);


// --------------------------------------------------
// Initial calculation
// --------------------------------------------------

calculateRange();