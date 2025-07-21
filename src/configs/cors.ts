import { CorsOptions } from 'cors';

const whitelist = [
    'http://localhost:5173',
    'https://your-production-frontend.com',
];

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};
