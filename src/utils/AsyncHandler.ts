import { NextFunction, Request, Response } from "express"
import { ApiError } from "./ApiError.js"

type FunctionType=(req:Request,resp:Response,next:NextFunction)=>Promise<void>

export const asyncHandler=(func:FunctionType)=>{
    return async(req:Request,resp:Response,next:NextFunction)=>{
        try {
           await func(req,resp,next)
        } catch (error:any) {
            let customError=new ApiError(error.message)
            next(customError)
        }
    }
}