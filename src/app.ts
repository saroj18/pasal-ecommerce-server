import express, { Request, Response } from 'express'
import { userRouter } from './route/user-route.js'
import { globalErrorHandler } from './helper/globalErrorHandler.js'
import { ApiError } from './utils/ApiError.js'

export const app=express()

app.use('/api/v1/user',userRouter)
app.use((err:ApiError,req:Request,resp:Response)=>{
    globalErrorHandler(err,resp)
})