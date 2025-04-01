import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../apidoc.json';
import router from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 8000;

app.set('port', PORT);
console.log(`__dirname: ${__dirname}`);
console.log(`path${path.join(__dirname, './views')}`);
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/result', (req, res) => {
  res.render('result');
});
app.use('/api', router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/js/vue.js', (req, res) => {
  res.sendFile(path.join(__dirname, './views/vue.js'));
});

app.get('/js/axios.js', (req, res) => {
  res.sendFile(path.join(__dirname, './views/axios.js'));
});

app.get('/js/flatpickr.css', (req, res) => {
  res.sendFile(path.join(__dirname, './views/flatpickr.css'));
});

app.get('/js/flatpickr.js', (req, res) => {
  res.sendFile(path.join(__dirname, './views/flatpickr.js'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
export default app;
