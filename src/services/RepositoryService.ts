/**
 * Repository pattern inspiré de Symfony Doctrine
 * Fournit une interface spécialisée pour chaque entité
 */

import DatabaseService, { QueryBuilder } from './DatabaseService';
import { Customer, Vehicle, Repair, User } from '../entities';

export abstract class BaseRepository<T> {
  protected tableName: string;
  protected db = DatabaseService;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async save(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    return this.db.save<T>(this.tableName, entity);
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    return this.db.update<T>(this.tableName, id, updates);
  }

  async findById(id: string): Promise<T | null> {
    return this.db.findById<T>(this.tableName, id);
  }

  async findBy(criteria: Partial<T>): Promise<T[]> {
    return this.db.findBy<T>(this.tableName, criteria);
  }

  async findAll(): Promise<T[]> {
    return this.db.findBy<T>(this.tableName, {});
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete(this.tableName, id);
  }

  createQueryBuilder(): QueryBuilder {
    return this.db.createQueryBuilder(this.tableName);
  }

  async findWithRelations(id: string, relations: string[] = []): Promise<T | null> {
    return this.db.findWithRelations<T>(this.tableName, id, relations);
  }
}

export class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super('customers');
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customers = await this.findBy({ email } as Partial<Customer>);
    return customers.length > 0 ? customers[0] : null;
  }

  async findByPhone(phone: string): Promise<Customer[]> {
    return this.findBy({ phone } as Partial<Customer>);
  }

  async findWithVehicles(id: string): Promise<Customer | null> {
    return this.findWithRelations(id, ['vehicles']);
  }

  async findWithVehiclesAndRepairs(id: string): Promise<Customer | null> {
    return this.findWithRelations(id, ['vehicles', 'repairs']);
  }

  async searchByName(searchTerm: string): Promise<Customer[]> {
    return this.createQueryBuilder()
      .where('firstName', 'LIKE', searchTerm)
      .orWhere('lastName', 'LIKE', searchTerm)
      .orderBy('lastName')
      .execute<Customer>();
  }

  async getCustomersWithActiveRepairs(): Promise<Customer[]> {
    // Cette méthode nécessiterait une jointure avec les réparations
    // Pour l'instant, on récupère tous les clients et on filtre
    const customers = await this.findAll();
    const activeRepairs = await this.db.findBy('repairs', { status: 'in_progress' });
    const customerIds = new Set(activeRepairs.map(r => r.customerId));
    
    return customers.filter(c => customerIds.has(c.id));
  }
}

export class VehicleRepository extends BaseRepository<Vehicle> {
  constructor() {
    super('vehicles');
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const vehicles = await this.findBy({ licensePlate } as Partial<Vehicle>);
    return vehicles.length > 0 ? vehicles[0] : null;
  }

  async findByCustomer(customerId: string): Promise<Vehicle[]> {
    return this.findBy({ customerId } as Partial<Vehicle>);
  }

  async findWithCustomer(id: string): Promise<Vehicle | null> {
    return this.findWithRelations(id, ['customer']);
  }

  async findWithRepairs(id: string): Promise<Vehicle | null> {
    return this.findWithRelations(id, ['repairs']);
  }

  async findWithCustomerAndRepairs(id: string): Promise<Vehicle | null> {
    return this.findWithRelations(id, ['customer', 'repairs']);
  }

  async searchByMakeModel(searchTerm: string): Promise<Vehicle[]> {
    return this.createQueryBuilder()
      .where('make', 'LIKE', searchTerm)
      .orWhere('model', 'LIKE', searchTerm)
      .orderBy('make')
      .execute<Vehicle>();
  }

  async findByYear(year: number): Promise<Vehicle[]> {
    return this.findBy({ year } as Partial<Vehicle>);
  }

  async findByYearRange(startYear: number, endYear: number): Promise<Vehicle[]> {
    return this.createQueryBuilder()
      .where('year', '>=', startYear)
      .where('year', '<=', endYear)
      .orderBy('year', 'DESC')
      .execute<Vehicle>();
  }

  async getVehiclesWithActiveRepairs(): Promise<Vehicle[]> {
    const activeRepairs = await this.db.findBy('repairs', { status: 'in_progress' });
    const vehicleIds = new Set(activeRepairs.map(r => r.vehicleId));
    
    const vehicles = await this.findAll();
    return vehicles.filter(v => vehicleIds.has(v.id));
  }

  async addPhoto(vehicleId: string, photoUrl: string): Promise<Vehicle | null> {
    const vehicle = await this.findById(vehicleId);
    if (!vehicle) return null;

    const photos = vehicle.photos || [];
    photos.push(photoUrl);

    return this.update(vehicleId, { photos } as Partial<Vehicle>);
  }

  async removePhoto(vehicleId: string, photoUrl: string): Promise<Vehicle | null> {
    const vehicle = await this.findById(vehicleId);
    if (!vehicle) return null;

    const photos = (vehicle.photos || []).filter(p => p !== photoUrl);

    return this.update(vehicleId, { photos } as Partial<Vehicle>);
  }
}

export class RepairRepository extends BaseRepository<Repair> {
  constructor() {
    super('repairs');
  }

