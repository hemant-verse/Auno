import mongoose from "mongoose";

const Userschema = new mongoose.Schema({
    UserName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    Password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        index: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true
  }
);

const User = mongoose.models.User || mongoose.model("User", Userschema);
export default User;