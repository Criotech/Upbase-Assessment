import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from './multerSetup';
import { UploadFile, DeleteFile } from './fileUpload';
import { RequestHandler } from 'express';
import UserModel from '../models/user.model';
import { User, FetchQuery } from '../types/user';
import { ErrResponse, SucResponse } from '../global/functions';


type CreateUserPayload = Omit<User, 'emailVerified' | 'phoneNumber'>;

const createUser: RequestHandler<{}, {}, CreateUserPayload> = async (
  req,
  res,
  next
) => {
  let { firstName, lastName, password, email, username } = req.body;
  const schema: Joi.ObjectSchema<User> = Joi.object({
    username: Joi.string().required(),
    lastName: Joi.string().required(),
    firstName: Joi.string().required(),
    password: Joi.string().min(6).required(),
    email: Joi.string()
      .pattern(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
      .required(),
  });

  const { error } = schema.validate(req.body);
  console.log({ error });
  if (error) {
    return ErrResponse(res, error.details[0].message, 400);
  }

  try {
    email = email.toLowerCase();
    const check =
      (await UserModel.findOne({ email })) ||
      (await UserModel.findOne({ username }));
    if (check) {
      return ErrResponse(res, `Email or username exists already`, 400);
    }

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password!, salt);

    const user = await UserModel.create({
      email,
      username,
      lastName,
      firstName,
      password: hashed,
    });

    if (user) {
      const jwtToken: string = process.env.JWT_SECRET!;
      console.log(jwtToken)

      const token = jwt.sign({ userId: user._id }, jwtToken);

      let data = user.toObject();
      delete data.password;

      return SucResponse(res, `Sign up successful`, { ...data, token }, 200);
    } else {
      return ErrResponse(res, 'Could not create user', 400);
    }
  } catch (error) {
    console.log(error);
    return ErrResponse(res, error, 500);
  }
};

