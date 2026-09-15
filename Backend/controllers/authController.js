import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {deleteImageFromCloudinary, uploadImageBufferToCloudinary} from '../utils/cloudinaryUpload.js';

// Generate JWT token
const generateToken=(id)=>{
  return jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRE || "7d",
  });
};

/*
* @desc Resgister new user
* @route POST/api/auth/register
* @access Public
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }]
    });

    if (userExists) {
      const errorMessage = userExists.email === email 
        ? "User already registered" 
        : "Username already taken";

      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }

  
    const user = await User.create({ username, email, password });

    
    const token = generateToken(user._id);

    
    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt
        },
        token
      },
      message: "User successfully registered"
    });
  } catch (error) {
    next(error);
  }
};


/*
* @desc Login user
* @route POST/api/auth/login
* @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
        statusCode: 400
      });
    }

    // Check for user and explicitly include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401
      });
    }

    // Compare passwords
    const isMatch = await user.matchPassword(password);

    // If password does NOT match, return 401
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send successful response
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage
        },
        token
      },
      message: "Login successful"
    });
  } catch (error) {
    next(error);
  }
};


/*
* @desc Get user profile
* @route GET/api/auth/profile
* @access Public
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id || req.userId);

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};


/*
* @desc Upadte user profile
* @route PUT/api/auth/profile
* @access Private
 */
export const updateProfile = async (req, res, next) => {
  let uploadedImagePublicId;
  try {
    const { username, email } = req.body;

    if (username !== undefined || email !== undefined) {
      return res.status(400).json({
        success: false,
        error: 'Username and email cannot be changed',
        statusCode: 400
      });
    }

    const user = await User.findById(req.user.id || req.userId);

    if (username) user.username = username;
    if (email) user.email = email;
    if (req.file) {
      const uploadResult = await uploadImageBufferToCloudinary(
        req.file.buffer,
        `devq/${user._id}/profile`,
        'avatar'
      );
      uploadedImagePublicId = uploadResult.public_id;
      const previousImagePublicId = user.profileImagePublicId;
      user.profileImage = uploadResult.secure_url;
      user.profileImagePublicId = uploadResult.public_id;
      if (previousImagePublicId) {
        await deleteImageFromCloudinary(previousImagePublicId).catch(() => {});
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        profileImagePublicId: user.profileImagePublicId
      },
      message: "Profile updated successfully"
    });
  } catch (error) {
    if (uploadedImagePublicId) {
      await deleteImageFromCloudinary(uploadedImagePublicId).catch(() => {});
    }
    next(error);
  }
};

/*
* @desc Change Password
* @route POST/api/auth/change-password
* @access Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Please provide current and new password",
        statusCode: 400
      });
    }

    // Find user and explicitly select password field
    const user = await User.findById(req.user?.id || req.userId).select('+password');

    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
        statusCode: 401
      });
    }

    
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    next(error);
  }
};


