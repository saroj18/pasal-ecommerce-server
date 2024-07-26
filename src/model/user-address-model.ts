import mongoose, { Schema } from "mongoose";
import { Document } from "mongoose";

type LocationType={
    lat:number
    lng:number
}

interface AddressType extends Document {
    state: string;
    city:string
    tole:string,
    district:string
    ward:string
    nearBy:string
    defaultAddress:string
    location:LocationType
    addressOf:Schema.Types.ObjectId
}

const AddressSchema:Schema<AddressType>=new Schema({
    state:{
        type:String,
        required:true,
        trim:true
    },
    city:{
        type:String,
        required:true,
        trim:true
    },
    tole:{
        type:String,
        required:true,
        trim:true
    },
    district:{
        type:String,
        required:true,
        trim:true
    },
    ward:{
        type:String,
        required:true,
        trim:true
    },
    nearBy:{
        type:String,
        required:true,
        trim:true
    },
    defaultAddress:{
        type:String,
        required:true,
        trim:true
    },
    location:{
        type:Object,
        required:true
    },
    addressOf:{
        type:Schema.Types.ObjectId,
        ref:'user'
    }

})

export const Address=mongoose.model<AddressType>('address',AddressSchema)