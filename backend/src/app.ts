import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

class App {
  public express: Application;

  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
    this.errors();
  }

  private middlewares(): void {
    this.express.use(express.json());
    this.express.use(cors());
  }

  private routes(): void {
    // Rota inicial para health check
    this.express.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'OK', message: 'API rodando' });
    });
    
    this.express.use('/api', routes);
  }

  private errors(): void {
    this.express.use(errorHandler);
  }
}

export default new App().express;
