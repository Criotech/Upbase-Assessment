import dotEnv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
dotEnv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const UploadFile = async (file: string) => {
  try {
    const { public_id, url } = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
      folder: 'upbase',
    });

    return { public_id, url };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const DeleteFile = async (pictureId: string) => {
  try {
    await cloudinary.uploader.destroy(pictureId);
    return;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export {
  UploadFile,
  DeleteFile
}