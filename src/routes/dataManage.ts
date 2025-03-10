import { addRecord, findAllData, findRecentData, findDateAfter, updateData } from '../controllers/data';
import { Router } from 'express';

const router = Router();

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

router.get('/all', (req, res, next) => {
  findAllData()
    .then((result) => res.send(result))
    .catch((error) => {
      res.status(500).send({ err: error });
      next(error);
    });
});

router.get('/recent', (req, res, next) => {
  const amount = parseInt(req.query.amount as string);
  findRecentData(amount)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).send({ err: error });
      next(error);
    });
});

router.get('/after', (req, res, next) => {
  const date = req.query.date as string;
  findDateAfter(date)
    .then((result) => res.send(result))
    .catch((error) => {
      res.status(500).send({ err: error });
      next(error);
    });
});

router.get('/update', (req, res) => {
  const id = req.query.id as string;
  const datas = {
    date: req.query.date,
    systolic: req.query.systolic,
    diastolic: req.query.diastolic,
    pulse: req.query.pulse,
  };
  updateData(id, datas)
    .then(() => res.send({ status: 'success', message: 'Record updated' }))
    .catch((error) => res.status(500).send({ err: error }));
});

export default router;
