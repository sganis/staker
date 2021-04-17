// to test jest
export function sum(a, b) {
    return a + b;
}

export function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

export function formatAddress(a) {
    return a.substring(0,14) + '...'+a.substring(a.length-4, a.length);
}

export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}