/*
    LazyLoop
    Interface Level

    Fundamental sign convention:
        Transmitter = 0
        Above transmitter = positive
        Below transmitter = negative

    Hydrostatic pressure:
        P = rho × g × h
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

const upperTapHeight =
    document.getElementById("upperTapHeight");


const upperDensity =
    document.getElementById("upperDensity");

const upperSG =
    document.getElementById("upperSG");


const lowerDensity =
    document.getElementById("lowerDensity");

const lowerSG =
    document.getElementById("lowerSG");


const referenceHeight =
    document.getElementById("referenceHeight");

const wetLegDensity =
    document.getElementById("wetLegDensity");

const wetLegSG =
    document.getElementById("wetLegSG");


const lrv =
    document.getElementById("lrv");

const urv =
    document.getElementById("urv");

const span =
    document.getElementById("span");

const sensitivity =
    document.getElementById("sensitivity");

const rangeWarning =
    document.getElementById("rangeWarning");

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
// Process pressure at an interface position
// --------------------------------------------------

function processPressureAtInterface(
    interfaceHeight,
    upperTap,
    upperRho,
    lowerRho
) {

    const lowerLiquidHeight =
        interfaceHeight;

    const upperLiquidHeight =
        upperTap -
        interfaceHeight;

    const lowerLiquidPressure =
        pressureFromHeight(
            lowerLiquidHeight,
            lowerRho
        );

    const upperLiquidPressure =
        pressureFromHeight(
            upperLiquidHeight,
            upperRho
        );

    return (
        lowerLiquidPressure +
        upperLiquidPressure
    );
}

// --------------------------------------------------
// Calculate transmitter range
// --------------------------------------------------

function calculateRange() {

    const zero =
        Number(zeroHeight.value);

    const full =
        Number(fullHeight.value);

    const upperTap =
        Number(upperTapHeight.value);

    const upperRho =
        Number(upperDensity.value);

    const lowerRho =
        Number(lowerDensity.value);

    const reference =
        Number(referenceHeight.value);

    const referenceRho =
        Number(wetLegDensity.value);

    const warnings =
    validateInputs(
        zero,
        full,
        upperTap,
        upperRho,
        lowerRho,
        referenceRho
    );

if (warnings.length > 0) {

    rangeWarning.textContent =
        warnings.join(" ");

    rangeWarning.hidden =
        false;

} else {

    rangeWarning.textContent =
        "";

    rangeWarning.hidden =
        true;
}

    const levelSpan =
        full - zero;

    geometricSpan.textContent =
        formatHeight(levelSpan);


    const lowProcessPressure =
        processPressureAtInterface(
            zero,
            upperTap,
            upperRho,
            lowerRho
        );

    const highProcessPressure =
        processPressureAtInterface(
            full,
            upperTap,
            upperRho,
            lowerRho
        );


    const referencePressure =
        pressureFromHeight(
            reference,
            referenceRho
        );


    const lowDP =
        lowProcessPressure -
        referencePressure;

    const highDP =
        highProcessPressure -
        referencePressure;


    const pressureSpan =
        highDP -
        lowDP;


    const sensitivityMbarPerMetre =
        pressureFromHeight(
            100,
            lowerRho - upperRho
        );


    lrv.textContent =
        formatPressure(lowDP) +
        " mbar";

    urv.textContent =
        formatPressure(highDP) +
        " mbar";

    span.textContent =
        formatPressure(pressureSpan) +
        " mbar";

    sensitivity.textContent =
        formatPressure(
            sensitivityMbarPerMetre
        ) +
        " mbar/m";
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
// Upper liquid density <-> SG
// --------------------------------------------------

function upperDensityToSG() {

    const rho =
        Number(upperDensity.value);

    if (!Number.isFinite(rho)) {
        return;
    }

    upperSG.value =
        formatSG(
            rho /
            WATER_REFERENCE_DENSITY
        );

    calculateRange();
}


function upperSGToDensity() {

    const sg =
        Number(upperSG.value);

    if (!Number.isFinite(sg)) {
        return;
    }

    upperDensity.value =
        formatDensity(
            sg *
            WATER_REFERENCE_DENSITY
        );

    calculateRange();
}


// --------------------------------------------------
// Lower liquid density <-> SG
// --------------------------------------------------

function lowerDensityToSG() {

    const rho =
        Number(lowerDensity.value);

    if (!Number.isFinite(rho)) {
        return;
    }

    lowerSG.value =
        formatSG(
            rho /
            WATER_REFERENCE_DENSITY
        );

    calculateRange();
}


function lowerSGToDensity() {

    const sg =
        Number(lowerSG.value);

    if (!Number.isFinite(sg)) {
        return;
    }

    lowerDensity.value =
        formatDensity(
            sg *
            WATER_REFERENCE_DENSITY
        );

    calculateRange();
}


// --------------------------------------------------
// Wet leg density <-> SG
// --------------------------------------------------

function wetLegDensityToSG() {

    const rho =
        Number(wetLegDensity.value);

    if (!Number.isFinite(rho)) {
        return;
    }

    wetLegSG.value =
        formatSG(
            rho /
            WATER_REFERENCE_DENSITY
        );

    calculateRange();
}


function wetLegSGToDensity() {

    const sg =
        Number(wetLegSG.value);

    if (!Number.isFinite(sg)) {
        return;
    }

    wetLegDensity.value =
        formatDensity(
            sg *
            WATER_REFERENCE_DENSITY
        );

    calculateRange();
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

upperTapHeight.addEventListener(
    "input",
    calculateRange
);


upperDensity.addEventListener(
    "input",
    upperDensityToSG
);

upperSG.addEventListener(
    "input",
    upperSGToDensity
);


lowerDensity.addEventListener(
    "input",
    lowerDensityToSG
);

lowerSG.addEventListener(
    "input",
    lowerSGToDensity
);


referenceHeight.addEventListener(
    "input",
    calculateRange
);

wetLegDensity.addEventListener(
    "input",
    wetLegDensityToSG
);

wetLegSG.addEventListener(
    "input",
    wetLegSGToDensity
);

// --------------------------------------------------
// Validate physical arrangement
// --------------------------------------------------

function validateInputs(
    zero,
    full,
    upperTap,
    upperRho,
    lowerRho,
    referenceRho
) {

    const warnings = [];

    if (full <= zero) {
        warnings.push(
            "100% interface must be above 0% interface."
        );
    }

    if (full > upperTap) {
        warnings.push(
            "100% interface must be below the upper process tap."
        );
    }

    if (
        upperRho <= 0 ||
        lowerRho <= 0 ||
        referenceRho <= 0
    ) {
        warnings.push(
            "Liquid densities must be greater than zero."
        );
    }

    if (lowerRho <= upperRho) {
        warnings.push(
            "Lower liquid density should be greater than upper liquid density."
        );
    }

    return warnings;
}

// --------------------------------------------------
// Help overlay
// --------------------------------------------------

const interfaceHelpButton =
    document.getElementById(
        "interfaceHelpButton"
    );

const interfaceHelp =
    document.getElementById(
        "interfaceHelp"
    );

const interfaceHelpClose =
    document.getElementById(
        "interfaceHelpClose"
    );


interfaceHelpButton.addEventListener(
    "click",
    function () {

        interfaceHelp.classList.add(
            "open"
        );
    }
);


interfaceHelpClose.addEventListener(
    "click",
    function () {

        interfaceHelp.classList.remove(
            "open"
        );
    }
);

calculateRange();