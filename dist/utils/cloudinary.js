var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
    cloud_name: "dp4vn6jd7",
    api_key: "339257795863293",
    api_secret: "3RUxBPl99sJJBeuBwsWXyXtE1O4",
});
export const uploadImageOnCloudinary = (images, folderName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!images) {
            return [];
        }
        const uploadedImages = yield Promise.all(images.map((image) => {
            return cloudinary.uploader.upload(image.path, {
                folder: folderName,
                resource_type: "auto",
            });
        }));
        images.forEach((img) => {
            fs.unlinkSync(img.path);
        });
        const uploadedImagesPath = [];
        uploadedImages.forEach((img) => {
            uploadedImagesPath.push(img.secure_url);
        });
        return uploadedImagesPath;
    }
    catch (error) {
        images.forEach((ig) => {
            fs.unlinkSync(ig.path);
        });
        throw new Error(error.message);
    }
});