type LoginDetails = Pick<User, 'email' | 'password'>;
// params, resbody, reqbody, query
const login: RequestHandler<{}, {}, LoginDetails> = async (req, res) => {
  const schema: Joi.ObjectSchema<LoginDetails> = Joi.object({
    password: Joi.string().min(6).required(),
    email: Joi.string()
      .pattern(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
      .required(),
  });

  const { error } = schema.validate(req.body);
  console.log({ error });
  if (error) {
    return ErrResponse(res, error.details[0].message, 400);
  }

  try {
    let { email, password } = req.body;
    email = email.toLowerCase();
    const user =
      (await UserModel.findOne({ email })) ||
      (await UserModel.findOne({ username: email }));
    if (user) {
      const check = await bcrypt.compare(password!, user.password!);
      if (check) {
        const jwtToken: string = process.env.JWT_SECRET!;
        console.log(jwtToken)

        const token = jwt.sign({ userId: user._id }, jwtToken);

        let data = user.toObject();
        delete data.password;

        return SucResponse(res, `Login successful`, { ...data, token }, 200);
      } else {
        return ErrResponse(res, 'Incorrect username or password', 400);
      }
    } else {
      return ErrResponse(res, 'Invalid username or password', 400);
    }
  } catch (error) {
    console.log(error);
    return ErrResponse(res, error, 500);
  }
};

const fetchUsers: RequestHandler<{}, {}, {}, FetchQuery> = async (req, res) => {
  console.log(req.user)
  const { page, limit } = req.query;
  console.log(req.query)
  try {
    let pg = page ? parseInt(page) : 1;
    let lmt = limit ? parseInt(limit) : 50;
    const users = await UserModel.find({})
      .skip((pg - 1) * lmt)
      .limit(lmt);

    if (users) {
      return SucResponse(res, 'Users fetched successfully', users);
    } else {
      return ErrResponse(res, 'Could not fetch users', 400);
    }
  } catch (error) {
    console.log(error);
    return ErrResponse(res, 'Something went wrong', 500);
  }
};

const fetchAuthUser: RequestHandler = async (req, res) => {
  console.log(req.user)
  // const { userId } = req.user;
  try {
    const user = req.user!;

    return SucResponse(res, 'User fetched successfully', user);
  } catch (error) {
    console.log(error);
    return ErrResponse(res, 'Something went wrong', 500);
  }
};

type UpdatePasswordPayload = {
  newPassword: string;
  currentPassword: string;
};

const updateUserPassword: RequestHandler<
  {},
  {},
  UpdatePasswordPayload
> = async (req, res) => {
  try {
    if (!req.user) {
      return ErrResponse(res, 'Unauthorized', 403);
    }

    const schema = Joi.object<UpdatePasswordPayload>({
      newPassword: Joi.string().required(),
      currentPassword: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    console.log({ error });
    if (error) {
      return ErrResponse(res, error.details[0].message, 400);
    }

    const { _id } = req.user;
    const user = await UserModel.findById(_id);
    if (user) {
      const { newPassword, currentPassword } = req.body;
      const check = await bcrypt.compare(currentPassword, user.password!);
      if (check) {
        const salt = await bcrypt.genSalt(8);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        const data = user.toObject();
        delete data.password;

        return SucResponse(res, 'Employee password updated successfully', data);
      } else {
        return ErrResponse(res, 'Current password does not match', 400);
      }
    } else {
      return ErrResponse(res, 'Invalid user id', 400);
    }
  } catch (error) {
    console.log(error);
    return ErrResponse(res, error, 500);
  }
};

type UpdateUserPayload = Pick<User, 'firstName' | 'lastName' | 'phoneNumber'>;

const updateUserInfo: RequestHandler<{}, {}> = async (req, res) => {
  multer.single('profilePicture')(req, res, async (err: any) => {
    if (err) {
      return ErrResponse(res, err, 400);
    }

    if (!req.user) {
      return ErrResponse(res, 'Unauthorized', 403);
    }

    let url: string | undefined;
    let picturePublicId: string | undefined;

    if (req.file && req.file.path) {
      if (req.user && req.user.picturePublicId) {
        await DeleteFile(req.user.picturePublicId)
      }
      const upload = await UploadFile(req.file.path)!;
      console.log(upload)
      if (upload) {
        url = upload.url;
        picturePublicId = upload.public_id;
      }
    }
    try {
      const schema = Joi.object<UpdateUserPayload>({
        lastName: Joi.string().allow(''),
        firstName: Joi.string().allow(''),
        phoneNumber: Joi.string().allow(''),
      });

      const { error } = schema.validate(req.body);
      console.log({ error });
      if (error) {
        return ErrResponse(res, error.details[0].message, 400);
      }

      const { _id } = req.user;
      const user = await UserModel.findById(_id);
      if (!user) {
        return ErrResponse(res, 'Invalid user id', 400);
      }

      let extra = {
        ...(url && { profilePicture: url, picturePublicId }),
      };

      const updatedUser = await UserModel.findByIdAndUpdate(
        _id,
        { ...req.body, ...extra },
        { new: true }
      ).select('-password');
      if (!updatedUser) {
        return ErrResponse(res, 'Could not update user data', 400);
      }

      return SucResponse(res, 'User data updated successfully', updatedUser);
    } catch (error) {
      console.log(error);
      return ErrResponse(res, error, 500);
    }
  });
};

const deleteAccount: RequestHandler<{}, {}> = async (req, res) => {
  if (!req.user) {
    return ErrResponse(res, 'Unauthorized', 403);
  }

  if (req.user && req.user.picturePublicId) {
    await DeleteFile(req.user.picturePublicId)
  }

  try {
    const { _id } = req.user;

    const deletedUser = await UserModel.findOneAndDelete({_id})
    if (!deletedUser) {
      return ErrResponse(res, 'Could not delete user account', 400);
    }

    return SucResponse(res, 'User account deleted successfully', deletedUser);
  } catch (error) {
    console.log(error);
    return ErrResponse(res, error, 500);
  }
};

const lolPop:RequestHandler = async (req, res) => {
  return SucResponse(res, 'User account deleted successfully', null);
}
export default {
  login,
  createUser,
  fetchUsers,
  fetchAuthUser,
  updateUserInfo,
  updateUserPassword,
  deleteAccount,
  lolPop
};