import { Request, Response } from 'express';
import { ViaCepService } from '../services/ViaCepService';

const viaCepService = new ViaCepService();

export class IntegrationController {
  public async getCep(req: Request, res: Response): Promise<void> {
    try {
      const { cep } = req.params;
      const data = await viaCepService.getAddressByCep(cep);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
