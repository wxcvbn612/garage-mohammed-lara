import { useKV } from '../hooks/useKV';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User,
  Phone,
  Car
} from '@phosphor-icons/react';
import { useState } from 'react';

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  vehicleModel: string;
  plateNumber: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'diagnostic' | 'repair' | 'maintenance' | 'consultation';
  mechanic: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

const AppointmentCalendar = () => {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', []);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(apt => apt.date === date);
  };

  const getAppointmentAtTime = (date: string, time: string) => {
    return appointments.find(apt => apt.date === date && apt.time === time);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diagnostic': return 'bg-blue-100 text-blue-800';
      case 'repair': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-green-100 text-green-800';
      case 'consultation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: string) => {
    setAppointments(current =>
      current.map(apt =>
        apt.id === appointmentId
          ? { ...apt, status: newStatus as Appointment['status'] }
          : apt
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Planning des Rendez-vous</h2>
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: 'day' | 'week') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Jour</SelectItem>
              <SelectItem value="week">Semaine</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nouveau RDV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Programmer un rendez-vous</DialogTitle>
              </DialogHeader>
              <AddAppointmentForm onAdd={(appointment) => {
                setAppointments(current => [...current, appointment]);
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Date Navigator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const prevDate = new Date(selectedDate);
                prevDate.setDate(prevDate.getDate() - 1);
                setSelectedDate(prevDate.toISOString().split('T')[0]);
              }}
            >
              ← Précédent
            </Button>
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              >
                Aujourd'hui
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + 1);
                setSelectedDate(nextDate.toISOString().split('T')[0]);
              }}
            >
              Suivant →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {viewMode === 'day' ? (
        <DayView
          date={selectedDate}
          appointments={getAppointmentsForDate(selectedDate)}
          timeSlots={timeSlots}
          onStatusUpdate={updateAppointmentStatus}
        />
      ) : (
        <WeekView
          startDate={selectedDate}
          appointments={appointments}
          onStatusUpdate={updateAppointmentStatus}
        />
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getAppointmentsForDate(selectedDate).length}
              </div>
              <div className="text-sm text-muted-foreground">Total RDV</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getAppointmentsForDate(selectedDate).filter(apt => apt.status === 'confirmed').length}
              </div>
              <div className="text-sm text-muted-foreground">Confirmés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {getAppointmentsForDate(selectedDate).filter(apt => apt.status === 'scheduled').length}
              </div>
              <div className="text-sm text-muted-foreground">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {getAppointmentsForDate(selectedDate).filter(apt => apt.status === 'cancelled').length}
              </div>
              <div className="text-sm text-muted-foreground">Annulés</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DayView = ({ 
  date, 
  appointments, 
  timeSlots, 
  onStatusUpdate 
}: { 
  date: string;
  appointments: Appointment[];
  timeSlots: string[];
  onStatusUpdate: (id: string, status: string) => void;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {new Date(date).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {timeSlots.map((time) => {
            const appointment = appointments.find(apt => apt.time === time);
            return (
              <div key={time} className="flex items-center border-b pb-2">
                <div className="w-20 text-sm font-medium text-muted-foreground">
                  {time}
                </div>
                <div className="flex-1">
                  {appointment ? (
                    <AppointmentCard 
                      appointment={appointment} 
                      onStatusUpdate={onStatusUpdate}
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm">Libre</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const WeekView = ({ 
  startDate, 
  appointments, 
  onStatusUpdate 
}: { 
  startDate: string;
  appointments: Appointment[];
  onStatusUpdate: (id: string, status: string) => void;
}) => {
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() - date.getDay() + i);
    return date.toISOString().split('T')[0];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vue semaine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date) => {
            const dayAppointments = appointments.filter(apt => apt.date === date);
            const dayName = new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' });
            const dayNumber = new Date(date).getDate();
            
            return (
              <div key={date} className="border rounded-lg p-3">
                <div className="text-center mb-3">
                  <div className="text-xs text-muted-foreground uppercase">{dayName}</div>
                  <div className="text-lg font-semibold">{dayNumber}</div>
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="text-xs p-1 bg-primary/10 rounded">
                      <div className="font-medium">{apt.time}</div>
                      <div className="truncate">{apt.clientName}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayAppointments.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const AppointmentCard = ({ 
  appointment, 
  onStatusUpdate 
}: { 
  appointment: Appointment;
  onStatusUpdate: (id: string, status: string) => void;
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{appointment.clientName}</span>
            <Badge className={getTypeColor(appointment.type)}>
              {appointment.type === 'diagnostic' ? 'Diagnostic' :
               appointment.type === 'repair' ? 'Réparation' :
               appointment.type === 'maintenance' ? 'Entretien' : 'Consultation'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {appointment.clientPhone}
            </div>
            <div className="flex items-center gap-1">
              <Car className="w-3 h-3" />
              {appointment.vehicleModel}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {appointment.duration}min
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(appointment.status)}>
          {appointment.status === 'scheduled' ? 'Programmé' :
           appointment.status === 'confirmed' ? 'Confirmé' :
           appointment.status === 'in_progress' ? 'En cours' :
           appointment.status === 'completed' ? 'Terminé' : 'Annulé'}
        </Badge>
        <Select
          value={appointment.status}
          onValueChange={(value) => onStatusUpdate(appointment.id, value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Programmé</SelectItem>
            <SelectItem value="confirmed">Confirmé</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const AddAppointmentForm = ({ onAdd }: { onAdd: (appointment: Appointment) => void }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    vehicleModel: '',
    plateNumber: '',
    date: '',
    time: '',
    duration: '60',
    type: 'diagnostic' as const,
    mechanic: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      ...formData,
      duration: Number(formData.duration),
      status: 'scheduled'
    };

    onAdd(newAppointment);
    setFormData({
      clientName: '',
      clientPhone: '',
      vehicleModel: '',
      plateNumber: '',
      date: '',
      time: '',
      duration: '60',
      type: 'diagnostic',
      mechanic: '',
      notes: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Nom du client</Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            placeholder="ex: Ahmed Benali"
            required
          />
        </div>
        <div>
          <Label htmlFor="clientPhone">Téléphone</Label>
          <Input
            id="clientPhone"
            value={formData.clientPhone}
            onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
            placeholder="ex: +212 6 12 34 56 78"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vehicleModel">Modèle du véhicule</Label>
          <Input
            id="vehicleModel"
            value={formData.vehicleModel}
            onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
            placeholder="ex: Peugeot 308"
            required
          />
        </div>
        <div>
          <Label htmlFor="plateNumber">Plaque d'immatriculation</Label>
          <Input
            id="plateNumber"
            value={formData.plateNumber}
            onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
            placeholder="ex: 123456-A-12"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Heure</Label>
          <Select value={formData.time} onValueChange={(value) => setFormData({...formData, time: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner l'heure" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 18 }, (_, i) => {
                const hour = Math.floor(i / 2) + 8;
                const minute = i % 2 === 0 ? '00' : '30';
                const timeSlot = `${hour.toString().padStart(2, '0')}:${minute}`;
                return (
                  <SelectItem key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="duration">Durée (min)</Label>
          <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="60">1 heure</SelectItem>
              <SelectItem value="90">1h30</SelectItem>
              <SelectItem value="120">2 heures</SelectItem>
              <SelectItem value="180">3 heures</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type de rendez-vous</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as Appointment['type']})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diagnostic">Diagnostic</SelectItem>
              <SelectItem value="repair">Réparation</SelectItem>
              <SelectItem value="maintenance">Entretien</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="mechanic">Mécanicien</Label>
          <Select value={formData.mechanic} onValueChange={(value) => setFormData({...formData, mechanic: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un mécanicien" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mohammed">Mohammed</SelectItem>
              <SelectItem value="hassan">Hassan</SelectItem>
              <SelectItem value="omar">Omar</SelectItem>
              <SelectItem value="youssef">Youssef</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Notes ou commentaires supplémentaires..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Programmer le rendez-vous</Button>
      </div>
    </form>
  );
};

function getTypeColor(type: string) {
  switch (type) {
    case 'diagnostic': return 'bg-blue-100 text-blue-800';
    case 'repair': return 'bg-red-100 text-red-800';
    case 'maintenance': return 'bg-green-100 text-green-800';
    case 'consultation': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'scheduled': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default AppointmentCalendar;