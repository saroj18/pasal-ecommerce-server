var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const UserSchema = new Schema({
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
    socketInfo: {
        type: Schema.Types.Mixed,
        default: null,
    },
    online: {
        type: Boolean,
        default: false,
    },
    oAuthLogin: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    validateBeforeSave: true,
});
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        this.password = yield bcrypt.hash(this.password, 10);
        next();
    });
});
UserSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt.compare(password, this.password);
    });
};
UserSchema.methods.generateAccessToken = function () {
    const token = jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        role: this.role,
    }, process.env.ACCESS_TOKEN_SECRETE, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY_TIME,
    });
    return token;
};
UserSchema.methods.generateRefreshToken = function () {
    const token = jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRETE, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY_TIME,
    });
    return token;
};
export const User = mongoose.model("user", UserSchema);
