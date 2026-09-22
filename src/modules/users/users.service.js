import bcrypt from 'bcryptjs';
import { db } from '../../config/database.js';
import { AppError } from '../../utils/response.js';
import { getPagination, buildMeta } from '../../utils/pagination.js';

const BCRYPT_ROUNDS = 12;

export async function createUser({ name, email, password, role }) {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await db('users').where({ email: normalizedEmail }).first();
  if (existing) {
    throw new AppError('DUPLICATE_EMAIL', 'A user with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const [id] = await db('users').insert({
    name,
    email: normalizedEmail,
    password_hash: passwordHash,
    role: role || 'editor',
    is_active: 1
  });

  const user = await db('users').select('id', 'name', 'email', 'role', 'is_active', 'created_at', 'updated_at')
    .where({ id }).first();

  return user;
}

export async function listUsers(query) {
  const { page, limit, offset } = getPagination(query);

  const totalResult = await db('users').count('* as count').first();
  const total = parseInt(totalResult.count, 10);

  const users = await db('users')
    .select('id', 'name', 'email', 'role', 'is_active', 'last_login_at', 'created_at', 'updated_at')
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    users,
    meta: buildMeta(page, limit, total)
  };
}

export async function updateUser(userId, data) {
  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  const updatePayload = {
    updated_at: db.fn.now()
  };

  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.role !== undefined) updatePayload.role = data.role;
  if (data.is_active !== undefined) {
    updatePayload.is_active = data.is_active ? 1 : 0;
    // If disabling user, revoke all their refresh tokens
    if (!data.is_active) {
      await db('refresh_tokens').where({ user_id: userId }).update({
        revoked_at: db.fn.now()
      });
    }
  }

  await db('users').where({ id: userId }).update(updatePayload);

  const updatedUser = await db('users')
    .select('id', 'name', 'email', 'role', 'is_active', 'last_login_at', 'created_at', 'updated_at')
    .where({ id: userId }).first();

  return updatedUser;
}

export async function resetUserPassword(userId, newPassword) {
  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await db('users').where({ id: userId }).update({
    password_hash: passwordHash,
    updated_at: db.fn.now()
  });

  // Revoke all existing refresh tokens
  await db('refresh_tokens').where({ user_id: userId }).update({
    revoked_at: db.fn.now()
  });
}
