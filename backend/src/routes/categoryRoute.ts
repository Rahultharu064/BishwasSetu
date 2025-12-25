import express from "express";
import {
  createCategory,
  getCategory,
  searchCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithStats
} from "../controllers/categoryController.ts";
import {
  createCategorySchema,
  updateCategorySchema
} from "../validators/categoryValidator.ts";
import { validationMiddleware } from "../middlewares/validateMiddleware.ts";

const categoryRoutes = express.Router();

// create category
categoryRoutes.post(
  "/create",
  validationMiddleware(createCategorySchema, "body"),
  createCategory
);

// get all categories
categoryRoutes.get("/", getCategory);

// get categories with stats
categoryRoutes.get("/stats", getCategoriesWithStats);

// search category
categoryRoutes.get("/search", searchCategory);

// update category
categoryRoutes.patch(
  "/:id",
  validationMiddleware(updateCategorySchema, "body"),
  updateCategory
);

// delete category
categoryRoutes.delete("/:id", deleteCategory);

export default categoryRoutes;

