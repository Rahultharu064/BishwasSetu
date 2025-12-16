import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import categoryRoutes from "./routes/categoryRoute.ts";

dotenv.config();

const app =express();

app.use(express.json())
app.use(express.urlencoded({extended:false}));

const allowedOrigin=[
    process.env.FRONTEND_URL
]

app.use(cors({
    origin:(origin:string | undefined,callback:(err:Error | null, allow?:boolean)=>void) =>{
        if(!origin)
            return callback(null,true);
        if (allowedOrigin.indexOf(origin)===-1){

        }
        if(origin.startsWith("http://localhost:")){
            return callback(null,true);
        }
      
    },

    credentials: true
}));



app.use("/api/categories",categoryRoutes);

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
