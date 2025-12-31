"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const locations_1 = __importDefault(require("./api/routes/locations"));
const routes_1 = require("./api/routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
// use the real router so changes in `src/api/routes/` and controllers are picked up
// by the dev server (ts-node-dev) without a manual build/start.
// Mount API routes under the standard /api prefix.
// Mount API routes using centralized route constants so changes are global.
app.use(routes_1.ROUTES.LOCATIONS, locations_1.default);
app.get('/', (_req, res) => res.send('FindFood-BE running'));
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`FindFood-BE listening on port ${port}`);
});
