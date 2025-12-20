import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import categoryRoutes from "./routes/categoryRoute.ts";
import authRoutes  from "./routes/authRoute.ts"
import serviceRoutes from "./routes/serviceRoute.ts";

dotenv.config();

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

const allowedOrigin = [
    process.env.FRONTEND_URL
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        origin.startsWith("http://localhost:") ||
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);




app.use("/api/categories", categoryRoutes);
app.use("/api/auth",authRoutes)
app.use("/api/services", serviceRoutes);


// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
