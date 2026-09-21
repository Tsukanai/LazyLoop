/*
    LazyLoop
    Pressure / Liquid Head

    Equation:

        P = rho × g × h

    where:

        P   = pressure in Pa
        rho = density in kg/m³
        g   = standard gravity
        h   = liquid head in metres
*/


// --------------------------------------------------
// Constants
// --------------------------------------------------

const GRAVITY =
    9.80665;

const WATER_REFERENCE_DENSITY =
    1000;

const PA_PER_BAR =
    100000;


// --------------------------------------------------
// HTML elements
// --------------------------------------------------

const pressure =
    document.getElementById("pressure");

const head =
    document.getElementById("head");

const density =
    document.getElementById("density");

const specificGravity =
    document.getElementById(
        "specificGravity"
    );


// --------------------------------------------------
// Head -> pressure
// --------------------------------------------------

function headToPressure() {

    const h =
        Number(head.value);

    const rho =
        Number(density.value);


    if (
        !Number.isFinite(h) ||
        !Number.isFinite(rho)
    ) {
        return;
    }


    const pressurePa =
        rho *
        GRAVITY *
        h;


    const pressureBar =
        pressurePa /
        PA_PER_BAR;


    pressure.value =
        formatNumber(
            pressureBar,
            6
        );
}


// --------------------------------------------------
// Pressure -> head
// --------------------------------------------------

function pressureToHead() {

    const pressureBar =
        Number(pressure.value);

    const rho =
        Number(density.value);


    if (
        !Number.isFinite(pressureBar) ||
        !Number.isFinite(rho) ||
        rho === 0
    ) {
        return;
    }


    const pressurePa =
        pressureBar *
        PA_PER_BAR;


    const calculatedHead =
        pressurePa /
        (
            rho *
            GRAVITY
        );


    head.value =
        formatNumber(
            calculatedHead,
            4
        );
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
        formatNumber(
            rho /
            WATER_REFERENCE_DENSITY,
            4
        );


    /*
        Keep head as the user's reference value
        and recalculate pressure when density changes.
    */

    headToPressure();
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
        formatNumber(
            sg *
            WATER_REFERENCE_DENSITY,
            2
        );


    headToPressure();
}


// --------------------------------------------------
// Number formatting
// --------------------------------------------------

function formatNumber(
    value,
    decimals
) {

    return Number(
        value.toFixed(decimals)
    ).toString();
}


// --------------------------------------------------
// Event listeners
// --------------------------------------------------

head.addEventListener(
    "input",
    headToPressure
);


pressure.addEventListener(
    "input",
    pressureToHead
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

headToPressure();