import express from "express"
import { createCategory,getCategory,searchCategory,updateCategory,deleteCategory } from "../controllers/categoryController.ts"
import { createCategorySchema,updateCategorySchema } from "../validators/categoryValidaor.ts"
import { validationMiddleware } from "../middlewares/validateMiddleware.ts"


const categoryRoutes=express.Router();

//create category 
categoryRoutes.post("/",validationMiddleware(createCategorySchema,"body"),createCategory);
//get all category
categoryRoutes.get("/",getCategory);
//search category
categoryRoutes.get("/search",searchCategory);
//update category
categoryRoutes.patch("/:id",validationMiddleware(updateCategorySchema),updateCategory)
//delete category
categoryRoutes.delete("/:id",deleteCategory);



export default categoryRoutes;