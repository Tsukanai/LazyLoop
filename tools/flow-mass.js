
"use strict";

// --------------------------------------------------
// HTML elements and shared input parsing
// --------------------------------------------------

const $ = id => document.getElementById(id);

const num = id => parseInput($(id).value);

const fmt = (n, d = 6) =>
    Number(n.toFixed(d)).toString();


// --------------------------------------------------
// Calculation direction
// --------------------------------------------------

let direction = "volume";


// --------------------------------------------------
// Mass / Volume calculation
// --------------------------------------------------

function calc() {

    let m = num("mass");
    let v = num("volume");
    let d = num("density");

    const source =
        direction === "mass" ? m : v;

    // Preserve existing validation.
    const bad =
        ![source, d].every(Number.isFinite) ||
        source < 0 ||
        d <= 0;

    $("error").textContent = bad
        ? "Enter a non-negative flow and a positive density."
        : "";

    if (bad) {

        $("tonnes").textContent = "—";
        $("litres").textContent = "—";

        return;
    }


    // --------------------------------------------------
    // Volumetric flow -> Mass flow
    // --------------------------------------------------

    if (direction === "volume") {

        m = v * d;

        $("mass").value = fmt(m);
    }


    // --------------------------------------------------
    // Mass flow -> Volumetric flow
    // --------------------------------------------------

    else {

        v = m / d;

        $("volume").value = fmt(v);
    }


    // --------------------------------------------------
    // Additional unit conversions
    // --------------------------------------------------

    $("tonnes").textContent =
        fmt(m / 1000) + " t/h";

    $("litres").textContent =
        fmt(v * 1000 / 60) + " L/min";
}


// --------------------------------------------------
// Event listeners
// --------------------------------------------------

["mass", "volume"].forEach(id => {

    $(id).addEventListener("input", () => {

        direction = id;

        calc();
    });
});


$("density").addEventListener("input", calc);


// --------------------------------------------------
// Initial calculation
// --------------------------------------------------

calc();
