import EntityManager, { ValidationRule } from '../services/EntityManager';
import { Customer, Vehicle, Repair, Part, Appointment, Invoice, Mechanic, Supplier, Payment } from '../entities';

/**
 * Services métier inspirés des services Symfony
 * Encapsulent la logique métier et les interactions avec les entités
 */

export class CustomerService {
  private entityManager = EntityManager;

  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const validationRules: ValidationRule[] = [
      { field: 'firstName', rule: 'required', message: 'Le prénom est requis' },
      { field: 'lastName', rule: 'required', message: 'Le nom est requis' },
      { field: 'email', rule: 'email', message: 'Email invalide' },
      { field: 'phone', rule: 'required', message: 'Le téléphone est requis' },
      { field: 'address', rule: 'required', message: 'L\'adresse est requise' }
    ];

    const validation = this.entityManager.validate(customerData, validationRules);
    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
    }

    return await this.entityManager.persist<Customer>('customers', customerData);
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return await this.entityManager.findById<Customer>('customers', id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await this.entityManager.findAll<Customer>('customers');
  }

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    const customers = await this.getAllCustomers();
    return customers.filter(customer => 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    return await this.entityManager.update<Customer>('customers', id, updates);
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return await this.entityManager.remove<Customer>('customers', id);
  }
}

export class VehicleService {
  private entityManager = EntityManager;

  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const validationRules: ValidationRule[] = [
      { field: 'customerId', rule: 'required', message: 'Le client est requis' },
      { field: 'brand', rule: 'required', message: 'La marque est requise' },
      { field: 'model', rule: 'required', message: 'Le modèle est requis' },
      { field: 'year', rule: 'numeric', message: 'L\'année doit être un nombre' },
      { field: 'licensePlate', rule: 'required', message: 'La plaque d\'immatriculation est requise' }
    ];

    const validation = this.entityManager.validate(vehicleData, validationRules);
    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
    }

    return await this.entityManager.persist<Vehicle>('vehicles', vehicleData);
  }

  async getVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
    return await this.entityManager.findBy<Vehicle>('vehicles', { customerId });
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await this.entityManager.findAll<Vehicle>('vehicles');
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    return await this.entityManager.update<Vehicle>('vehicles', id, updates);
  }
}

export class RepairService {
  private entityManager = EntityManager;

  async createRepair(repairData: Omit<Repair, 'id' | 'createdAt' | 'updatedAt'>): Promise<Repair> {
    const validationRules: ValidationRule[] = [
      { field: 'vehicleId', rule: 'required', message: 'Le véhicule est requis' },
      { field: 'customerId', rule: 'required', message: 'Le client est requis' },
      { field: 'title', rule: 'required', message: 'Le titre est requis' },
      { field: 'description', rule: 'required', message: 'La description est requise' },
      { field: 'estimatedCost', rule: 'numeric', message: 'Le coût estimé doit être un nombre' }
    ];

    const validation = this.entityManager.validate(repairData, validationRules);
    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
    }

    return await this.entityManager.persist<Repair>('repairs', repairData);
  }

  async getRepairsByStatus(status: string): Promise<Repair[]> {
    return await this.entityManager.findBy<Repair>('repairs', { status } as any);
  }

  async getRepairsByCustomer(customerId: string): Promise<Repair[]> {
    return await this.entityManager.findBy<Repair>('repairs', { customerId });
  }

  async updateRepairStatus(id: string, status: string): Promise<Repair | null> {
    const updates: any = { status };
    
    if (status === 'en_cours' && !await this.getRepairStartDate(id)) {
      updates.startDate = new Date();
    } else if (status === 'termine') {
      updates.endDate = new Date();
    }

    return await this.entityManager.update<Repair>('repairs', id, updates);
  }

  private async getRepairStartDate(id: string): Promise<Date | null> {
    const repair = await this.entityManager.findById<Repair>('repairs', id);
    return repair?.startDate || null;
  }

  async getAllRepairs(): Promise<Repair[]> {
    return await this.entityManager.findAll<Repair>('repairs');
  }
}

export class PartService {
  private entityManager = EntityManager;