  async findByStatus(status: string): Promise<Repair[]> {
    return this.findBy({ status } as Partial<Repair>);
  }

  async findByVehicle(vehicleId: string): Promise<Repair[]> {
    return this.findBy({ vehicleId } as Partial<Repair>);
  }

  async findByCustomer(customerId: string): Promise<Repair[]> {
    return this.findBy({ customerId } as Partial<Repair>);
  }

  async findByMechanic(mechanicId: string): Promise<Repair[]> {
    return this.findBy({ mechanicId } as Partial<Repair>);
  }

  async findWithVehicleAndCustomer(id: string): Promise<Repair | null> {
    return this.findWithRelations(id, ['vehicle', 'customer']);
  }

  async findPendingRepairs(): Promise<Repair[]> {
    return this.findByStatus('pending');
  }

  async findInProgressRepairs(): Promise<Repair[]> {
    return this.findByStatus('in_progress');
  }

  async findCompletedRepairs(): Promise<Repair[]> {
    return this.findByStatus('completed');
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Repair[]> {
    return this.createQueryBuilder()
      .where('startDate', '>=', startDate.toISOString())
      .where('startDate', '<=', endDate.toISOString())
      .orderBy('startDate', 'DESC')
      .execute<Repair>();
  }

  async findByPriority(priority: string): Promise<Repair[]> {
    return this.findBy({ priority } as Partial<Repair>);
  }

  async getRepairsByMonth(year: number, month: number): Promise<Repair[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return this.findByDateRange(startDate, endDate);
  }

  async getTotalRevenue(): Promise<number> {
    const repairs = await this.findAll();
    return repairs.reduce((total, repair) => total + (repair.actualCost || 0), 0);
  }

  async getRevenueByMonth(year: number, month: number): Promise<number> {
    const repairs = await this.getRepairsByMonth(year, month);
    return repairs.reduce((total, repair) => total + (repair.actualCost || 0), 0);
  }

  async getAverageRepairCost(): Promise<number> {
    const repairs = await this.findAll();
    const completedRepairs = repairs.filter(r => r.status === 'completed' && r.actualCost);
    
    if (completedRepairs.length === 0) return 0;
    
    const total = completedRepairs.reduce((sum, repair) => sum + repair.actualCost, 0);
    return total / completedRepairs.length;
  }

  async getMechanicWorkload(mechanicId: string): Promise<{ total: number; pending: number; inProgress: number }> {
    const repairs = await this.findByMechanic(mechanicId);
    
    return {
      total: repairs.length,
      pending: repairs.filter(r => r.status === 'pending').length,
      inProgress: repairs.filter(r => r.status === 'in_progress').length
    };
  }
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findBy({ email } as Partial<User>);
    return users.length > 0 ? users[0] : null;
  }

  async findByRole(role: string): Promise<User[]> {
    return this.findBy({ role } as Partial<User>);
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findBy({ isActive: true } as Partial<User>);
  }

  async findMechanics(): Promise<User[]> {
    return this.findByRole('mechanic');
  }

  async findAdmins(): Promise<User[]> {
    return this.findByRole('admin');
  }

  async activateUser(id: string): Promise<User | null> {
    return this.update(id, { isActive: true } as Partial<User>);
  }

  async deactivateUser(id: string): Promise<User | null> {
    return this.update(id, { isActive: false } as Partial<User>);
  }

  async updatePassword(id: string, newPassword: string): Promise<User | null> {
    // Dans un vrai projet, le mot de passe devrait être hashé
    return this.update(id, { password: newPassword } as Partial<User>);
  }

  async updatePermissions(id: string, permissions: string[]): Promise<User | null> {
    return this.update(id, { permissions } as Partial<User>);
  }

  async hasPermission(id: string, permission: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) return false;

    return user.permissions?.includes(permission) || user.role === 'admin';
  }

  async getUsersWithRepairs(): Promise<User[]> {
    const mechanics = await this.findMechanics();
    const repairs = await this.db.findBy('repairs', {});
    const mechanicIds = new Set(repairs.map(r => r.mechanicId).filter(Boolean));
    
    return mechanics.filter(m => mechanicIds.has(m.id));
  }
}

// Factory pour créer les repositories
export class RepositoryFactory {
  private static customerRepo: CustomerRepository;
  private static vehicleRepo: VehicleRepository;
  private static repairRepo: RepairRepository;
  private static userRepo: UserRepository;

  static getCustomerRepository(): CustomerRepository {
    if (!this.customerRepo) {
      this.customerRepo = new CustomerRepository();
    }
    return this.customerRepo;
  }

  static getVehicleRepository(): VehicleRepository {
    if (!this.vehicleRepo) {
      this.vehicleRepo = new VehicleRepository();
    }
    return this.vehicleRepo;
  }

  static getRepairRepository(): RepairRepository {
    if (!this.repairRepo) {
      this.repairRepo = new RepairRepository();
    }
    return this.repairRepo;
  }

  static getUserRepository(): UserRepository {
    if (!this.userRepo) {
      this.userRepo = new UserRepository();
    }
    return this.userRepo;
  }
}