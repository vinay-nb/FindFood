import express from 'express';
import dotenv from 'dotenv';
// lightweight inline router to avoid a missing module at ./api/routes/locations
const locationsRouter = express.Router();
locationsRouter.get('/', (_req: any, res: any) => res.json({ locations: [] }));

declare const process: any; // lightweight fallback if @types/node are not yet installed

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/locations', locationsRouter as any);

app.get('/', (_req: any, res: any) => res.send('FindFood-BE running'));

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`FindFood-BE listening on port ${port}`);
});
