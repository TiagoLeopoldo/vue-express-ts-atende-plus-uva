import { Router } from 'express';
import authRoutes from './auth.routes';
import appointmentRoutes from './appointment.routes';
import integrationRoutes from './integration.routes';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/appointments', appointmentRoutes);
routes.use('/integrations', integrationRoutes);

export default routes;
