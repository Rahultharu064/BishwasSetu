import type { Request, Response, NextFunction } from "express";
import * as emergencyService from "../services/emergencyService";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await emergencyService.createEmergencyRequest(
      req.user!.id,
      req.body
    );
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

export async function accept(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await emergencyService.acceptEmergency(
      req.user!.id,
      req.params.requestId
    );
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function decline(req: Request, res: Response, next: NextFunction) {
  try {
    await emergencyService.declineEmergency(req.user!.id, req.params.requestId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function status(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await emergencyService.getEmergencyStatus(
      req.user!.id,
      req.params.requestId
    );
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await emergencyService.cancelEmergency(
      req.user!.id,
      req.params.requestId
    );
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}