  async createPart(partData: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>): Promise<Part> {
    const validationRules: ValidationRule[] = [
      { field: 'name', rule: 'required', message: 'Le nom est requis' },
      { field: 'reference', rule: 'required', message: 'La référence est requise' },
      { field: 'unitPrice', rule: 'numeric', message: 'Le prix unitaire doit être un nombre' },
      { field: 'stockQuantity', rule: 'numeric', message: 'La quantité en stock doit être un nombre' }
    ];

    const validation = this.entityManager.validate(partData, validationRules);
    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
    }

    return await this.entityManager.persist<Part>('parts', partData);
  }

  async getLowStockParts(): Promise<Part[]> {
    const parts = await this.entityManager.findAll<Part>('parts');
    return parts.filter(part => part.stockQuantity <= part.minStockLevel);
  }

  async updateStock(partId: string, quantity: number): Promise<Part | null> {
    const part = await this.entityManager.findById<Part>('parts', partId);
    if (!part) return null;

    const newQuantity = part.stockQuantity + quantity;
    return await this.entityManager.update<Part>('parts', partId, { stockQuantity: newQuantity });
  }

  async getAllParts(): Promise<Part[]> {
    return await this.entityManager.findAll<Part>('parts');
  }

  async searchParts(searchTerm: string): Promise<Part[]> {
    const parts = await this.getAllParts();
    return parts.filter(part => 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

export class AppointmentService {
  private entityManager = EntityManager;

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const validationRules: ValidationRule[] = [
      { field: 'customerId', rule: 'required', message: 'Le client est requis' },
      { field: 'title', rule: 'required', message: 'Le titre est requis' },
      { field: 'appointmentDate', rule: 'required', message: 'La date du rendez-vous est requise' },
      { field: 'duration', rule: 'numeric', message: 'La durée doit être un nombre' }
    ];

    const validation = this.entityManager.validate(appointmentData, validationRules);
    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
    }

    return await this.entityManager.persist<Appointment>('appointments', appointmentData);
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    const appointments = await this.entityManager.findAll<Appointment>('appointments');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate >= today && appointmentDate < tomorrow;
    });
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const appointments = await this.entityManager.findAll<Appointment>('appointments');
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate >= targetDate && appointmentDate < nextDay;
    });
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | null> {
    return await this.entityManager.update<Appointment>('appointments', id, { status } as any);
  }
}

export class InvoiceService {
  private entityManager = EntityManager;

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const validationRules: ValidationRule[] = [
      { field: 'customerId', rule: 'required', message: 'Le client est requis' },
      { field: 'invoiceNumber', rule: 'required', message: 'Le numéro de facture est requis' },
      { field: 'issueDate', rule: 'required', message: 'La date d\'émission est requise' },
      { field: 'dueDate', rule: 'required', message: 'La date d\'échéance est requise' }
    ];

    const validation = this.entityManager.validate(invoiceData, validationRules);
    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${JSON.stringify(validation.errors)}`);
    }

    return await this.entityManager.persist<Invoice>('invoices', invoiceData);
  }

  async getUnpaidInvoices(): Promise<Invoice[]> {
    const invoices = await this.entityManager.findAll<Invoice>('invoices');
    return invoices.filter(invoice => 
      invoice.status !== 'payee' && 
      invoice.status !== 'annulee' &&
      invoice.paidAmount < invoice.totalAmount
    );
  }

  async markInvoiceAsPaid(id: string, paymentData: { amount: number, method: string, date: Date }): Promise<Invoice | null> {
    const invoice = await this.entityManager.findById<Invoice>('invoices', id);
    if (!invoice) return null;

    const newPaidAmount = invoice.paidAmount + paymentData.amount;
    const updates: any = {
      paidAmount: newPaidAmount,
      paymentDate: paymentData.date,
      paymentMethod: paymentData.method
    };

    if (newPaidAmount >= invoice.totalAmount) {
      updates.status = 'payee';
    }

    return await this.entityManager.update<Invoice>('invoices', id, updates);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await this.entityManager.findAll<Invoice>('invoices');
  }

  async generateInvoiceNumber(): Promise<string> {
    const invoices = await this.getAllInvoices();
    const year = new Date().getFullYear();
    const count = invoices.filter(inv => inv.invoiceNumber.startsWith(`${year}-`)).length;
    return `${year}-${String(count + 1).padStart(4, '0')}`;
  }
}

// Export des instances de services
export const customerService = new CustomerService();
export const vehicleService = new VehicleService();
export const repairService = new RepairService();
export const partService = new PartService();
export const appointmentService = new AppointmentService();
export const invoiceService = new InvoiceService();