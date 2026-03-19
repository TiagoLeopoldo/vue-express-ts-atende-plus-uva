import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import { OpenWeatherService } from '../services/OpenWeatherService';

const weatherService = new OpenWeatherService();

export class AppointmentController {
  public async create(req: Request & { user?: { id: string } }, res: Response): Promise<void> {
    const { date, notes } = req.body;
    const patientId = req.user?.id;

    const appointmentDate = new Date(date);
    const now = new Date();

    if (appointmentDate < now) {
      res.status(400).json({ message: 'Não é possível agendar uma consulta para uma data enviada no passado.' });
      return;
    }

    // Block time conflict: no two appointments at exactly the same time.
    const conflict = await Appointment.findOne({ 
      date: appointmentDate, 
      status: 'scheduled' 
    });

    if (conflict) {
      res.status(409).json({ message: 'Horário indisponível. Por favor, escolha outro horário.' });
      return;
    }

    const weatherForecast = await weatherService.getWeatherForecast(appointmentDate);

    const appointment = await Appointment.create({
      patientId,
      date: appointmentDate,
      notes,
      weatherForecast,
    });

    res.status(201).json(appointment);
  }

  public async listUserAppointments(req: Request & { user?: { id: string } }, res: Response): Promise<void> {
    const patientId = req.user?.id;
    const appointments = await Appointment.find({ patientId }).sort({ date: 1 });
    res.json(appointments);
  }

  public async listAll(req: Request, res: Response): Promise<void> {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email cpf')
      .sort({ date: 1 });
    res.json(appointments);
  }

  public async cancel(req: Request & { user?: { id: string, role: string } }, res: Response): Promise<void> {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).json({ message: 'Consulta não encontrada' });
      return;
    }

    // Apenas admin ou o próprio paciente podem cancelar
    if (req.user?.role !== 'admin' && appointment.patientId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Acesso negado para cancelar esta consulta' });
      return;
    }

    if (appointment.status === 'canceled') {
      res.status(400).json({ message: 'Esta consulta já está cancelada.' });
      return;
    }

    if (appointment.status === 'completed') {
      res.status(400).json({ message: 'Não é possível cancelar uma consulta já concluída.' });
      return;
    }

    appointment.status = 'canceled';
    await appointment.save();

    res.json(appointment);
  }

  public async updateStatus(req: Request & { user?: { id: string, role: string } }, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Acesso negado para alterar status livremente' });
      return;
    }

    if (!['scheduled', 'confirmed', 'canceled', 'completed'].includes(status)) {
      res.status(400).json({ message: 'Status inválido' });
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!appointment) {
      res.status(404).json({ message: 'Consulta não encontrada' });
      return;
    }

    res.json(appointment);
  }

  public async delete(req: Request & { user?: { id: string, role: string } }, res: Response): Promise<void> {
    const { id } = req.params;

    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Acesso negado: Apenas administradores podem excluir registros.' });
      return;
    }

    const appointment = await Appointment.findByIdAndDelete(id);
    
    if (!appointment) {
      res.status(404).json({ message: 'Consulta não encontrada' });
      return;
    }

    res.json({ message: 'Consulta removida com sucesso' });
  }
}
