
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

let direction = "dp";


// --------------------------------------------------
// DP / Flow calculation
// --------------------------------------------------

function calc() {

    const maxDp = num("dpSpan");
    const maxQ = num("flowSpan");

    let dp = num("appliedDp");
    let q = num("actualFlow");

    const source =
        direction === "dp" ? dp : q;

    const limit =
        direction === "dp" ? maxDp : maxQ;


    // Validate configured ranges and active input.

    const bad =
        ![maxDp, maxQ, source].every(Number.isFinite) ||
        maxDp <= 0 ||
        maxQ <= 0 ||
        source < 0 ||
        source > limit;


    $("error").textContent = bad
        ? "Enter positive full-scale ranges and a value between zero and full scale."
        : "";


    if (bad) {

        [
            "dpPct",
            "flowPct",
            "linearMa",
            "sqrtMa"
        ].forEach(id => {
            $(id).textContent = "—";
        });

        return;
    }


    // --------------------------------------------------
    // Applied DP -> Actual flow
    // --------------------------------------------------

    if (direction === "dp") {

        q = maxQ * Math.sqrt(dp / maxDp);

        $("actualFlow").value = fmt(q);
    }


    // --------------------------------------------------
    // Actual flow -> Applied DP
    // --------------------------------------------------

    else {

        dp = maxDp * (q / maxQ) ** 2;

        $("appliedDp").value = fmt(dp);
    }


    // --------------------------------------------------
    // Percentages
    // --------------------------------------------------

    const p = dp / maxDp;
    const f = q / maxQ;

    $("dpPct").textContent =
        fmt(p * 100, 3) + " %";

    $("flowPct").textContent =
        fmt(f * 100, 3) + " %";


    // --------------------------------------------------
    // Expected 4–20 mA signals
    // --------------------------------------------------

    $("linearMa").textContent =
        fmt(4 + 16 * p, 4) + " mA";

    $("sqrtMa").textContent =
        fmt(4 + 16 * f, 4) + " mA";
}


// --------------------------------------------------
// Event listeners
// --------------------------------------------------

["appliedDp", "actualFlow"].forEach(id => {

    $(id).addEventListener("input", () => {

        direction =
            id === "appliedDp" ? "dp" : "flow";

        calc();
    });
});


["dpSpan", "flowSpan"].forEach(id => {

    $(id).addEventListener("input", calc);
});


// --------------------------------------------------
// Initial calculation
// --------------------------------------------------

calc();
