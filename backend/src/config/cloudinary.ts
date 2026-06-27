import { v2 as cloudinary } from "cloudinary";
import type { Request } from "express";
import createCloudinaryStorage from 'multer-storage-cloudinary';
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({})



if(!process.env.CLOUDINARY_CLOUD_NAME  || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET){
  throw new Error("Missing cloudinary config")
}

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

console.log("cloudinary configured successfully")

export const cloudinaryStorage=createCloudinaryStorage({
    cloudinary:cloudinary,
    params:async(_req:Request, file:Express.Multer.File)=>{
        //sanitize filename remove the extension
        const sanitizedName= file.originalname.split('.')[0]
        .replace(/[^a-z0-9]/gi,'_')
        .toLowerCase();

        const folder=(_req.body?.folder as string)|| 'bishwassetu/uploads'
        return{
            folder:folder,
            allowed_formats:['jpg', 'png', 'jpeg', 'gif', 'webp'],
            public_id: `${folder}/${sanitizedName}_${Date.now()}`,
            resource_type:'auto',
            transformation:[{width:1200,quality:80,crop:"limit"}]
        }
       
    }

})

export default cloudinary