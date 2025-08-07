// Types et interfaces pour l'application de gestion de garage

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  mileage?: number;
  notes?: string;
  photoCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehiclePhoto {
  id: string;
  vehicleId: string;
  url: string;
  type: 'before' | 'after' | 'during' | 'general';
  description?: string;
  uploadedAt: Date;
}

export interface Mechanic {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialties: string[];
  hourlyRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Repair {
  id: string;
  vehicleId: string;
  mechanicId: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  cost: number;
  parts: RepairPart[];
  laborHours: number;
  startDate?: Date;
  completionDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepairPart {
  id: string;
  partId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Part {
  id: string;
  name: string;
  reference: string;
  category: string;
  brand: string;
  unitPrice: number;
  stock: number;
  minStock: number;
  supplier?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  mechanicId?: string;
  title: string;
  description?: string;
  date: Date;
  duration: number; // en minutes
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  type: 'diagnosis' | 'repair' | 'maintenance' | 'inspection';
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  repairId?: string;
  date: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'part' | 'labor' | 'service';
}

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'check';
  reference?: string;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalCustomers: number;
  totalVehicles: number;
  activeRepairs: number;
  pendingAppointments: number;
  monthlyRevenue: number;
  unpaidInvoices: number;
  lowStockItems: number;
}

// Types pour les rapports
export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalRepairs: number;
  averageRepairCost: number;
  topCustomers: { customerId: string; totalSpent: number }[];
  topServices: { service: string; count: number; revenue: number }[];
}

export interface StockReport {
  lowStockItems: Part[];
  mostUsedParts: { partId: string; quantityUsed: number }[];
  stockValue: number;
}