import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import categoryRoutes from "./routes/categoryRoute.ts"

dotenv.config();

const app =express();
app.use(express.json)
app.use(express.urlencoded({extended:false}));


app.use("/api/categories",categoryRoutes);

export default app;