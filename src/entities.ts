// Types et interfaces pour l'application de gestion de garage

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
}

export interface Vehicle extends BaseEntity {
  customerId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  registrationNumber?: string; // Added for compatibility
  vin: string;
  color: string;
  mileage?: number;
  fuelType?: string; // Added for compatibility
  notes?: string;
  photoCount?: number;
  photos?: string[]; // Added for compatibility
}

export interface VehiclePhoto extends BaseEntity {
  vehicleId: string;
  url: string;
  imageUrl?: string; // Added for compatibility
  imageData?: string; // Added for compatibility
  fileName?: string; // Added for compatibility
  fileSize?: number; // Added for compatibility
  category?: 'before' | 'after' | 'during' | 'general'; // Made optional and added categories
  type: 'before' | 'after' | 'during' | 'general';
  description?: string;
  uploadedAt: Date;
  captureDate?: Date; // Added for compatibility
  repairId?: string; // Added for compatibility
}

export interface Mechanic extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialties: string[];
  hourlyRate: number;
  isActive: boolean;
}

export interface Repair extends BaseEntity {
  vehicleId: string;
  customerId?: string; // Added for compatibility
  mechanicId: string;
  title?: string; // Added for compatibility
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  cost: number;
  actualCost?: number; // Added for compatibility
  parts: RepairPart[];
  laborHours: number;
  startDate?: Date;
  completionDate?: Date;
  notes?: string;
}

export interface RepairPart {
  id: string;
  partId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Part extends BaseEntity {
  name: string;
  reference: string;
  category: string;
  brand: string;
  unitPrice: number;
  stock: number;
  stockQuantity?: number; // Added for compatibility
  minStock: number;
  minStockLevel?: number; // Added for compatibility
  supplier?: string;
  description?: string;
}

export interface Appointment extends BaseEntity {
  customerId: string;
  vehicleId: string;
  mechanicId?: string;
  title: string;
  description?: string;
  date: Date;
  appointmentDate?: Date; // Added for compatibility
  duration: number; // en minutes
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  type: 'diagnosis' | 'repair' | 'maintenance' | 'inspection';
}

export interface Invoice extends BaseEntity {
  number: string;
  invoiceNumber?: string; // Added for compatibility
  customerId: string;
  repairId?: string;
  date: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  totalAmount?: number; // Added for compatibility
  paidAmount?: number; // Added for compatibility
  paymentDate?: Date; // Added for compatibility
  paymentMethod?: string; // Added for compatibility
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'part' | 'labor' | 'service';
}

export interface Payment extends BaseEntity {
  invoiceId: string;
  customerId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'check';
  reference?: string;
  date: Date;
  notes?: string;
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

// Additional types for compatibility
export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'mechanic' | 'user';
  isActive: boolean;
}

export interface Supplier extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
  contact?: string;
}

export interface AppSettings {
  garage: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  business: {
    taxRate: number;
    language: string;
    timezone: string;
  };
  currency: string;
}