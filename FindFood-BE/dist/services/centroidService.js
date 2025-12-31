"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.centroidOf = centroidOf;
function centroidOf(coords) {
    // simple arithmetic mean; for small distances this is fine. For more accuracy on globe, use spherical methods.
    const n = coords.length;
    let sumLat = 0;
    let sumLng = 0;
    for (const c of coords) {
        sumLat += c.lat;
        sumLng += c.lng;
    }
    return { lat: sumLat / n, lng: sumLng / n };
}
