import mongoose, { Document, Schema } from "mongoose";

export interface CartType extends Document{
    product:Schema.Types.ObjectId,
    addedBy:Schema.Types.ObjectId
    productCount:Number
}

const CartSchema:Schema<CartType>= new Schema({
    product:{
        type:Schema.Types.ObjectId,
        ref:'product'
    },
    addedBy:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    productCount:{
        type:Number,
        required:true,
        default:1
    }
},
{
    timestamps:true
})

export const Cart=mongoose.model<CartType>('cart',CartSchema)