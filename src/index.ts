import express, {Express} from 'express';
import { PORT } from './configs/secrets';
import { rootRouter } from './routes/root';
import { db } from './configs/db';

const app: Express = express();
app.use(express.json());

app.use('/api',rootRouter);

app.listen(PORT, ()=> {
    console.log(`server is running on port ${PORT}`);
})

db.raw('SELECT 1')
.then(() => console.log('Database connected successfully'))
.catch(err => console.error('Database connection failed', err));