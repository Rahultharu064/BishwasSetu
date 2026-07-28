import type { Request, Response, NextFunction } from "express";
import * as neighborhoodService from "../services/neighborhoodService";
import { requireString } from "../utils/reqValue";

export async function providerStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await neighborhoodService.getProviderNeighborhoodStats(
      requireString(req.params.providerId, "providerId")
    );
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function createArea(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const area = await neighborhoodService.createArea(req.body);
    res.status(201).json({ success: true, data: area });
  } catch (err) {
    next(err);
  }
}

export async function listAreas(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const areas = await neighborhoodService.listAreas();
    res.json({ success: true, data: areas });
  } catch (err) {
    next(err);
  }
}
