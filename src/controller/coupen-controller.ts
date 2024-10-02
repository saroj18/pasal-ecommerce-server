import { Coupen } from "../model/coupen-model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const createCoupen = asyncHandler(async (req, resp) => {
    const { coupenName, coupenDiscount, coupenCode } = req.body
    
    if (!coupenName || !coupenCode || !coupenDiscount) {
        throw new ApiError("please provide required info")
    }

    const coupen = await Coupen.create({
        coupenName,
        coupenCode,
        coupenDiscount
    })

    if (!coupen) {
        throw new ApiError("failed to create coupen")
    }

    resp.status(200).json(new ApiResponse("coupen create successfully",200,coupen))
})


export const deleteCoupen = asyncHandler(async (req, resp) => {
    const { id } = req.query
    
    if (!id) {
        throw new ApiError("please provide id")
    }

    const deleteCoupen = await Coupen.findByIdAndDelete(id)
    
    if (!deleteCoupen) {
        throw new ApiError("failed to delete coupen")
    }

    resp.status(200).json(new ApiResponse("coupen deleted successfully",200,deleteCoupen))
})


export const checkCoupen = asyncHandler(async (req, resp) => {
    const { coupen } = req.body
    
    if (!coupen) {
        throw new ApiError("please provide coupen code")
    }

    const findCoupen = await Coupen.findOne({ coupenCode: { $regex: new RegExp(`^${coupen}$`, 'i') } });

    
    if (!findCoupen) {
        throw new ApiError("your coupen is not valid")
    }

    resp.status(200).json(new ApiResponse("",200,findCoupen))
})


export const getAllCoupen = asyncHandler(async (req, resp) => {


    const findCoupen = await Coupen.find()
    
    if (findCoupen.length==0||!findCoupen) {
        throw new ApiError("coupen not found")
    }

    resp.status(200).json(new ApiResponse("",200,findCoupen))
})