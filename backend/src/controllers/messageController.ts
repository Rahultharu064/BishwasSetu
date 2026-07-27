import type { Request, Response, NextFunction } from "express";
import * as messageService from "../services/messageService";

export async function conversations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await messageService.listConversations(req.user!.id);
    res.json({ success: true, data: { conversations: data } });
  } catch (err) {
    next(err);
  }
}

export async function thread(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await messageService.getThread(
      req.user!.id,
      req.params.bookingId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function send(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await messageService.sendMessage(
      req.user!.id,
      req.params.bookingId,
      req.body?.body
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
