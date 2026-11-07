
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

let direction = "hz";


// --------------------------------------------------
// K-factor / Pulse calculation
// --------------------------------------------------

function calc() {

    const k = num("k");
    const hz = num("hz");
    const flow = num("flow");
    const count = num("count");

    const source =
        direction === "hz" ? hz : flow;

    const bad =
        ![k, source].every(Number.isFinite) ||
        k <= 0 ||
        source < 0;


    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    $("error").textContent = bad
        ? "Enter a positive K-factor and a non-negative frequency or flow."
        : (
            !Number.isFinite(count) || count < 0
                ? "Enter a non-negative pulse count to calculate the total."
                : ""
        );


    // --------------------------------------------------
    // Frequency / Flow conversion
    // --------------------------------------------------

    if (!bad) {

        if (direction === "hz") {

            $("flow").value =
                fmt(hz * 3.6 / k);

        } else {

            $("hz").value =
                fmt(flow * k / 3.6);
        }
    }


    // --------------------------------------------------
    // Accumulated volume
    // --------------------------------------------------

    const total =
        !Number.isFinite(k) ||
        k <= 0 ||
        !Number.isFinite(count) ||
        count < 0;

    $("litres").textContent = total
        ? "—"
        : fmt(count / k) + " L";

    $("cubes").textContent = total
        ? "—"
        : fmt(count / k / 1000) + " m³";
}


// --------------------------------------------------
// Event listeners
// --------------------------------------------------

["hz", "flow"].forEach(id => {

    $(id).addEventListener("input", () => {

        direction = id;
        calc();
    });
});


["k", "count"].forEach(id => {

    $(id).addEventListener("input", calc);
});


// --------------------------------------------------
// Initial calculation
// --------------------------------------------------

calc();
