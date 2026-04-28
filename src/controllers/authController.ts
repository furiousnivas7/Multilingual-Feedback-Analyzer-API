import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterSchema, LoginSchema } from '../validators/authValidator';
import { env } from '../config/env';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { prisma } from '../lib/prisma';

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = RegisterSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });
  console.log('[register] -> User created:', user.id);

  res.status(201).json({ success: true, data: { id: user.id, email: user.email, name: user.name } });
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = LoginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { sub: user.id },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
  console.log('[login] -> User authenticated:', user.id);

  res.json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name } } });
});
