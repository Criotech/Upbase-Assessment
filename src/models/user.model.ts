import { Schema, Document, model } from 'mongoose';
import { User } from '../types/user';

export interface IUser extends Document, User { }

const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const UserSchema: Schema = new Schema({
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: 'First name is required',
  },
  lastName: {
    type: String,
    required: 'Last name is required',
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: 'Email is required',
    unique: 'Email is unique',
    match: regex,
  },
  phoneNumber: {
    type: String,
    // required: true,
  },
  profilePicture: {
    type: String,
  },
  picturePublicId: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

export default model<IUser>('User', UserSchema);