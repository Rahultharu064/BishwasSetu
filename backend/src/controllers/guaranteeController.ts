import type { Request, Response, NextFunction } from "express";
import * as guaranteeService from "../services/guarantee.service";

export async function listMine(req: Request, res: Response, next: NextFunction) {
  try {
    const guarantees = await guaranteeService.listGuaranteesForCustomer(
      req.user!.id
    );
    res.json({ success: true, data: guarantees });
  } catch (err) {
    next(err);
  }
}

export async function fileClaim(req: Request, res: Response, next: NextFunction) {
  try {
    const claim = await guaranteeService.fileGuaranteeClaim(
      req.user!.id,
      req.params.guaranteeId,
      req.body
    );
    res.status(201).json({ success: true, data: claim });
  } catch (err) {
    next(err);
  }
}

export async function resolveClaim(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const claim = await guaranteeService.resolveGuaranteeClaim(
      req.params.claimId,
      req.body.resolution
    );
    res.json({ success: true, data: claim });
  } catch (err) {
    next(err);
  }
}

export async function revenuePoints(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const points = await guaranteeService.getProviderRevenuePoints(
      req.params.providerId
    );
    res.json({ success: true, data: { providerId: req.params.providerId, points } });
  } catch (err) {
    next(err);
  }
}

export async function leakageFlags(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const flags = await guaranteeService.listOpenLeakageFlags();
    res.json({ success: true, data: flags });
  } catch (err) {
    next(err);
  }
}
