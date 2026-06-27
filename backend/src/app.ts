import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser'
import categoryRoutes from "./routes/categoryRoute";
import authRoutes from "./routes/authRoute"
import providerRoutes from "./routes/providerRoute"
import serviceRoutes from "./routes/serviceRoute"
import bookingRoutes from "./routes/bookingRoute"
import adminRoutes from "./routes/adminRoute"
import reviewRoutes from "./routes/reviewRoute"

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

const allowedOrigin = [
  process.env.FRONTEND_URL
]
// Add after app.use(express.urlencoded(...))
app.use(cookieParser())

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
app.use("/api/auth", authRoutes)
app.use("/api/providers", providerRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/reviews", reviewRoutes)


// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
