import type{Request,Response} from  "express"
import prismaClient from "../config/db.ts"


//create category 

export const createCategory = async (req:Request,res:Response)=>{
    const {name,icon} =req.body;
    const existing=await prismaClient.category.findUnique({
        where:{name}
    })
    if (existing){
        return res.status(400).json({message:"category already exists"})
    }
    const category = await prismaClient.category.create({
        data:{name,icon}
    })
    return res.status(201).json({
        message:"category created successfully",
        category
    })
}

// get all categories(for public user)
export const getCategory = async (req:Request,res:Response)=>{

    const categories=await prismaClient.category.findMany({
        orderBy:{createdAt:"desc"}
    })
    res.json(categories)
}

//search category 
export const searchCategory=async(req:Request,res:Response)=>{
     const query = (req.query.query as string) || "";

    const categories=await prismaClient.category.findMany({
        where:{
            name:{
                contains:query,
               
            }
        },
        orderBy:{createdAt:"desc"}
    })
    res.json({count:categories.length,
        categories
    })
}

//update category(admin only)
export const updateCategory=async(req:Request,res:Response)=>{
    const {id}=req.params;
    if(!id){
        return res.status(400).json({
            message:"Category ID is required"
        })
    }
    const category=await prismaClient.category.update({
        where:{id},
        data:req.body
    })
    res.json({
        message:"category updated",
        category
    })

}


// delete category 
export const deleteCategory=async(req:Request,res:Response)=>{
    const {id}=req.params;
    if(!id){
        return res.status(400).json({message:"Category  ID is needed"})
    }
    await prismaClient.category.delete({
        where:{id}
    })
    return res.json({message:"category deleted successfully"})

}