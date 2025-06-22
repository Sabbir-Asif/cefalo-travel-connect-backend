import express, {Express} from 'express';
import { PORT } from './configs/secrets';
import { rootRouter } from './routes/root';
import { db } from './configs/db';
import { errorMiddleware } from './middlewares/error';
import cookieParser from 'cookie-parser';

const app: Express = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api',rootRouter);
app.use(errorMiddleware);

app.listen(PORT, ()=> {
    console.log(`server is running on port ${PORT}`);
})

db.raw('SELECT 1')
.then(() => console.log('Database connected successfully'))
.catch(err => console.error('Database connection failed', err));