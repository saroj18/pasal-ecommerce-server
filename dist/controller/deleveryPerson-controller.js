var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import { DeleveryPersonZodSchema } from "../zodschema/deleveryPerson/deleveryPerson.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { DeleveryPerson } from "../model/delevery-person-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
export const addDeleveryPerson = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { firstname, lastname, address, citiNumber, gender, phone, password, email, } = req.body;
    const images = req.files;
    console.log("hello", images);
    const uploadOnCloudinary = yield uploadImageOnCloudinary(images, "deleveryPerson");
    const validate = DeleveryPersonZodSchema.safeParse({
        firstname,
        lastname,
        address,
        citiNumber,
        gender,
        phone,
        password,
        email,
        idDocument: uploadOnCloudinary[0],
        profileImage: uploadOnCloudinary[1],
    });
    if (!validate.success) {
        const error = errorFormatter((_a = validate.error) === null || _a === void 0 ? void 0 : _a.format());
        console.log("hehe", error);
        resp.status(400).json({ success: false, error });
        return;
    }
    const saveDeleveryPerson = yield DeleveryPerson.create({
        firstname,
        lastname,
        address,
        citiNumber,
        phone,
        email,
        password,
        idDocument: uploadOnCloudinary[0],
        profileImage: uploadOnCloudinary[1],
        gender,
    });
    if (!saveDeleveryPerson) {
        throw new Error("faild to save on db");
    }
    resp
        .status(200)
        .json(new ApiResponse("successfully added delevery person", 200, saveDeleveryPerson));
}));
export const getDeleveryPerson = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const deleveryPerson = yield DeleveryPerson.find();
    if (!deleveryPerson) {
        throw new Error("faild to get delevery person");
    }
    resp.status(200).json(new ApiResponse("", 200, deleveryPerson));
}));
export const deleteDeleveryPerson = asyncHandler((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError("invalid credentials");
    }
    const deleveryPerson = yield DeleveryPerson.findByIdAndDelete(id);
    if (!deleveryPerson) {
        throw new Error("faild to delete delevery person");
    }
    resp.status(200).json(new ApiResponse("successfully deleted", 200, null));
}));
