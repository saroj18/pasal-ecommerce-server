import mongoose from "mongoose";
import { Document, Schema } from "mongoose";

interface CoupenType extends Document{
    coupenName: string
    coupenCode: string
    coupenDiscount: string
    
}

const CoupenSchema = new Schema<CoupenType>({
    coupenName: {
        type: String,
        required: true,
        trim:true
    },
    coupenCode: {
        type: String,
        required: true,
        trim:true
    },
    coupenDiscount: {
        type: String,
        required: true,
        trim:true
    }
    
},{
        timestamps:true
})
    

export const Coupen=mongoose.model<CoupenType>('coupen',CoupenSchema)