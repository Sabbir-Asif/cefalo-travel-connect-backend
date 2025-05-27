import express, {Express} from 'express';
import { PORT } from './configs/secrets';

const app: Express = express();
app.use(express.json());

app.listen(PORT, ()=> {
    console.log(`server is running on port ${PORT}`);
})