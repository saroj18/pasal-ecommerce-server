import { Shop } from "../model/shop-details-model.js";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { ShopVerifyZodSchema } from "../zodschema/user/user-signup.js";

export const shopVerify=asyncHandler(async(req,resp)=>{
    const [yourImage,documentImage,shopImage]=req.files as Express.Multer.File[]
    const {shopDetails}=req.body
    const {shopName,shopAddress,category,turnover,citiNumber,shopLocation}=JSON.parse(shopDetails)
    const {_id}=req?.user
    console.log(_id)

    const validateInfo=ShopVerifyZodSchema.safeParse({
        shopName,
        shopAddress,
        category,
        turnover,
        citiNumber,
        shopImage,
        documentImage,
        shopLocation,
        yourImage
    })

    if(validateInfo.error){
        const error=errorFormatter(validateInfo.error?.format())
        resp.status(400).json({success:false,error})
        return
    }

    const uploadedImage=await uploadImageOnCloudinary([shopImage,documentImage,yourImage],"sellerImages")
    const findUser=await User.findById(_id)
    
    if(!findUser){
        throw new ApiError("user not found")
    }

    const saveOnDb=await Shop.create({
        shopName,
        owner:findUser._id,
        address:findUser.address,
        category,
        turnover,
        citiNumber,
        shopImage:uploadedImage[0],
        documentImage:uploadedImage[1],
        shopLocation,
        yourImage:uploadedImage[2],
        shopAddress
    })

    if(!saveOnDb){
        throw new Error("faild to save on db")
    }

    resp.status(200).json({success:true,message:"successfully saved",data:saveOnDb})

})