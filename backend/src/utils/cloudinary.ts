import cloudinary from "../config/cloudinary"
import { UploadApiResponse } from "cloudinary"

export interface CloudinaryUploadResult{
    publicId:string
    secureUrl:string
    resourceType:string
    bytes:number

}




// upload a buffere to cloudinary
export const uploadToCloudinary = (
  buffer:   Buffer,
  folder:   string,
  filename: string,
  options:  Record<string, unknown> = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id:     filename,
        resource_type: 'auto',
        ...options,
      },
      (error: any, result: UploadApiResponse | undefined) => {
        if (error || !result) return reject(error)
        resolve({
          publicId:     result.public_id,
          secureUrl:    result.secure_url,
          resourceType: result.resource_type,
          bytes:        result.bytes,
        })
      }
    )
    uploadStream.end(buffer)
  })
}


// - Generate a signed delivery url (KYC docs - time-limited)


export const getSignedUrl=(
    publicId:string,
    expiresIn=900,

): string =>{
    const expireAt= Math.floor(Date.now()/1000) + expiresIn
    return cloudinary.url(publicId,{
        expires_at:expireAt,
        resource_type:'auto',
        sign:true,
        type:'authenticated',
        
    })
}

//  delete ad file from cloudinary
export const deletefromcloudinary=async(publicId:string):Promise<void> =>{
    await cloudinary.uploader.destroy(publicId,{invalidate:true})
}
