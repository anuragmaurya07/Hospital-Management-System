import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET || 'super_secret_hospital_jwt_key_2026_modern_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id
    },
    process.env.JWT_REFRESH_SECRET || 'super_secret_hospital_refresh_key_2026_secure',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'super_secret_hospital_jwt_key_2026_modern_secure'
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || 'super_secret_hospital_refresh_key_2026_secure'
  );
};
