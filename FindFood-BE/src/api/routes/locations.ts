import express from 'express';

const router = express.Router();

const handleLocations = (req: express.Request, res: express.Response) => {
  // TODO: replace this stub with the actual controller implementation
  res.status(200).json({ message: 'handleLocations stub' });
};

router.post('/', handleLocations);

export default router;
