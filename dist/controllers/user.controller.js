"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multerSetup_1 = __importDefault(require("./multerSetup"));
const fileUpload_1 = require("./fileUpload");
const user_model_1 = __importDefault(require("../models/user.model"));
const functions_1 = require("../global/functions");
const createUser = async (req, res, next) => {
    let { firstName, lastName, password, email, username } = req.body;
    const schema = joi_1.default.object({
        username: joi_1.default.string().required(),
        lastName: joi_1.default.string().required(),
        firstName: joi_1.default.string().required(),
        password: joi_1.default.string().min(6).required(),
        email: joi_1.default.string()
            .pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            .required(),
    });
    const { error } = schema.validate(req.body);
    console.log({ error });
    if (error) {
        return functions_1.ErrResponse(res, error.details[0].message, 400);
    }
    try {
        email = email.toLowerCase();
        const check = (await user_model_1.default.findOne({ email })) ||
            (await user_model_1.default.findOne({ username }));
        if (check) {
            return functions_1.ErrResponse(res, `Email or username exists already`, 400);
        }
        const salt = await bcryptjs_1.default.genSalt();
        const hashed = await bcryptjs_1.default.hash(password, salt);
        const user = await user_model_1.default.create({
            email,
            username,
            lastName,
            firstName,
            password: hashed,
        });
        if (user) {
            const jwtToken = process.env.JWT_SECRET;
            console.log(jwtToken);
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, jwtToken);
            let data = user.toObject();
            delete data.password;
            return functions_1.SucResponse(res, `Sign up successful`, { ...data, token }, 200);
        }
        else {
            return functions_1.ErrResponse(res, 'Could not create user', 400);
        }
    }
    catch (error) {
        console.log(error);
        return functions_1.ErrResponse(res, error, 500);
    }
};
// params, resbody, reqbody, query
const login = async (req, res) => {
    const schema = joi_1.default.object({
        password: joi_1.default.string().min(6).required(),
        email: joi_1.default.string()
            .pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            .required(),
    });
    const { error } = schema.validate(req.body);
    console.log({ error });
    if (error) {
        return functions_1.ErrResponse(res, error.details[0].message, 400);
    }
    try {
        let { email, password } = req.body;
        email = email.toLowerCase();
        const user = (await user_model_1.default.findOne({ email })) ||
            (await user_model_1.default.findOne({ username: email }));
        if (user) {
            const check = await bcryptjs_1.default.compare(password, user.password);
            if (check) {
                const jwtToken = process.env.JWT_SECRET;
                console.log(jwtToken);
                const token = jsonwebtoken_1.default.sign({ userId: user._id }, jwtToken);
                let data = user.toObject();
                delete data.password;
                return functions_1.SucResponse(res, `Login successful`, { ...data, token }, 200);
            }
            else {
                return functions_1.ErrResponse(res, 'Incorrect username or password', 400);
            }
        }
        else {
            return functions_1.ErrResponse(res, 'Invalid username or password', 400);
        }
    }
    catch (error) {
        console.log(error);
        return functions_1.ErrResponse(res, error, 500);
    }
};
const fetchUsers = async (req, res) => {
    console.log(req.user);
    const { page, limit } = req.query;
    console.log(req.query);
    try {
        let pg = page ? parseInt(page) : 1;
        let lmt = limit ? parseInt(limit) : 50;
        const users = await user_model_1.default.find({})
            .skip((pg - 1) * lmt)
            .limit(lmt);
        if (users) {
            return functions_1.SucResponse(res, 'Users fetched successfully', users);
        }
        else {
            return functions_1.ErrResponse(res, 'Could not fetch users', 400);
        }
    }
    catch (error) {
        console.log(error);
        return functions_1.ErrResponse(res, 'Something went wrong', 500);
    }
};
const fetchAuthUser = async (req, res) => {
    console.log(req.user);
    // const { userId } = req.user;
    try {
        const user = req.user;
        return functions_1.SucResponse(res, 'User fetched successfully', user);
    }
    catch (error) {
        console.log(error);
        return functions_1.ErrResponse(res, 'Something went wrong', 500);
    }
};
const updateUserPassword = async (req, res) => {
    try {
        if (!req.user) {
            return functions_1.ErrResponse(res, 'Unauthorized', 403);
        }
        const schema = joi_1.default.object({
            newPassword: joi_1.default.string().required(),
            currentPassword: joi_1.default.string().required(),
        });
        const { error } = schema.validate(req.body);
        console.log({ error });
        if (error) {
            return functions_1.ErrResponse(res, error.details[0].message, 400);
        }
        const { _id } = req.user;
        const user = await user_model_1.default.findById(_id);
        if (user) {
            const { newPassword, currentPassword } = req.body;
            const check = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (check) {
                const salt = await bcryptjs_1.default.genSalt(8);
                user.password = await bcryptjs_1.default.hash(newPassword, salt);
                await user.save();
                const data = user.toObject();
                delete data.password;
                return functions_1.SucResponse(res, 'Employee password updated successfully', data);
            }
            else {
                return functions_1.ErrResponse(res, 'Current password does not match', 400);
            }
        }
        else {
            return functions_1.ErrResponse(res, 'Invalid user id', 400);
        }
    }
    catch (error) {
        console.log(error);
        return functions_1.ErrResponse(res, error, 500);
    }
};
const updateUserInfo = async (req, res) => {
    multerSetup_1.default.single('profilePicture')(req, res, async (err) => {
        if (err) {
            return functions_1.ErrResponse(res, err, 400);
        }
        if (!req.user) {
            return functions_1.ErrResponse(res, 'Unauthorized', 403);
        }
        let url;
        let picturePublicId;
        if (req.file && req.file.path) {
            if (req.user && req.user.picturePublicId) {
                await fileUpload_1.DeleteFile(req.user.picturePublicId);
            }
            const upload = await fileUpload_1.UploadFile(req.file.path);
            console.log(upload);
            if (upload) {
                url = upload.url;
                picturePublicId = upload.public_id;
            }
        }
        try {
            const schema = joi_1.default.object({
                lastName: joi_1.default.string().allow(''),
                firstName: joi_1.default.string().allow(''),
                phoneNumber: joi_1.default.string().allow(''),
            });
            const { error } = schema.validate(req.body);
            console.log({ error });
            if (error) {
                return functions_1.ErrResponse(res, error.details[0].message, 400);
            }
            const { _id } = req.user;
            const user = await user_model_1.default.findById(_id);
            if (!user) {
                return functions_1.ErrResponse(res, 'Invalid user id', 400);
            }
            let extra = {
                ...(url && { profilePicture: url, picturePublicId }),
            };
            const updatedUser = await user_model_1.default.findByIdAndUpdate(_id, { ...req.body, ...extra }, { new: true }).select('-password');
            if (!updatedUser) {
                return functions_1.ErrResponse(res, 'Could not update user data', 400);
            }
            return functions_1.SucResponse(res, 'User data updated successfully', updatedUser);
        }
        catch (error) {
            console.log(error);
            return functions_1.ErrResponse(res, error, 500);
        }
    });
};
const deleteAccount = async (req, res) => {
    if (!req.user) {
        return functions_1.ErrResponse(res, 'Unauthorized', 403);
    }
    if (req.user && req.user.picturePublicId) {
        await fileUpload_1.DeleteFile(req.user.picturePublicId);
    }
    try {
        const { _id } = req.user;
        const deletedUser = await user_model_1.default.findOneAndDelete({ _id });
        if (!deletedUser) {
            return functions_1.ErrResponse(res, 'Could not delete user account', 400);
        }
        return functions_1.SucResponse(res, 'User account deleted successfully', deletedUser);
    }
    catch (error) {
        console.log(error);
        return functions_1.ErrResponse(res, error, 500);
    }
};
const lolPop = async (req, res) => {
    return functions_1.SucResponse(res, 'User account deleted successfully', null);
};
exports.default = {
    login,
    createUser,
    fetchUsers,
    fetchAuthUser,
    updateUserInfo,
    updateUserPassword,
    deleteAccount,
    lolPop
};
