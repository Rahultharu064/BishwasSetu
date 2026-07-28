import type { Request, Response, NextFunction } from "express";
import * as emergencyService from "../services/emergencyService";
import { requireString } from "../utils/reqValue";

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

export async function myOffers(req: Request, res: Response, next: NextFunction) {
  try {
    const offers = await emergencyService.getProviderOffers(
      req.user!.providerId!
    );
    res.json({ success: true, data: { offers } });
  } catch (err) {
    next(err);
  }
}

export async function accept(req: Request, res: Response, next: NextFunction) {
  try {
    // Offers are keyed by Provider.id, not User.id.
    const booking = await emergencyService.acceptEmergency(
      req.user!.providerId!,
      requireString(req.params.requestId, "requestId")
    );
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function decline(req: Request, res: Response, next: NextFunction) {
  try {
    await emergencyService.declineEmergency(
      req.user!.providerId!,
      requireString(req.params.requestId, "requestId")
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function status(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await emergencyService.getEmergencyStatus(
      { id: req.user!.id, providerId: req.user!.providerId },
      requireString(req.params.requestId, "requestId")
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
      requireString(req.params.requestId, "requestId")
    );
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}
