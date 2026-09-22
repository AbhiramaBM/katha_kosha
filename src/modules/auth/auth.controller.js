import * as authService from './auth.service.js';
import { successResponse } from '../../utils/response.js';

export async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    return successResponse(res, result, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const result = await authService.rotateRefreshToken(req.body.refreshToken);
    return successResponse(res, result, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.revokeToken(refreshToken);
    }
    return successResponse(res, { message: 'Logged out successfully' }, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    return successResponse(res, req.user, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    await authService.changeUserPassword(req.user.id, req.body);
    return successResponse(res, { message: 'Password changed successfully' }, null, 200);
  } catch (error) {
    next(error);
  }
}
