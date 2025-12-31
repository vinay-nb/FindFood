"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const locationsController_1 = require("../controllers/locationsController");
const router = express_1.default.Router();
// Register routes relative to the mount path. The router is mounted as
// e.g. app.use(ROUTES.LOCATIONS, locationsRouter) so here we expose POST '/'.
router.post('/', (req, res) => {
    return (0, locationsController_1.handleLocations)(req, res);
});
exports.default = router;
