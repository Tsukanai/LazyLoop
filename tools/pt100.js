/*
    LazyLoop
    Pt100 Calculator

    Standard:
        IEC 60751
        Pt385
        R0 = 100 ohm

    Callendar-Van Dusen coefficients:

        A = 3.9083 × 10^-3
        B = -5.775 × 10^-7
        C = -4.183 × 10^-12

    Valid calculation range:
        -200 °C to +850 °C
*/


// --------------------------------------------------
// IEC 60751 constants
// --------------------------------------------------

const R0 = 100;

const A = 3.9083e-3;
const B = -5.775e-7;
const C = -4.183e-12;

const MIN_TEMP = -200;
const MAX_TEMP = 850;


// --------------------------------------------------
// HTML elements
// --------------------------------------------------

const resistance =
    document.getElementById("resistance");

const temperature =
    document.getElementById("temperature");


// --------------------------------------------------
// Temperature -> resistance
// --------------------------------------------------

function temperatureToResistance() {

    const t =
        Number(temperature.value);


    if (!Number.isFinite(t)) {
        return;
    }


    const r =
        resistanceFromTemperature(t);


    resistance.value =
        formatResistance(r);
}


// --------------------------------------------------
// Resistance -> temperature
// --------------------------------------------------

function resistanceToTemperature() {

    const r =
        Number(resistance.value);


    if (!Number.isFinite(r)) {
        return;
    }


    const minimumResistance =
        resistanceFromTemperature(MIN_TEMP);

    const maximumResistance =
        resistanceFromTemperature(MAX_TEMP);


    /*
        Do not invent a temperature outside the
        supported IEC calculation range.
    */

    if (
        r < minimumResistance ||
        r > maximumResistance
    ) {

        temperature.value = "";

        return;
    }


    const t =
        temperatureFromResistance(r);


    temperature.value =
        formatTemperature(t);
}


// --------------------------------------------------
// Callendar-Van Dusen
// Temperature -> resistance
// --------------------------------------------------

function resistanceFromTemperature(t) {

    /*
        At and above 0 °C:

        R(t) = R0 ×
        (1 + A·t + B·t²)
    */

    if (t >= 0) {

        return R0 * (
            1 +
            A * t +
            B * t * t
        );
    }


    /*
        Below 0 °C the C term is required:

        R(t) = R0 ×
        [1 + A·t + B·t²
        + C·(t - 100)·t³]
    */

    return R0 * (
        1 +
        A * t +
        B * t * t +
        C *
        (t - 100) *
        t * t * t
    );
}


// --------------------------------------------------
// Resistance -> temperature
// --------------------------------------------------

function temperatureFromResistance(r) {

    /*
        For positive temperatures the IEC equation
        is quadratic and could be inverted directly.

        Below zero the equation contains the C term
        and becomes fourth-order.

        Using one numerical solver for the complete
        range keeps both directions consistent with
        the same IEC equation.

        Pt100 resistance is monotonic throughout
        this range, so bisection is robust.
    */


    let low =
        MIN_TEMP;

    let high =
        MAX_TEMP;


    for (let i = 0; i < 80; i++) {

        const middle =
            (low + high) / 2;

        const middleResistance =
            resistanceFromTemperature(middle);


        if (middleResistance < r) {

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
// Number formatting
// --------------------------------------------------

function formatResistance(value) {

    return Number(
        value.toFixed(3)
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

resistance.addEventListener(
    "input",
    resistanceToTemperature
);


temperature.addEventListener(
    "input",
    temperatureToResistance
);


// --------------------------------------------------
// Initial calculation
// --------------------------------------------------

temperatureToResistance();