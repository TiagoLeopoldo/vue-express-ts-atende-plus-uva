import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  date: Date;
  status: 'scheduled' | 'confirmed' | 'canceled' | 'completed';
  notes?: string;
  weatherForecast?: string;
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['scheduled', 'confirmed', 'canceled', 'completed'], default: 'scheduled' },
    notes: { type: String },
    weatherForecast: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
