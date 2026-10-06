import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database.js';
import { AppError } from '../../utils/response.js';
import dotenv from 'dotenv';
dotenv.config();

const BCRYPT_ROUNDS = 12;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function loginUser({ email, password }) {
  const user = await db('users').where({ email: email.toLowerCase().trim() }).first();
  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw new AppError('USER_INACTIVE', 'User account is disabled', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );

  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawRefreshToken);
  const expiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10);
  const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

  await db('refresh_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt
  });

  // Update last_login_at
  await db('users').where({ id: user.id }).update({
    last_login_at: db.fn.now()
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function rotateRefreshToken(rawRefreshToken) {
  const tokenHash = hashToken(rawRefreshToken);
  const tokenRecord = await db('refresh_tokens').where({ token_hash: tokenHash }).first();

  if (!tokenRecord) {
    throw new AppError('INVALID_TOKEN', 'Invalid refresh token', 401);
  }

  // Reuse detection: if already revoked, allow 30s grace period for concurrent requests
  if (tokenRecord.revoked_at) {
    const revokedTime = new Date(tokenRecord.revoked_at).getTime();
    if (Date.now() - revokedTime < 30000) {
      const user = await db('users').where({ id: tokenRecord.user_id }).first();
      if (user && user.is_active) {
        const accessToken = jwt.sign(
          { sub: user.id, email: user.email, role: user.role, name: user.name },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
        );
        return {
          accessToken,
          refreshToken: rawRefreshToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        };
      }
    }

    // Revoke all tokens for this user as a security precaution
    await db('refresh_tokens').where({ user_id: tokenRecord.user_id }).update({
      revoked_at: db.fn.now()
    });
    throw new AppError('TOKEN_REVOKED', 'Refresh token has already been revoked. Please log in again.', 401);
  }

  // Expiration check
  if (new Date(tokenRecord.expires_at) < new Date()) {
    throw new AppError('TOKEN_EXPIRED', 'Refresh token has expired. Please log in again.', 401);
  }

  // Check user active status
  const user = await db('users').where({ id: tokenRecord.user_id }).first();
  if (!user || !user.is_active) {
    throw new AppError('USER_INACTIVE', 'User account is inactive', 401);
  }

  // Revoke old token
  await db('refresh_tokens').where({ id: tokenRecord.id }).update({
    revoked_at: db.fn.now()
  });

  // Issue new pair
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );

  const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
  const newTokenHash = hashToken(newRawRefreshToken);
  const expiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10);
  const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

  await db('refresh_tokens').insert({
    user_id: user.id,
    token_hash: newTokenHash,
    expires_at: expiresAt
  });

  return {
    accessToken,
    refreshToken: newRawRefreshToken
  };
}

export async function revokeToken(rawRefreshToken) {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await db('refresh_tokens').where({ token_hash: tokenHash }).update({
    revoked_at: db.fn.now()
  });
}

export async function changeUserPassword(userId, { currentPassword, newPassword }) {
  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new AppError('INVALID_CREDENTIALS', 'Current password is incorrect', 400);
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await db('users').where({ id: userId }).update({
    password_hash: newHash,
    updated_at: db.fn.now()
  });

  // Revoke all existing refresh tokens for this user
  await db('refresh_tokens').where({ user_id: userId }).update({
    revoked_at: db.fn.now()
  });
}
