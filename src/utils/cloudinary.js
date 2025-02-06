import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
// Upload file
export const uploadFiles = async (files, folder = "generals") => {
  let fileData = [];
  for (const file of files) {
    const data = await cloudinary.uploader.upload(file.path, {
      use_filename: true,
      folder: folder,
    });
    fileData.push({ url: data.url, public_id: data.public_id });
  }
  return fileData;
};
// Delete file
export const deleteFiles = async (fileData) => {
    for (const file of fileData) {
        await cloudinary.uploader.destroy(file.public_id)
    }
}
