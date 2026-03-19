import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const appointmentController = new AppointmentController();

router.post('/', authMiddleware, appointmentController.create.bind(appointmentController));
router.get('/my-appointments', authMiddleware, appointmentController.listUserAppointments.bind(appointmentController));
router.patch('/:id/cancel', authMiddleware, appointmentController.cancel.bind(appointmentController));

router.get('/', authMiddleware, adminMiddleware, appointmentController.listAll.bind(appointmentController));
router.patch('/:id/status', authMiddleware, adminMiddleware, appointmentController.updateStatus.bind(appointmentController));
router.delete('/:id', authMiddleware, adminMiddleware, appointmentController.delete.bind(appointmentController));

export default router;
