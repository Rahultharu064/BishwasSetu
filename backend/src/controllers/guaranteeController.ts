import type { Request, Response, NextFunction } from "express";
import * as guaranteeService from "../services/guaranteeService";
import { requireString } from "../utils/reqValue";
import { uploadToCloudinary } from "../utils/cloudinary";

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
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const photoUrls = await Promise.all(
      files.map(async (file, i) => {
        const uploaded = await uploadToCloudinary(
          file.buffer,
          "bishwassetu/guarantee-claims",
          `claim_${req.params.guaranteeId}_${Date.now()}_${i}`
        );
        return uploaded.secureUrl;
      })
    );

    const claim = await guaranteeService.fileGuaranteeClaim(
      req.user!.id,
      requireString(req.params.guaranteeId, "guaranteeId"),
      { description: req.body.description, photoUrls }
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
      requireString(req.params.claimId, "claimId"),
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
    const providerId = requireString(req.params.providerId, "providerId");
    const points = await guaranteeService.getProviderRevenuePoints(providerId);
    res.json({ success: true, data: { providerId, points } });
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
