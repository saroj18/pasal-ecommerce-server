import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

enum RoleEnum {
  CUSTOMER = "customer",
  SELLER = "seller",
  ADMIN = "admin",
}

interface Customer extends Document {
  name: string;
  email: string;
  password: string;
  role: RoleEnum;
  refreshToken: string;
  address: string;
  gender: "male" | "female";
  username: string;
  verify:Boolean
}

const User: Schema<Customer> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    refreshToken: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    verify: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

User.pre('save',async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password=await bcrypt.hash(this.password,10)
    next()
})

User.methods.comparePassword = async (password: string): Promise<boolean> => {
  const check = await bcrypt.compare(password, (this as any).password);
  return check;
};


User.methods.generateAccessToken=function (){
    const token = jwt.sign(
        {
          _id: this._id,
          email: this.email,
          username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRETE as string,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY_TIME,
        }
      );
      return token;
}

User.methods.generateRefreshToken = function(){
  const token = jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_EXPIRY_TIME as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY_TIME,
    }
  );
  return token
};

export const UserModel = mongoose.model<Customer>("user", User);
