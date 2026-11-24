import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/tokenUtils.js';
import User from '../models/User.model.js';
import Doctor from '../models/Doctor.model.js';
import Patient from '../models/Patient.model.js';
import { ROLES } from '../constants/roles.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const assignedRole = role && Object.values(ROLES).includes(role) ? role : ROLES.PATIENT;

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole,
    phone: phone || ''
  });

  // If registering as a patient, auto-create a Patient profile if none exists
  if (assignedRole === ROLES.PATIENT) {
    const count = await Patient.countDocuments();
    const patientId = `PAT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    await Patient.create({
      patientId,
      user: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      dob: new Date('1990-01-01'),
      gender: 'Other'
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  const userResponse = await User.findById(user._id).select('-password');

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: userResponse, accessToken, refreshToken },
      'Registration successful'
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is inactive. Please contact system administrator.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  let profileData = null;
  if (user.role === ROLES.DOCTOR) {
    profileData = await Doctor.findOne({ user: user._id }).populate('department');
  } else if (user.role === ROLES.PATIENT) {
    profileData = await Patient.findOne({ user: user._id });
  }

  const userResponse = await User.findById(user._id).select('-password');

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userResponse,
        profile: profileData,
        accessToken,
        refreshToken
      },
      'Login successful'
    )
  );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token missing');
  }

  try {
    const decoded = verifyRefreshToken(incomingRefreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token. User not found.');
    }

    const tokenExists = user.refreshTokens.some(
      (t) => t.token === incomingRefreshToken
    );

    if (!tokenExists) {
      throw new ApiError(401, 'Refresh token expired or revoked');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== incomingRefreshToken
    );
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken, refreshToken: newRefreshToken },
        'Token refreshed successfully'
      )
    );
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token && req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: { token } }
    });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  let profileData = null;
  if (req.user.role === ROLES.DOCTOR) {
    profileData = await Doctor.findOne({ user: req.user._id }).populate('department');
  } else if (req.user.role === ROLES.PATIENT) {
    profileData = await Patient.findOne({ user: req.user._id });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
        profile: profileData
      },
      'User profile fetched successfully'
    )
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  // If patient or doctor, sync name & phone
  if (user.role === ROLES.PATIENT) {
    await Patient.findOneAndUpdate(
      { user: user._id },
      { name: user.name, phone: user.phone }
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Profile updated successfully'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Both current and new passwords are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new ApiError(400, 'Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Password changed successfully'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Email address is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        'If an account exists with this email, password reset instructions have been generated.'
      )
    );
  }

  // Simulated secure reset token for demonstration
  const resetToken = 'reset_' + Math.random().toString(36).substring(2, 15);
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 mins
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { resetToken },
      'Reset token generated. In a production environment, this is emailed securely.'
    )
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    throw new ApiError(400, 'Reset token and new password are required');
  }

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Password has been successfully reset. You may now log in.'));
});
