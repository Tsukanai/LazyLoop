/*
    LazyLoop
    Current Signal Scaling

    Handles:

    - mA -> engineering value
    - engineering value -> mA
    - percentage calculation
    - configurable ranges
    - configurable engineering unit
    - NAMUR NE43 status for 4-20 mA
*/


// --------------------------------------------------
// Get references to the HTML elements
// --------------------------------------------------

const signalLow =
    document.getElementById("signalLow");

const signalHigh =
    document.getElementById("signalHigh");

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


// --------------------------------------------------
// NAMUR NE43 status
// --------------------------------------------------

function updateSignalStatus(currentValue) {

    const low =
        Number(signalLow.value);

    const high =
        Number(signalHigh.value);


    /*
        NE43 is specifically relevant here when
        the configured signal is 4-20 mA.

        If another range is selected, we don't
        pretend that the NE43 thresholds apply.
    */

    const isFourToTwenty =
        low === 4 &&
        high === 20;


    if (!isFourToTwenty) {

        signalStatus.textContent =
            "CUSTOM SIGNAL RANGE";

        signalStatus.className =
            "signal-status normal";

        return;
    }


    /*
        NE43 regions used by this calculator:

        <= 3.6 mA       Failure low

        >3.6 to <3.8    Outside measurement range

        3.8 to 20.5     Valid measurement range

        >20.5 to <21.0  Outside measurement range

        >=21.0          Failure high
    */


    if (currentValue <= 3.6) {

        signalStatus.textContent =
            "FAILURE LOW";

        signalStatus.className =
            "signal-status failure";
    }


    else if (currentValue < 3.8) {

        signalStatus.textContent =
            "BELOW MEASUREMENT RANGE";

        signalStatus.className =
            "signal-status warning";
    }


    else if (currentValue <= 20.5) {

        signalStatus.textContent =
            "NORMAL";

        signalStatus.className =
            "signal-status normal";
    }


    else if (currentValue < 21.0) {

        signalStatus.textContent =
            "ABOVE MEASUREMENT RANGE";

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
// Convert current -> engineering value
// --------------------------------------------------

function currentToPV() {

    const iLow =
        Number(signalLow.value);

    const iHigh =
        Number(signalHigh.value);

    const pvLow =
        Number(engineeringLow.value);

    const pvHigh =
        Number(engineeringHigh.value);

    const i =
        Number(current.value);


    /*
        First calculate where the current sits
        within the configured signal span.

        Example:

        4-20 mA
        12 mA

        (12 - 4) / (20 - 4)

        = 0.5
        = 50 %
    */

    const fraction =
        (i - iLow) /
        (iHigh - iLow);


    /*
        Apply that fraction to the
        engineering range.

        Example:

        0-100 bar
        50 %

        = 50 bar
    */

    const pv =
        pvLow +
        fraction *
        (pvHigh - pvLow);


    processValue.value =
        pv.toFixed(3);


    percentDisplay.textContent =
        (fraction * 100).toFixed(2);


    updateSignalStatus(i);
}


// --------------------------------------------------
// Convert engineering value -> current
// --------------------------------------------------

function pvToCurrent() {

    const iLow =
        Number(signalLow.value);

    const iHigh =
        Number(signalHigh.value);

    const pvLow =
        Number(engineeringLow.value);

    const pvHigh =
        Number(engineeringHigh.value);

    const pv =
        Number(processValue.value);


    /*
        Determine where the requested process
        value sits in the engineering span.
    */

    const fraction =
        (pv - pvLow) /
        (pvHigh - pvLow);


    /*
        Apply that fraction to the
        configured current range.
    */

    const i =
        iLow +
        fraction *
        (iHigh - iLow);


    current.value =
        i.toFixed(3);


    percentDisplay.textContent =
        (fraction * 100).toFixed(2);


    updateSignalStatus(i);
}


// --------------------------------------------------
// User changes the current
// --------------------------------------------------

current.addEventListener(
    "input",
    currentToPV
);


// --------------------------------------------------
// User changes the engineering value
// --------------------------------------------------

processValue.addEventListener(
    "input",
    pvToCurrent
);


// --------------------------------------------------
// User changes the engineering unit
// --------------------------------------------------

unit.addEventListener(
    "input",
    function () {

        processUnit.textContent =
            unit.value;
    }
);


// --------------------------------------------------
// User changes one of the configured ranges
// --------------------------------------------------

signalLow.addEventListener(
    "input",
    currentToPV
);

signalHigh.addEventListener(
    "input",
    currentToPV
);

engineeringLow.addEventListener(
    "input",
    currentToPV
);

engineeringHigh.addEventListener(
    "input",
    currentToPV
);


// --------------------------------------------------
// Initialise calculator when page loads
// --------------------------------------------------

currentToPV();