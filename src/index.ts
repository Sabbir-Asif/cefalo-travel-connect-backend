import express, {Express} from 'express';
import { PORT } from './configs/secrets';
import { rootRouter } from './routes/root';
import { db } from './configs/db';
import { errorMiddleware } from './middlewares/error';
import cookieParser from 'cookie-parser';
import { Database } from './utils/database';

const app: Express = express();
const database = new Database();
app.use(express.json());
app.use(cookieParser());

app.use('/api',rootRouter);
app.use(errorMiddleware);

app.listen(PORT, async ()=> {
    console.log(`server is running on port ${PORT}`);
     await database.connect();
})