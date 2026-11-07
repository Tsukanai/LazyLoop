
function parseInput(value) {
    const normalized = String(value).trim().replace(",", ".");

    if (normalized === "") {
        return NaN;
    }

    return Number(normalized);
}
