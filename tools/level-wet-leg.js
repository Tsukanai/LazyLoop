'use strict';
const GRAVITY = 9.80665;
const WATER_REFERENCE_DENSITY = 1000;
const PA_PER_MBAR = 100;
const ids = ['zeroHeight','fullHeight','geometricSpan','density','specificGravity','referenceHeight','wetLegDensity','wetLegSG','lrv','urv','span'];
const fields = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
function read(input) {
  if (input.value.trim() === '' || !input.validity.valid) return NaN;
  return Number(input.value);
}
function format(value, digits = 2) { return Number(value.toFixed(digits)).toString(); }
function pressureFromHeight(cm, rho) { return rho * GRAVITY * (cm / 100) / PA_PER_MBAR; }
function clearResults() {
  for (const id of ['geometricSpan','lrv','urv','span']) fields[id].textContent = '—';
}
function calculateRange() {
  const zero = read(fields.zeroHeight), full = read(fields.fullHeight);
  const rho = read(fields.density), reference = read(fields.referenceHeight);
  const referenceRho = read(fields.wetLegDensity);
  if (![zero,full,rho,reference,referenceRho].every(Number.isFinite) || rho <= 0 || referenceRho <= 0) {
    clearResults(); return;
  }
  const referencePressure = pressureFromHeight(reference, referenceRho);
  const lowDP = pressureFromHeight(zero, rho) - referencePressure;
  const highDP = pressureFromHeight(full, rho) - referencePressure;
  fields.geometricSpan.textContent = format(full - zero);
  fields.lrv.textContent = format(lowDP) + ' mbar';
  fields.urv.textContent = format(highDP) + ' mbar';
  fields.span.textContent = format(highDP - lowDP) + ' mbar';
}
function syncDensity(sourceId, targetId, fromSG) {
  const value = read(fields[sourceId]);
  if (!Number.isFinite(value) || value <= 0) { fields[targetId].value = ''; clearResults(); return; }
  fields[targetId].value = fromSG ? format(value * WATER_REFERENCE_DENSITY) : format(value / WATER_REFERENCE_DENSITY, 4);
  calculateRange();
}
for (const id of ['zeroHeight','fullHeight','referenceHeight']) fields[id].addEventListener('input', calculateRange);
fields.density.addEventListener('input', () => syncDensity('density','specificGravity',false));
fields.specificGravity.addEventListener('input', () => syncDensity('specificGravity','density',true));
fields.wetLegDensity.addEventListener('input', () => syncDensity('wetLegDensity','wetLegSG',false));
fields.wetLegSG.addEventListener('input', () => syncDensity('wetLegSG','wetLegDensity',true));
const overlay = document.getElementById('wetLegHelp');
function setHelp(open) { overlay.classList.toggle('open', open); overlay.setAttribute('aria-hidden', String(!open)); }
document.getElementById('wetLegHelpButton').addEventListener('click', () => setHelp(true));
document.getElementById('wetLegHelpClose').addEventListener('click', () => setHelp(false));
overlay.addEventListener('click', event => { if (event.target === overlay) setHelp(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') setHelp(false); });
calculateRange();
