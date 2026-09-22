import * as usersService from './users.service.js';
import { successResponse } from '../../utils/response.js';

export async function createUser(req, res, next) {
  try {
    const user = await usersService.createUser(req.body);
    return successResponse(res, user, null, 201);
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { users, meta } = await usersService.listUsers(req.query);
    return successResponse(res, users, meta, 200);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await usersService.updateUser(req.params.id, req.body);
    return successResponse(res, user, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    await usersService.resetUserPassword(req.params.id, req.body.password);
    return successResponse(res, { message: 'Password reset successfully' }, null, 200);
  } catch (error) {
    next(error);
  }
}
