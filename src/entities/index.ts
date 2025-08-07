import { BaseEntity } from '../services/EntityManager';

/**
 * Entités métier pour la gestion du garage
 * Inspirées des entités Doctrine
 */

export interface Customer extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export interface Vehicle extends BaseEntity {
  customerId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  mileage: number;
  fuelType: 'essence' | 'diesel' | 'hybride' | 'electrique';
  color?: string;
  notes?: string;
  photos?: VehiclePhoto[];
}

export interface VehiclePhoto extends BaseEntity {
  vehicleId: string;
  imageUrl: string;
  imageData: string; // Base64 encoded image data
  fileName: string;
  fileSize: number;
  category: 'avant' | 'pendant' | 'apres' | 'general';
  description?: string;
  repairId?: string; // Lié à une réparation spécifique
  captureDate: Date;
}

export interface Repair extends BaseEntity {
  vehicleId: string;
  customerId: string;
  title: string;
  description: string;
  status: 'en_attente' | 'en_cours' | 'termine' | 'annule';
  priority: 'basse' | 'normale' | 'haute' | 'urgente';
  estimatedCost: number;
  actualCost?: number;
  estimatedDuration: number; // en heures
  actualDuration?: number;
  startDate?: Date;
  endDate?: Date;
  mechanicId?: string;
  parts: RepairPart[];
  laborCost: number;
  notes?: string;
}

export interface RepairPart {
  partId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Part extends BaseEntity {
  name: string;
  reference: string;
  brand: string;
  category: string;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  supplier: string;
  location?: string;
  notes?: string;
}

export interface Appointment extends BaseEntity {
  customerId: string;
  vehicleId?: string;
  title: string;
  description?: string;
  appointmentDate: Date;
  duration: number; // en minutes
  status: 'programme' | 'confirme' | 'en_cours' | 'termine' | 'annule';
  type: 'diagnostic' | 'reparation' | 'entretien' | 'controle';
  mechanicId?: string;
  estimatedCost?: number;
  notes?: string;
}

export interface Invoice extends BaseEntity {
  customerId: string;
  repairId?: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee';
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod?: 'especes' | 'carte' | 'cheque' | 'virement';
  paymentDate?: Date;
  items: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'piece' | 'main_oeuvre' | 'service';
}

export interface Mechanic extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specializations: string[];
  hourlyRate: number;
  isActive: boolean;
  hireDate: Date;
  notes?: string;
}

export interface Supplier extends BaseEntity {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  website?: string;
  notes?: string;
}

export interface Payment extends BaseEntity {
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  method: 'especes' | 'carte' | 'cheque' | 'virement';
  reference?: string;
  notes?: string;
}

/**
 * Enums pour les différents statuts et types
 */
export const RepairStatus = {
  EN_ATTENTE: 'en_attente',
  EN_COURS: 'en_cours',
  TERMINE: 'termine',
  ANNULE: 'annule'
} as const;

export const RepairPriority = {
  BASSE: 'basse',
  NORMALE: 'normale',
  HAUTE: 'haute',
  URGENTE: 'urgente'
} as const;

export const AppointmentStatus = {
  PROGRAMME: 'programme',
  CONFIRME: 'confirme',
  EN_COURS: 'en_cours',
  TERMINE: 'termine',
  ANNULE: 'annule'
} as const;

export const AppointmentType = {
  DIAGNOSTIC: 'diagnostic',
  REPARATION: 'reparation',
  ENTRETIEN: 'entretien',
  CONTROLE: 'controle'
} as const;

export const InvoiceStatus = {
  BROUILLON: 'brouillon',
  ENVOYEE: 'envoyee',
  PAYEE: 'payee',
  EN_RETARD: 'en_retard',
  ANNULEE: 'annulee'
} as const;

export const PaymentMethod = {
  ESPECES: 'especes',
  CARTE: 'carte',
  CHEQUE: 'cheque',
  VIREMENT: 'virement'
} as const;

export const FuelType = {
  ESSENCE: 'essence',
  DIESEL: 'diesel',
  HYBRIDE: 'hybride',
  ELECTRIQUE: 'electrique'
} as const;