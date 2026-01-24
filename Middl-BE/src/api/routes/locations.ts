import express from "express";
import { handleLocations } from "../controllers/locationsController";

const router = express.Router();

// Register routes relative to the mount path. The router is mounted as
// e.g. app.use(ROUTES.LOCATIONS, locationsRouter) so here we expose POST '/'.
router.post("/", (req: express.Request, res: express.Response) => {
  return handleLocations(req, res);
});

export default router;
