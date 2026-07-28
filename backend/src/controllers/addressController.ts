import type { Request, Response, NextFunction } from "express";
import * as addressService from "../services/addressService";
import { requireString } from "../utils/reqValue";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addressService.listAddresses(req.user!.id);
    res.json({ success: true, data: { addresses: data } });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addressService.createAddress(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addressService.updateAddress(
      req.user!.id,
      requireString(req.params.id, "id"),
      req.body
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function setDefault(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await addressService.setDefaultAddress(
      req.user!.id,
      requireString(req.params.id, "id")
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addressService.deleteAddress(req.user!.id, requireString(req.params.id, "id"));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
