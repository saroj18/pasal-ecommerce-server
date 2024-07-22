import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

type Images = Express.Multer.File;

cloudinary.config({
  cloud_name: "dp4vn6jd7",
  api_key: "339257795863293",
  api_secret: "3RUxBPl99sJJBeuBwsWXyXtE1O4",
});
export const uploadImageOnCloudinary = async (
  images: Images[],
  folderName: string
) => {
  try {
    if (!images) {
      return [];
    }

    const uploadedImages = await Promise.all(
      images.map((image) => {
        return cloudinary.uploader.upload(image.path, {
          folder: folderName,
          resource_type: "auto",
        });
      })
    );

    images.forEach((img) => {
      fs.unlinkSync(img.path);
    });
    const uploadedImagesPath: string[] = [];
    uploadedImages.forEach((img) => {
      uploadedImagesPath.push(img.secure_url);
    });
    return uploadedImagesPath;
  } catch (error: any) {
    images.forEach((ig) => {
      fs.unlinkSync(ig.path);
    });
    throw new Error(error.message);
  }
};


export const deleteFromCloudinary = async (imageCollection: string[]) => {
  try {
    const deleteImages = await Promise.all(
      imageCollection.map((img) => {
        const publicId = img.split("/").pop()?.split(".")[0];
        return cloudinary.uploader.destroy(publicId as string);
      })
    );
    return deleteImages;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
