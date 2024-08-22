import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

interface Customer extends Document {
  fullname: string;
  email: string;
  password: string;
  role: string;
  refreshToken: string;
  address: Schema.Types.ObjectId;
  gender: string;
  username: string;
  verify: Boolean;
  comparePassword: (password: string) => boolean;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
  mobile: string;
  dob: string;
  shopVerify: boolean;
  buyProduct: Schema.Types.ObjectId;
  signUpAs: string;
  block: boolean;
}

const UserSchema: Schema<Customer> = new Schema(
  {
    fullname: {
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
      default: null,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["customer", "seller", "admin"],
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "address",
      default: null,
    },
    gender: {
      type: String,
      trim: true,
      enum: ["male", "female"],
      default: null,
    },
    username: {
      type: String,
      trim: true,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    dob: {
      type: String,
      default: null,
    },
    mobile: {
      type: String,
      default: null,
    },
    shopVerify: {
      type: Boolean,
      default: false,
    },
    signUpAs: {
      type: String,
      trim: true,
    },
    block: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    validateBeforeSave: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRETE as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY_TIME,
    }
  );
  return token;
};

UserSchema.methods.generateRefreshToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRETE as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY_TIME,
    }
  );
  return token;
};

export const User = mongoose.model<Customer>("user", UserSchema);
