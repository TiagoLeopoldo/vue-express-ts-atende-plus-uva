import { Router } from 'express';
import { IntegrationController } from '../controllers/IntegrationController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const integrationController = new IntegrationController();

router.get('/cep/:cep', authMiddleware, integrationController.getCep.bind(integrationController));

export default router;
