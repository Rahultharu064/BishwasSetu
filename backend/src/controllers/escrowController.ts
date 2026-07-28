import type { Request, Response, NextFunction } from "express";
import * as escrowService from "../services/escrowService";
import { requireString } from "../utils/reqValue";

export async function initiate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await escrowService.initiateEscrow(req.user!.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const escrow = await escrowService.verifyAndHold(req.body);
    res.json({ success: true, data: escrow });
  } catch (err) {
    next(err);
  }
}

export async function release(req: Request, res: Response, next: NextFunction) {
  try {
    const { latitude, longitude } = req.body;
    const escrow = await escrowService.releaseEscrow(
      req.user!.id,
      requireString(req.params.escrowId, "escrowId"),
      latitude != null && longitude != null ? { latitude, longitude } : undefined
    );
    res.json({ success: true, data: escrow });
  } catch (err) {
    next(err);
  }
}

export async function refund(req: Request, res: Response, next: NextFunction) {
  try {
    const escrow = await escrowService.refundEscrow(
      requireString(req.params.escrowId, "escrowId"),
      req.body.reason
    );
    res.json({ success: true, data: escrow });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const escrow = await escrowService.getEscrowForUser(
      { id: req.user!.id, providerId: req.user!.providerId },
      requireString(req.params.escrowId, "escrowId")
    );
    res.json({ success: true, data: escrow });
  } catch (err) {
    next(err);
  }
}
