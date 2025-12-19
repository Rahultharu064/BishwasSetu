import type{Request,Response} from "express";
import prismaClient from "../config/db.ts";
import  Jwt  from "jsonwebtoken";
import { JWT_SECRET,JWT_EXPIRES_IN } from "../config/jwt.ts";
import { generateOTP } from "../utils/otp.ts";
import { setAuthCookie } from "../utils/cookie.ts";
import { mailTransporter } from "../config/mail.ts";




const sendOtpEmail = async (email: string, otp: string) => {
  await mailTransporter.sendMail({
    from: `"BishwasSetu" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your BishwasSetu OTP",
    html: `
      <h2>Your OTP Code</h2>
      <p>Use the OTP below to continue:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `
  });
};


//register the user
export const registerUser= async(req:Request,res:Response)=>{
    try{
        const {name,email,phone,password,role}=req.body;
        if(!email || !name || !phone || !password){
            res.status(400).json({success:false,error:{code:"INVALID_INPUT",message:"name,email and password are required"}})
            return;
        }
        const existingUser= await prismaClient.user.findFirst({
            where:{
                OR:[{email}]
            }
        })
        if(existingUser){
            return res.status(400).json({message:"User already existed"})
        }
        const otp=generateOTP();
        const otpExpiry=new Date(Date.now()+ 5*60*1000);

        const user = await prismaClient.user.create({
            data:{
                name,email,phone,password,role,otp,otpExpiry
            }
        })

        await sendOtpEmail(email,otp);
        res.status(201).json({message:"OTP sent to email",
            UserID:user.id
        })
    }
    catch(error){
        res.status(500).json({message:"Registration failed"})
    }
}


//login user 

export const loginUser=async(req:Request,res:Response)=>{
    try{
    const {identifier, password}=req.body;

    const user = await prismaClient.user.findFirst({where:{email:identifier},
select:{
    id:true,name:true,email:true, password:true
}
    })
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp=generateOTP();
    const otpExpiry=new Date(Date.now()+ 5*60*1000);
    await prismaClient.user.update({
        where:{id:user.id},
        data:{otp,otpExpiry}
    })
    await sendOtpEmail(identifier,otp);
    res.json({
        message:"otp sent to email",
        userId:user.id
    })

    }
    catch(error){
        res.status(500).json({message:"login failed"})
    }


}


// verify otp 
export const verifyOTP= async(req:Request, res:Response) =>{
    try{
        const {userId, otp}=req.body;
        const user= await prismaClient.user.findUnique({where:{id:userId}});

        if(!user || user.otp !==otp || !user.otpExpiry || user.otpExpiry <new Date()){
            return res.status(400).json({message:"Invalid or expiry OTP"})
        }
        await prismaClient.user.update({
            where:{id:userId},
            data:{
                otp:null,otpExpiry:null,isVerified:true
            }
        })

       const token = Jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    setAuthCookie(res,token);
    res.json({message:"Authentication successful"});

    } catch(error){
        res.status(500).json({message :"otp failed"})
    
}
}



//logout user 
export const logout=async(req:Request,res:Response) =>{
    res.clearCookie("token");
    res.json({message:"logout successfully"})
}





