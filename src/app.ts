import express, { Express } from "express";
import { rootRouter } from "./routes/root";
import { errorMiddleware } from "./middlewares/error";
import cookieParser from "cookie-parser";
import cors from "cors";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use("/api", rootRouter);
app.use(errorMiddleware);

export default app;
