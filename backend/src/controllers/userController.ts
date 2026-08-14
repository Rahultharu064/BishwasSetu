import type { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService";

export async function getPaymentPreference(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await userService.getPaymentPreference(req.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updatePaymentPreference(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await userService.updatePaymentPreference(
      req.user!.id,
      req.body
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await userService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, message: "Profile updated.", data });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await userService.changePassword(req.user!.id, req.body);
    res.json({ success: true, message: data.message, data });
  } catch (err) {
    next(err);
  }
}
