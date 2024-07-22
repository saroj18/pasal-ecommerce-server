import {  Response } from "express";
import { ApiError } from "../utils/ApiError.js";

export const globalErrorHandler =  (
  err: ApiError,
  resp: Response,
) => {
  console.log('error>>>',err);
  if (err instanceof ApiError) {
    resp
      .status(err.statusCode)
      .json({
        error: err.message,
        statusCode: err.statusCode,
        success: err.success,
      });
  } else {
    resp
      .status(400)
      .json({
        error:"Internal server error",
        statusCode: 400,
        success: false,
      });
  }
};
