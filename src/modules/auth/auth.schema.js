import { z } from 'zod';

export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const passwordMessage = 'Password must be at least 8 characters and contain at least 1 letter and 1 number';

export const loginSchema = {
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required')
  })
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().regex(passwordRegex, passwordMessage)
  })
};
