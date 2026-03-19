import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    const { name, email, password, role, cpf } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { cpf }] });
    if (userExists) {
      res.status(400).json({ message: 'Usuário já existe. Verifique email ou CPF.' });
      return;
    }

    const user = await User.create({ name, email, password, role, cpf });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, cpf: user.cpf },
      token,
    });
  }

  public async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Credenciais inválidas' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Credenciais inválidas' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  }

  public async getProfile(req: Request & { user?: { id: string } }, res: Response): Promise<void> {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    res.json(user);
  }
}
