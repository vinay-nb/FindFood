"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLocations = handleLocations;
// Simple centroid calculator for an array of {lat,lng}
function centroidOf(coords) {
    if (coords.length === 0)
        return { lat: 0, lng: 0 };
    const sum = coords.reduce((acc, c) => ({ lat: acc.lat + c.lat, lng: acc.lng + c.lng }), { lat: 0, lng: 0 });
    return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
}
// Use `any` for req/res to avoid dependency on express type declarations in simple scaffold.
async function handleLocations(req, res) {
    try {
        const body = req.body;
        if (!Array.isArray(body.locations)) {
            return res.status(400).json({ error: 'locations must be an array' });
        }
        const coords = body.locations;
        if (coords.length === 0)
            return res.status(400).json({ error: 'empty locations' });
        const center = centroidOf(coords);
        return res.json({ center });
    }
    catch (err) {
        return res.status(500).json({ error: err?.message ?? String(err) });
    }
}
