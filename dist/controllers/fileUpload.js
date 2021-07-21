"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFile = exports.UploadFile = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("cloudinary");
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});
const UploadFile = async (file) => {
    try {
        const { public_id, url } = await cloudinary_1.v2.uploader.upload(file, {
            resource_type: 'auto',
            folder: 'upbase',
        });
        return { public_id, url };
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
exports.UploadFile = UploadFile;
const DeleteFile = async (pictureId) => {
    try {
        await cloudinary_1.v2.uploader.destroy(pictureId);
        return;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
exports.DeleteFile = DeleteFile;
