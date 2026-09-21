/*
    LazyLoop
    4–20 mA Field Calculator

    Fixed signal:
        4 mA  = 0 %
        20 mA = 100 %

    Functions:
        - mA -> engineering value
        - engineering value -> mA
        - percentage
        - NE43 indication
        - visual signal position
*/


// --------------------------------------------------
// Fixed 4–20 mA signal
// --------------------------------------------------

const CURRENT_LOW = 4;
const CURRENT_HIGH = 20;
const CURRENT_SPAN = CURRENT_HIGH - CURRENT_LOW;


// --------------------------------------------------
// NE43 / display limits
// --------------------------------------------------

const FAILURE_LOW = 3.6;
const MEASUREMENT_LOW = 3.8;

const MEASUREMENT_HIGH = 20.5;
const FAILURE_HIGH = 21.0;


/*
    The visual bar extends slightly beyond the
    failure thresholds so failure values remain
    visible instead of sticking directly to an edge.
*/

const BAR_LOW = 3.4;
const BAR_HIGH = 21.2;


// --------------------------------------------------
// HTML elements
// --------------------------------------------------

const engineeringLow =
    document.getElementById("engineeringLow");

const engineeringHigh =
    document.getElementById("engineeringHigh");

const unit =
    document.getElementById("unit");

const current =
    document.getElementById("current");

const processValue =
    document.getElementById("processValue");

const processUnit =
    document.getElementById("processUnit");

const percentDisplay =
    document.getElementById("percent");

const signalStatus =
    document.getElementById("signalStatus");

const signalMarker =
    document.getElementById("signalMarker");


// --------------------------------------------------
// Current -> engineering value
// --------------------------------------------------

function currentToPV() {

    const pvLow =
        Number(engineeringLow.value);

    const pvHigh =
        Number(engineeringHigh.value);

    const i =
        Number(current.value);


    /*
        Determine the position in the fixed
        4–20 mA span.

        Example:

        12 mA:

        (12 - 4) / 16
        = 0.5
        = 50 %
    */

    const fraction =
        (i - CURRENT_LOW) /
        CURRENT_SPAN;


    /*
        Apply the fraction to the engineering range.

        This also works for reversed ranges.

        Example:

        100 -> 0 bar
    */

    const pv =
        pvLow +
        fraction *
        (pvHigh - pvLow);


    processValue.value =
        formatNumber(pv);


    percentDisplay.textContent =
        (fraction * 100).toFixed(2);


    updateSignalDisplay(i);
}


// --------------------------------------------------
// Engineering value -> current
// --------------------------------------------------

function pvToCurrent() {

    const pvLow =
        Number(engineeringLow.value);

    const pvHigh =
        Number(engineeringHigh.value);

    const pv =
        Number(processValue.value);


    const engineeringSpan =
        pvHigh - pvLow;


    /*
        Avoid division by zero if somebody enters,
        for example:

        Low  = 100
        High = 100
    */

    if (engineeringSpan === 0) {
        return;
    }


    const fraction =
        (pv - pvLow) /
        engineeringSpan;


    const i =
        CURRENT_LOW +
        fraction *
        CURRENT_SPAN;


    current.value =
        formatNumber(i);


    percentDisplay.textContent =
        (fraction * 100).toFixed(2);


    updateSignalDisplay(i);
}


// --------------------------------------------------
// Signal status and marker
// --------------------------------------------------

function updateSignalDisplay(currentValue) {

    updateSignalStatus(currentValue);
    updateSignalMarker(currentValue);
}


// --------------------------------------------------
// NE43 status
// --------------------------------------------------

function updateSignalStatus(currentValue) {

    /*
        We distinguish between:

        FAILURE LOW
        UNDERRANGE
        IN RANGE
        OVERRANGE
        FAILURE HIGH

        4–20 mA is the nominal process span.

        NE43 allows measurement outside that nominal
        span before reaching the failure thresholds.
    */


    if (currentValue <= FAILURE_LOW) {

        signalStatus.textContent =
            "FAILURE LOW";

        signalStatus.className =
            "signal-status failure";
    }


    else if (currentValue < CURRENT_LOW) {

        signalStatus.textContent =
            "UNDERRANGE";

        signalStatus.className =
            "signal-status warning";
    }


    else if (currentValue <= CURRENT_HIGH) {

        signalStatus.textContent =
            "IN RANGE";

        signalStatus.className =
            "signal-status in-range";
    }


    else if (currentValue < FAILURE_HIGH) {

        signalStatus.textContent =
            "OVERRANGE";

        signalStatus.className =
            "signal-status warning";
    }


    else {

        signalStatus.textContent =
            "FAILURE HIGH";

        signalStatus.className =
            "signal-status failure";
    }
}


// --------------------------------------------------
// Visual signal marker
// --------------------------------------------------

function updateSignalMarker(currentValue) {

    /*
        Convert the current to a position across
        the visual bar.
    */

    let position =
        (currentValue - BAR_LOW) /
        (BAR_HIGH - BAR_LOW) *
        100;


    /*
        The calculation itself is NOT clamped.

        Only the graphical marker is clamped so
        extreme values don't draw outside the bar.
    */

    position =
        Math.max(0, Math.min(100, position));


    signalMarker.style.left =
        position + "%";
}


// --------------------------------------------------
// Number formatting
// --------------------------------------------------

function formatNumber(value) {

    /*
        Keep useful precision without displaying
        unnecessary trailing zeroes.

        Examples:

        50      instead of 50.000
        8       instead of 8.000
        7.312   remains 7.312
    */

    return Number(
        value.toFixed(3)
    ).toString();
}


// --------------------------------------------------
// Event listeners
// --------------------------------------------------

current.addEventListener(
    "input",
    currentToPV
);


processValue.addEventListener(
    "input",
    pvToCurrent
);


engineeringLow.addEventListener(
    "input",
    currentToPV
);


engineeringHigh.addEventListener(
    "input",
    currentToPV
);


unit.addEventListener(
    "input",
    function () {

        processUnit.textContent =
            unit.value;
    }
);


// --------------------------------------------------
// Initial calculation
// --------------------------------------------------

currentToPV();