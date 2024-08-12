import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface DeleveryPersonType extends Document {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
  citiNumber: string;
  idDocument: string;
  profileImage: string;
  gender: string;
  address: string;
  status:string
}

const DeleveryPersonSchema: Schema<DeleveryPersonType> = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    citiNumber: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    idDocument: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
      required: true,
      trim: true,
    },
    status:{
        type:String,
        default:'active',
        required:true,
        trim:true
    }
  },
  {
    timestamps: true,
  }
);

DeleveryPersonSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const DeleveryPerson = mongoose.model<DeleveryPersonType>(
  "deleveryPerson",
  DeleveryPersonSchema
);
