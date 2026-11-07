
'use strict';

// --------------------------------------------------
// Constants
// --------------------------------------------------

const GRAVITY = 9.80665;
const WATER_REFERENCE_DENSITY = 1000;
const PA_PER_MBAR = 100;


// --------------------------------------------------
// HTML elements
// --------------------------------------------------

const ids = [
    'zeroHeight',
    'fullHeight',
    'geometricSpan',
    'density',
    'specificGravity',
    'referenceHeight',
    'wetLegDensity',
    'wetLegSG',
    'lrv',
    'urv',
    'span'
];

const fields = Object.fromEntries(
    ids.map(id => [id, document.getElementById(id)])
);


// --------------------------------------------------
// Shared numeric input parsing
// --------------------------------------------------

function read(input) {
    return parseInput(input.value);
}


// --------------------------------------------------
// Formatting
// --------------------------------------------------

function format(value, digits = 2) {
    return Number(value.toFixed(digits)).toString();
}


// --------------------------------------------------
// Hydrostatic pressure
// --------------------------------------------------

function pressureFromHeight(cm, rho) {
    return rho * GRAVITY * (cm / 100) / PA_PER_MBAR;
}


// --------------------------------------------------
// Clear calculated results
// --------------------------------------------------

function clearResults() {

    for (const id of [
        'geometricSpan',
        'lrv',
        'urv',
        'span'
    ]) {
        fields[id].textContent = '—';
    }
}


// --------------------------------------------------
// Calculate transmitter range
// --------------------------------------------------

function calculateRange() {

    const zero = read(fields.zeroHeight);
    const full = read(fields.fullHeight);

    const rho = read(fields.density);

    const reference = read(fields.referenceHeight);
    const referenceRho = read(fields.wetLegDensity);


    // Preserve existing validation.

    if (
        ![
            zero,
            full,
            rho,
            reference,
            referenceRho
        ].every(Number.isFinite) ||
        rho <= 0 ||
        referenceRho <= 0
    ) {
        clearResults();
        return;
    }


    // Reference leg hydrostatic pressure.

    const referencePressure =
        pressureFromHeight(reference, referenceRho);


    // Differential pressure at 0% and 100%.

    const lowDP =
        pressureFromHeight(zero, rho) -
        referencePressure;

    const highDP =
        pressureFromHeight(full, rho) -
        referencePressure;


    // Geometric span.

    fields.geometricSpan.textContent =
        format(full - zero);


    // Transmitter calibration values.

    fields.lrv.textContent =
        format(lowDP) + ' mbar';

    fields.urv.textContent =
        format(highDP) + ' mbar';

    fields.span.textContent =
        format(highDP - lowDP) + ' mbar';
}


// --------------------------------------------------
// Density / Specific Gravity synchronization
// --------------------------------------------------

function syncDensity(sourceId, targetId, fromSG) {

    const value = read(fields[sourceId]);

    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {
        fields[targetId].value = '';
        clearResults();
        return;
    }


    fields[targetId].value = fromSG
        ? format(value * WATER_REFERENCE_DENSITY)
        : format(
            value / WATER_REFERENCE_DENSITY,
            4
        );


    calculateRange();
}


// --------------------------------------------------
// Measurement range event listeners
// --------------------------------------------------

for (const id of [
    'zeroHeight',
    'fullHeight',
    'referenceHeight'
]) {
    fields[id].addEventListener(
        'input',
        calculateRange
    );
}


// --------------------------------------------------
// Process liquid density / SG
// --------------------------------------------------

fields.density.addEventListener(
    'input',
    () => syncDensity(
        'density',
        'specificGravity',
        false
    )
);

fields.specificGravity.addEventListener(
    'input',
    () => syncDensity(
        'specificGravity',
        'density',
        true
    )
);


// --------------------------------------------------
// Wet leg density / SG
// --------------------------------------------------

fields.wetLegDensity.addEventListener(
    'input',
    () => syncDensity(
        'wetLegDensity',
        'wetLegSG',
        false
    )
);

fields.wetLegSG.addEventListener(
    'input',
    () => syncDensity(
        'wetLegSG',
        'wetLegDensity',
        true
    )
);


// --------------------------------------------------
// Wet leg help overlay
// --------------------------------------------------

const overlay =
    document.getElementById('wetLegHelp');

function setHelp(open) {

    overlay.classList.toggle('open', open);

    overlay.setAttribute(
        'aria-hidden',
        String(!open)
    );
}


document.getElementById(
    'wetLegHelpButton'
).addEventListener(
    'click',
    () => setHelp(true)
);


document.getElementById(
    'wetLegHelpClose'
).addEventListener(
    'click',
    () => setHelp(false)
);


overlay.addEventListener('click', event => {

    if (event.target === overlay) {
        setHelp(false);
    }
});


document.addEventListener('keydown', event => {

    if (event.key === 'Escape') {
        setHelp(false);
    }
});


// --------------------------------------------------
// Initial calculation
// --------------------------------------------------

calculateRange();
