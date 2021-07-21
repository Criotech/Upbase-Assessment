import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import db from './config/db';
import express from 'express';
import routes from './routes';
import * as dotenv from 'dotenv';
import morganBody from 'morgan-body';
dotenv.config();

const app = express();

db();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
morganBody(app);

routes(app);

app.get('/', (req, res) => {
  res.send(200)
  // res.status(200).json('Working fine');
});

app.use(function (req, res, next) {
  res.status(404).json({ err: 'not found' });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

export default app;

