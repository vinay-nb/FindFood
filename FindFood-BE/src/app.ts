import express from "express";
import dotenv from "dotenv";
import locationsRouter from "./api/routes/locations";
import { ROUTES } from "./api/routes";
import { authenticate } from "./api/middlewares/authMiddleWare";

declare const process: any;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(ROUTES.LOCATIONS, authenticate, locationsRouter as any);

app.get("/", (_req: any, res: any) => res.send("FindFood-BE running"));

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`FindFood-BE listening on port ${port}`);
});
