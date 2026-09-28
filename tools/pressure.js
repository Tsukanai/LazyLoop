/*
    LazyLoop
    Pressure Converter

    Internal base unit:
        Pascal (Pa)

    Any displayed unit can be edited.
    All other units are recalculated from it.
*/


// --------------------------------------------------
// HTML elements
// --------------------------------------------------

const bar =
    document.getElementById("bar");

const kpa =
    document.getElementById("kpa");

const mpa =
    document.getElementById("mpa");

const mbar =
    document.getElementById("mbar");

const psi =
    document.getElementById("psi");

const mmh2o =
    document.getElementById("mmh2o");

const inh2o =
    document.getElementById("inh2o");

const mmhg =
    document.getElementById("mmhg");

const inhg =
    document.getElementById("inhg");

const gauge =
    document.getElementById("gauge");

const absolute =
    document.getElementById("absolute");

const atmosphere =
    document.getElementById("atmosphere");

    const pressureWarning =
    document.getElementById("pressureWarning");


// --------------------------------------------------
// Conversion factors to Pascal
// --------------------------------------------------

const TO_PA = {

    bar: 100000,

    kpa: 1000,

    mpa: 1000000,

    mbar: 100,

    psi: 6894.757293168,

    mmh2o: 9.80665,

    inh2o: 249.08891,

    mmhg: 133.322387415,

    inhg: 3386.389,

};


// --------------------------------------------------
// Pressure unit conversion
// --------------------------------------------------

function updatePressureUnits(
    sourceName,
    sourceElement
) {

    const value =
        Number(sourceElement.value);


    if (!Number.isFinite(value)) {
        return;
    }


    const pascal =
        value * TO_PA[sourceName];


    if (sourceName !== "bar") {

        bar.value =
            formatPressure(
                pascal / TO_PA.bar
            );
    }


    if (sourceName !== "kpa") {

        kpa.value =
            formatPressure(
                pascal / TO_PA.kpa
            );
    }


    if (sourceName !== "mpa") {

        mpa.value =
            formatPressure(
                pascal / TO_PA.mpa
            );
    }


    if (sourceName !== "mbar") {

        mbar.value =
            formatPressure(
                pascal / TO_PA.mbar
            );
    }


    if (sourceName !== "psi") {

        psi.value =
            formatPressure(
                pascal / TO_PA.psi
            );
    }
    if (sourceName !== "mmh2o") {

    mmh2o.value =
        formatPressure(
            pascal / TO_PA.mmh2o
        );
}


    if (sourceName !== "inh2o") {

    inh2o.value =
        formatPressure(
            pascal / TO_PA.inh2o
        );
}


    if (sourceName !== "mmhg") {

    mmhg.value =
        formatPressure(
            pascal / TO_PA.mmhg
        );
}


    if (sourceName !== "inhg") {

    inhg.value =
        formatPressure(
            pascal / TO_PA.inhg
        );
}
}

function updatePressureWarning() {

    const absolutePressure =
        Number(absolute.value);

    if (absolutePressure < 0) {

        pressureWarning.style.display =
            "block";
    }

    else {

        pressureWarning.style.display =
            "none";
    }
}
// --------------------------------------------------
// Gauge -> absolute
// --------------------------------------------------

function gaugeToAbsolute() {

    const gaugePressure =
        Number(gauge.value);

    const atmosphericPressure =
        Number(atmosphere.value);


    if (
        !Number.isFinite(gaugePressure) ||
        !Number.isFinite(atmosphericPressure)
    ) {
        return;
    }


    absolute.value =
        formatPressure(
            gaugePressure +
            atmosphericPressure
        );
        updatePressureWarning();
}


// --------------------------------------------------
// Absolute -> gauge
// --------------------------------------------------

function absoluteToGauge() {

    const absolutePressure =
        Number(absolute.value);

    const atmosphericPressure =
        Number(atmosphere.value);


    if (
        !Number.isFinite(absolutePressure) ||
        !Number.isFinite(atmosphericPressure)
    ) {
        return;
    }


    gauge.value =
        formatPressure(
            absolutePressure -
            atmosphericPressure
        );
        updatePressureWarning();
}


// --------------------------------------------------
// Number formatting
// --------------------------------------------------

function formatPressure(value) {

    return Number(
        value.toFixed(6)
    ).toString();
}


// --------------------------------------------------
// Unit event listeners
// --------------------------------------------------

bar.addEventListener(
    "input",
    function () {
        updatePressureUnits(
            "bar",
            bar
        );
    }
);


kpa.addEventListener(
    "input",
    function () {
        updatePressureUnits(
            "kpa",
            kpa
        );
    }
);


mpa.addEventListener(
    "input",
    function () {
        updatePressureUnits(
            "mpa",
            mpa
        );
    }
);


mbar.addEventListener(
    "input",
    function () {
        updatePressureUnits(
            "mbar",
            mbar
        );
    }
);


psi.addEventListener(
    "input",
    function () {
        updatePressureUnits(
            "psi",
            psi
        );
    }
);

mmh2o.addEventListener(
    "input",
    function () {
        updatePressureUnits(
            "mmh2o",
            mmh2o
        );
    }
);


inh2o.addEventListener(
    "input",
    function () {
        updatePressureUnits(
            "inh2o",
            inh2o
        );
    }
);


mmhg.addEventListener(
    "input",
    function () {
        updatePressureUnits(
            "mmhg",
            mmhg
        );
    }
);


inhg.addEventListener(
    "input",
    function () {
        updatePressureUnits(
            "inhg",
            inhg
        );
    }
);

// --------------------------------------------------
// Gauge / absolute event listeners
// --------------------------------------------------

gauge.addEventListener(
    "input",
    gaugeToAbsolute
);


absolute.addEventListener(
    "input",
    absoluteToGauge
);


atmosphere.addEventListener(
    "input",
    gaugeToAbsolute
);


// --------------------------------------------------
// Initial values
// --------------------------------------------------

updatePressureUnits(
    "bar",
    bar
);


gaugeToAbsolute();