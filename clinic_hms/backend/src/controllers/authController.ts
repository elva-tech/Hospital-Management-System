import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import generateToken from '../utils/generateToken';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req: Request, res: Response): Promise<void> => {
  const phone = req.body.phone?.toString().trim();
  const password = req.body.password?.toString();

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        console.log(`Login SUCCESS: ${phone}`);
        res.json({
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          token: generateToken(user.id, user.role),
        });
        return;
      } else {
        console.warn(`Login FAILED (Wrong Password): ${phone}`);
      }
    } else {
      console.warn(`Login FAILED (User Not Found): ${phone}`);
    }

    res.status(401).json({ message: 'Invalid phone number or password' });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
