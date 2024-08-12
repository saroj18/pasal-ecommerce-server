import { Multer } from "multer";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";
import { DeleveryPersonZodSchema } from "../zodschema/deleveryPerson/deleveryPerson.js";
import { errorFormatter } from "../utils/errorFormater.js";
import { DeleveryPerson } from "../model/delevery-person-model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addDeleveryPerson = asyncHandler(async (req, resp) => {
  const {
    firstname,
    lastname,
    address,
    citiNumber,
    gender,
    phone,
    password,
    email,
  } = req.body;
  const images = req.files as Express.Multer.File[];

  console.log("hello", images);
  const uploadOnCloudinary = await uploadImageOnCloudinary(
    images,
    "deleveryPerson"
  );

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
    const error = errorFormatter(validate.error?.format());
    console.log("hehe", error);
    resp.status(400).json({ success: false, error });
    return;
  }

  const saveDeleveryPerson = await DeleveryPerson.create({
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
    .json(
      new ApiResponse(
        "successfully added delevery person",
        200,
        saveDeleveryPerson
      )
    );
});

export const getDeleveryPerson = asyncHandler(async (req, resp) => {
  const deleveryPerson = await DeleveryPerson.find();
  if (!deleveryPerson) {
    throw new Error("faild to get delevery person");
  }
  resp.status(200).json(new ApiResponse("", 200, deleveryPerson));
});
