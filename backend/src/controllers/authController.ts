import type { Request, Response } from "express";
import prismaClient from "../config/db.ts";
import Jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.ts";
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
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : email;
    if (!email || !name || !phone || !password) {
      res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "name,email and password are required" } })
      return;
    }
    const existingUser = await prismaClient.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }]
      }
    })
    if (existingUser) {
      console.log("Registration failed: User already exists", normalizedEmail);
      return res.status(400).json({ message: "User already existed" })
    }
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        role,
        otp,
        otpExpiry
      }
    })

    await sendOtpEmail(normalizedEmail, otp);
    res.status(201).json({
      message: "OTP sent to email",
      UserID: user.id
    })
  }
  catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Registration failed" })
  }
}


//login user 

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    const normalizedIdentifier = typeof identifier === "string" ? identifier.toLowerCase().trim() : identifier;

    const user = await prismaClient.user.findFirst({
      where: { email: normalizedIdentifier }
    })
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = Jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    setAuthCookie(res, token);
    res.json({ message: "Login successful" });

  }
  catch (error) {
    res.status(500).json({ message: "login failed" })
  }


}


// verify otp 
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;
    const idNum = typeof userId === "string" ? Number(userId) : userId;
    if (!idNum || Number.isNaN(idNum)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    const user = await prismaClient.user.findUnique({ where: { id: idNum } });

    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expiry OTP" })
    }
    await prismaClient.user.update({
      where: { id: idNum },
      data: {
        otp: null, otpExpiry: null, isVerified: true
      }
    })

    const token = Jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    setAuthCookie(res, token);
    res.json({ message: "Authentication successful" });

  } catch (error) {
    res.status(500).json({ message: "otp failed" })

  }
}



//logout user 
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "logout successfully" })
}


export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const idNum = typeof userId === "string" ? Number(userId) : userId;
    if (!idNum || Number.isNaN(idNum)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    const user = await prismaClient.user.findUnique({ where: { id: idNum } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await prismaClient.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry },
    });
    await sendOtpEmail(user.email, otp);
    return res.json({ message: "OTP resent to email" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to resend OTP" });
  }
};



//GET /api/users/me
export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const user = await prismaClient.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        phone: true,
        address: true,
        district: true,
        municipality: true,
        gender: true,
        provider: {
          include: {
            category: true,
            kycDocuments: true,
            user: true,
            service: true
          }
        },
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};
