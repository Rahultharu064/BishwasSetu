import { Request, Response, NextFunction } from 'express'
import * as ServiceModule from '../services/serviceService'
import { sendSuccess, sendError } from '../utils/response'

// ── Level 1: Categories ───────────────────────────────────────

export const getAllCategories = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getAllCategories()
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getCategoryBySlug = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getCategoryBySlug(req.params.slug)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getProvidersByCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getProvidersByCategory(req.params.slug, {
      serviceArea: req.query.serviceArea as string,
      trustMin:    Number(req.query.trustMin ?? 0),
      page:        Number(req.query.page    ?? 1),
      limit:       Number(req.query.limit   ?? 10),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const createCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.createCategory(req.body)
    sendSuccess(res, data, 'Category created', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const updateCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.updateCategory(req.params.id, req.body)
    sendSuccess(res, data, 'Category updated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const toggleCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.toggleCategory(
      req.params.id,
      req.body.isActive
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

// ── Level 2: Sub-categories ───────────────────────────────────

export const getSubCategories = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getSubCategories(req.params.slug)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getSubCategoryBySlug = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getSubCategoryBySlug(
      req.params.categorySlug,
      req.params.subSlug
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const createSubCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.createSubCategory(req.body)
    sendSuccess(res, data, 'Sub-category created', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const updateSubCategory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.updateSubCategory(req.params.id, req.body)
    sendSuccess(res, data, 'Sub-category updated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

// ── Level 3: Services ─────────────────────────────────────────

export const getServices = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getServices(req.params.subCategoryId)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getServiceBySlug = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.getServiceBySlug(
      req.params.categorySlug,
      req.params.subSlug,
      req.params.serviceSlug
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const createService = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.createService(req.body)
    sendSuccess(res, data, 'Service created', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const updateService = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.updateService(req.params.id, req.body)
    sendSuccess(res, data, 'Service updated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const toggleService = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.toggleService(
      req.params.id,
      req.body.isActive
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

// ── Search ────────────────────────────────────────────────────

export const searchServices = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ServiceModule.searchServices(req.query.q as string)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}