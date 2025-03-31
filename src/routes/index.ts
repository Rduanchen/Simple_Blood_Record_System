/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { sync } from '../db/db';
import { addRecord, findAllData, findRecentData, findDateAfter, updateData, deleteData } from '../controllers/data';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  res.send('This is api route');
  await sync();
});

router.get('/add', async (req: express.Request, res: express.Response) => {
  const datas = {
    date: parseInt(req.query.date as string),
    systolic: parseInt(req.query.systolic as string),
    diastolic: parseInt(req.query.diastolic as string),
    pulse: parseInt(req.query.pulse as string),
  };
  console.log(datas);
  try {
    const result = await addRecord(datas);
    res.send(result);
  } catch (error: any) {
    res.status(500).send({ err: error.message });
  }
});

router.get('/all', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const result = await findAllData();
    console.log(typeof result);
    console.log(result);
    res.send(result);
  } catch (error: any) {
    res.status(500).send({ err: error.message });
    next(error);
  }
});

router.get('/recent', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const amount = parseInt(req.query.amount as string);
  try {
    const result = await findRecentData(amount);
    res.json(result);
  } catch (error: any) {
    res.status(500).send({ err: error.message });
    next(error);
  }
});

router.get('/after', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const date = req.query.date as string;
  try {
    const result = await findDateAfter(date);
    res.send(result);
  } catch (error: any) {
    res.status(500).send({ err: error.message });
    next(error);
  }
});

router.get('/update', async (req: express.Request, res: express.Response) => {
  const id = req.query.id as string;
  console.log('已經更新');
  const datas = {
    date: parseInt(req.query.date as string),
    systolic: parseInt(req.query.systolic as string),
    diastolic: parseInt(req.query.diastolic as string),
    pulse: parseInt(req.query.pulse as string),
  };
  console.log(datas);
  try {
    await updateData(id, datas);
    res.send({ status: 'success', message: 'Record updated' });
  } catch (error: any) {
    res.status(500).send({ err: error.message });
  }
});

router.get('/delete', async (req: express.Request, res: express.Response) => {
  const id = req.query.id as string;
  try {
    await deleteData(id);
    res.send({ status: 'success', message: 'Record deleted' });
  } catch (error: any) {
    res.status(500).send({ err: error.message });
  }
});

export default router;
