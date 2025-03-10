import express from 'express';
import initRouter from './init';
import dataRouter from './dataManage';
import { createBloodPressureTable } from '../db/init';
import { addRecord, findAllData, findRecentData, findDateAfter, updateData, deleteData } from '../controllers/data';

const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
  res.send('This is api route');
  createBloodPressureTable();
});
router.get('/init', initRouter);
router.get('/data', dataRouter);

router.get('/add', (req, res) => {
  console.log('123');
  const datas = {
    date: req.query.date,
    systolic: req.query.systolic,
    diastolic: req.query.diastolic,
    pulse: req.query.pulse,
  };
  console.log(datas);
  const result = addRecord(datas);
  res.send(result);
});

router.get('/all', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  findAllData()
    .then((result: any) => {
      console.log(typeof result);
      console.log(result);
      res.send(result);
    })
    .catch((error: any) => {
      res.status(500).send({ err: error });
      next(error);
    });
});

router.get('/recent', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const amount = parseInt(req.query.amount as string);
  findRecentData(amount)
    .then((result: any) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).send({ err: error });
      next(error);
    });
});

router.get('/after', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const date = req.query.date as string;
  findDateAfter(date)
    .then((result) => res.send(result))
    .catch((error) => {
      res.status(500).send({ err: error });
      next(error);
    });
});

router.get('/update', (req: express.Request, res: express.Response) => {
  const id = req.query.id as string;
  console.log('已經更新');
  const datas = {
    date: req.query.date,
    systolic: req.query.systolic,
    diastolic: req.query.diastolic,
    pulse: req.query.pulse,
  };
  console.log(datas);
  updateData(id, datas)
    .then(() => res.send({ status: 'success', message: 'Record updated' }))
    .catch((error: any) => res.status(500).send({ err: error }));
});

router.get('/delete', (req: express.Request, res: express.Response) => {
  const id = req.query.id as string;
  deleteData(id);
  res.send({ status: 'success', message: 'Record deleted' });
});

export default router;
