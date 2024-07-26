import mongoose, { Document, Schema } from "mongoose";

type LocationType = {
  lat: number;
  lng: number;
};

interface ShopType extends Document {
  shopName: string;
  owner: Schema.Types.ObjectId;
  location: LocationType;
  category: string;
  image: string;
  ownerAddress: Schema.Types.ObjectId;
  shopImage:string
  documentImage:string
  yourImage:string
  monthlyTurnover:string,
  shopAddress:string
}

const ShopSchema: Schema<ShopType> = new Schema({
  shopName: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  location: {
    type: Object,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  shopImage: {
    type: String,
    required: true,
    trim: true,
  },
  documentImage: {
    type: String,
    required: true,
    trim: true,
  },
  yourImage: {
    type: String,
    required: true,
    trim: true,
  },
  ownerAddress: {
    type: Schema.Types.ObjectId,
    ref: "address",
    required: true,
  },
  shopAddress: {
    type: String,
    required: true,
  },
  monthlyTurnover: {
    type: String,
    required: true,
    trim:true
  },
});

export const Shop = mongoose.model<ShopType>("shop", ShopSchema);
