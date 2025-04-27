import express from 'express';
import { PORT } from './config/env.js';
import Userrouter from './routes/user.routes.js';
import Authrouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import connectDB from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middlewares.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middlewares/arcjet.mddlewares.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(arcjetMiddleware); // Arcjet middleware for security

app.use('/api/v1/auth', Authrouter);
app.use('/api/v1/users', Userrouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorMiddleware);




app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await connectDB();
});

export default app;