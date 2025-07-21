import express, { Express } from 'express';
import cors from "cors";
import { PORT } from './configs/secrets';
import { rootRouter } from './routes/root.router';
import { globalErrorHandler } from './middlewares/error';
import cookieParser from 'cookie-parser';
import { Database } from './utils/database';
import { corsOptions } from './configs/cors';

const app: Express = express();
const database = new Database();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors(corsOptions));


app.use('/api', rootRouter);
app.use(globalErrorHandler);

(async () => {
    await database.connect();
})();

app.listen(PORT, async () => {
    console.log(`server is running on port ${PORT}`);
})