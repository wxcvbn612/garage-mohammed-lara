/**
 * Service de base de données inspiré de Symfony Doctrine
 * Fournit une couche d'abstraction pour la persistance des données
 * avec support des relations, contraintes et migrations
 */

import { BaseEntity } from './EntityManager';

export interface DatabaseConstraint {
  type: 'unique' | 'foreign_key' | 'check';
  field: string;
  reference?: { table: string; field: string };
  condition?: (value: any) => boolean;
  message: string;
}

export interface TableSchema {
  name: string;
  fields: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
      required?: boolean;
      unique?: boolean;
      default?: any;
      maxLength?: number;
      minLength?: number;
    };
  };
  constraints?: DatabaseConstraint[];
  indexes?: string[];
}

export interface Relation {
  type: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';
  entity: string;
  field: string;
  mappedBy?: string;
  inversedBy?: string;
  joinTable?: string;
}

export interface QueryBuilder {
  select(fields?: string[]): QueryBuilder;
  where(field: string, operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN', value: any): QueryBuilder;
  orWhere(field: string, operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN', value: any): QueryBuilder;
  orderBy(field: string, direction?: 'ASC' | 'DESC'): QueryBuilder;
  limit(count: number): QueryBuilder;
  offset(count: number): QueryBuilder;
  join(table: string, condition: string): QueryBuilder;
  leftJoin(table: string, condition: string): QueryBuilder;
  execute<T>(): Promise<T[]>;
  first<T>(): Promise<T | null>;
  count(): Promise<number>;
}

class QueryBuilderImpl implements QueryBuilder {
  private selectFields: string[] = [];
  private whereConditions: Array<{ field: string; operator: string; value: any; logic: 'AND' | 'OR' }> = [];
  private orderByField?: string;
  private orderByDirection: 'ASC' | 'DESC' = 'ASC';
  private limitCount?: number;
  private offsetCount?: number;
  private joins: Array<{ table: string; condition: string; type: 'INNER' | 'LEFT' }> = [];

  constructor(private tableName: string, private db: DatabaseService) {}

  select(fields?: string[]): QueryBuilder {
    this.selectFields = fields || [];
    return this;
  }

  where(field: string, operator: string, value: any): QueryBuilder {
    this.whereConditions.push({ field, operator, value, logic: 'AND' });
    return this;
  }

  orWhere(field: string, operator: string, value: any): QueryBuilder {
    this.whereConditions.push({ field, operator, value, logic: 'OR' });
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.orderByField = field;
    this.orderByDirection = direction;
    return this;
  }

  limit(count: number): QueryBuilder {
    this.limitCount = count;
    return this;
  }

  offset(count: number): QueryBuilder {
    this.offsetCount = count;
    return this;
  }

  join(table: string, condition: string): QueryBuilder {
    this.joins.push({ table, condition, type: 'INNER' });
    return this;
  }

  leftJoin(table: string, condition: string): QueryBuilder {
    this.joins.push({ table, condition, type: 'LEFT' });
    return this;
  }

  async execute<T>(): Promise<T[]> {
    return this.db.executeQuery<T>(this);
  }

  async first<T>(): Promise<T | null> {
    this.limitCount = 1;
    const results = await this.execute<T>();
    return results.length > 0 ? results[0] : null;
  }

  async count(): Promise<number> {
    return this.db.executeCount(this);
  }

  // Méthodes internes pour l'accès aux conditions de requête
  getSelectFields(): string[] { return this.selectFields; }
  getWhereConditions() { return this.whereConditions; }
  getOrderBy() { return { field: this.orderByField, direction: this.orderByDirection }; }
  getLimit() { return this.limitCount; }
  getOffset() { return this.offsetCount; }
  getJoins() { return this.joins; }
  getTableName() { return this.tableName; }
}

export class DatabaseService {
  private static instance: DatabaseService;
  private schemas: Map<string, TableSchema> = new Map();
  private relations: Map<string, Relation[]> = new Map();
  
  private constructor() {
    this.initializeSchemas();
  }
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialise les schémas de tables
   */
  private initializeSchemas() {
    // Schéma Clients
    this.defineTable('customers', {
      name: 'customers',
      fields: {
        id: { type: 'string', required: true },
        firstName: { type: 'string', required: true, minLength: 2 },
        lastName: { type: 'string', required: true, minLength: 2 },
        email: { type: 'string', required: true, unique: true },
        phone: { type: 'string', required: true },
        address: { type: 'string' },
        city: { type: 'string' },
        postalCode: { type: 'string' },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true }
      },
      constraints: [
        {
          type: 'unique',
          field: 'email',
          message: 'Cette adresse email est déjà utilisée'
        }
      ],
      indexes: ['email', 'lastName', 'firstName']
    });

    // Schéma Véhicules
    this.defineTable('vehicles', {
      name: 'vehicles',
      fields: {
        id: { type: 'string', required: true },
        customerId: { type: 'string', required: true },
        make: { type: 'string', required: true },
        model: { type: 'string', required: true },
        year: { type: 'number', required: true },
        licensePlate: { type: 'string', required: true, unique: true },
        vin: { type: 'string' },
        color: { type: 'string' },
        mileage: { type: 'number', default: 0 },
        fuelType: { type: 'string' },
        transmission: { type: 'string' },
        photos: { type: 'array', default: [] },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true }
      },
      constraints: [
        {
          type: 'unique',
          field: 'licensePlate',
          message: 'Cette plaque d\'immatriculation est déjà enregistrée'
        },
        {
          type: 'foreign_key',
          field: 'customerId',
          reference: { table: 'customers', field: 'id' },
          message: 'Le client spécifié n\'existe pas'
        }
      ],
      indexes: ['customerId', 'licensePlate', 'make', 'model']
    });

    // Schéma Réparations
    this.defineTable('repairs', {
      name: 'repairs',
      fields: {
        id: { type: 'string', required: true },
        vehicleId: { type: 'string', required: true },
        customerId: { type: 'string', required: true },
        mechanicId: { type: 'string' },
        title: { type: 'string', required: true },
        description: { type: 'string', required: true },
        status: { type: 'string', required: true, default: 'pending' },
        priority: { type: 'string', default: 'medium' },
        estimatedCost: { type: 'number', default: 0 },
        actualCost: { type: 'number', default: 0 },
        estimatedDuration: { type: 'number' },
        startDate: { type: 'date' },
        endDate: { type: 'date' },
        parts: { type: 'array', default: [] },
        laborHours: { type: 'number', default: 0 },
        notes: { type: 'string' },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true }
      },
      constraints: [
        {
          type: 'foreign_key',
          field: 'vehicleId',
          reference: { table: 'vehicles', field: 'id' },
          message: 'Le véhicule spécifié n\'existe pas'
        },
        {
          type: 'foreign_key',
          field: 'customerId',
          reference: { table: 'customers', field: 'id' },
          message: 'Le client spécifié n\'existe pas'
        }
      ],
      indexes: ['vehicleId', 'customerId', 'status', 'startDate']
    });

    // Schéma Utilisateurs
    this.defineTable('users', {
      name: 'users',
      fields: {
        id: { type: 'string', required: true },
        firstName: { type: 'string', required: true },
        lastName: { type: 'string', required: true },
        email: { type: 'string', required: true, unique: true },
        password: { type: 'string', required: true },
        role: { type: 'string', required: true, default: 'mechanic' },
        permissions: { type: 'array', default: [] },
        isActive: { type: 'boolean', default: true },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true }
      },
      constraints: [
        {
          type: 'unique',
          field: 'email',
          message: 'Cette adresse email est déjà utilisée'
        }
      ],
      indexes: ['email', 'role']
    });

    // Définir les relations
    this.defineRelations();
  }

  /**
   * Définit les relations entre les tables
   */
  private defineRelations() {
    // Relation Client -> Véhicules (un-à-plusieurs)
    this.addRelation('customers', {
      type: 'one_to_many',
      entity: 'vehicles',
      field: 'vehicles',
      mappedBy: 'customerId'
    });

    // Relation Véhicule -> Client (plusieurs-à-un)
    this.addRelation('vehicles', {
      type: 'many_to_one',
      entity: 'customers',
      field: 'customer',
      inversedBy: 'vehicles'
    });

    // Relation Véhicule -> Réparations (un-à-plusieurs)
    this.addRelation('vehicles', {
      type: 'one_to_many',
      entity: 'repairs',
      field: 'repairs',
      mappedBy: 'vehicleId'
    });

    // Relation Réparation -> Véhicule (plusieurs-à-un)
    this.addRelation('repairs', {
      type: 'many_to_one',
      entity: 'vehicles',
      field: 'vehicle',
      inversedBy: 'repairs'
    });

    // Relation Client -> Réparations (un-à-plusieurs)
    this.addRelation('customers', {
      type: 'one_to_many',
      entity: 'repairs',
      field: 'repairs',
      mappedBy: 'customerId'
    });
  }

  /**
   * Définit un schéma de table
   */
  defineTable(name: string, schema: TableSchema) {
    this.schemas.set(name, schema);
  }

  /**
   * Ajoute une relation entre entités
   */
  addRelation(entityName: string, relation: Relation) {
    const existing = this.relations.get(entityName) || [];
    existing.push(relation);
    this.relations.set(entityName, existing);
  }

  /**
   * Valide une entité selon son schéma
   */
  async validateEntity<T extends BaseEntity>(tableName: string, entity: Partial<T>): Promise<{ isValid: boolean; errors: string[] }> {
    const schema = this.schemas.get(tableName);
    if (!schema) {
      return { isValid: false, errors: [`Schéma non trouvé pour la table ${tableName}`] };
    }

    const errors: string[] = [];

    // Validation des champs requis
    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      const value = entity[fieldName as keyof T];

      if (fieldDef.required && (value === undefined || value === null || value === '')) {
        errors.push(`Le champ ${fieldName} est requis`);
        continue;
      }

      if (value !== undefined && value !== null) {
        // Validation du type
        if (!this.validateFieldType(value, fieldDef.type)) {
          errors.push(`Le champ ${fieldName} doit être de type ${fieldDef.type}`);
        }

        // Validation de la longueur pour les chaînes
        if (fieldDef.type === 'string' && typeof value === 'string') {
          if (fieldDef.minLength && value.length < fieldDef.minLength) {
            errors.push(`Le champ ${fieldName} doit contenir au moins ${fieldDef.minLength} caractères`);
          }
          if (fieldDef.maxLength && value.length > fieldDef.maxLength) {
            errors.push(`Le champ ${fieldName} ne peut pas dépasser ${fieldDef.maxLength} caractères`);
          }
        }
      }
    }

    // Validation des contraintes
    if (schema.constraints) {
      for (const constraint of schema.constraints) {
        const isValid = await this.validateConstraint(tableName, entity, constraint);
        if (!isValid) {
          errors.push(constraint.message);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Valide le type d'un champ
   */
  private validateFieldType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Valide une contrainte
   */
  private async validateConstraint<T extends BaseEntity>(tableName: string, entity: Partial<T>, constraint: DatabaseConstraint): Promise<boolean> {
    const value = entity[constraint.field as keyof T];

    switch (constraint.type) {
      case 'unique':
        if (value !== undefined && value !== null && value !== '') {
          const existing = await this.findBy(tableName, { [constraint.field]: value });
          const entityId = entity.id;
          return existing.length === 0 || (entityId && existing.every(e => e.id === entityId));
        }
        return true;

      case 'foreign_key':
        if (value !== undefined && value !== null && value !== '') {
          if (!constraint.reference) return false;
          const referenced = await this.findById(constraint.reference.table, value as string);
          return referenced !== null;
        }
        return true;

      case 'check':
        return constraint.condition ? constraint.condition(value) : true;

      default:
        return true;
    }
  }

  /**
   * Crée un QueryBuilder pour des requêtes avancées
   */
  createQueryBuilder(tableName: string): QueryBuilder {
    return new QueryBuilderImpl(tableName, this);
  }

  /**
   * Exécute une requête construite avec QueryBuilder
   */
  async executeQuery<T>(queryBuilder: QueryBuilderImpl): Promise<T[]> {
    const tableName = queryBuilder.getTableName();
    let entities = await this.getAllEntities<T>(tableName);

    // Appliquer les conditions WHERE
    const whereConditions = queryBuilder.getWhereConditions();
    if (whereConditions.length > 0) {
      entities = entities.filter(entity => {
        let result = true;
        let currentLogic: 'AND' | 'OR' = 'AND';

        for (const condition of whereConditions) {
          const fieldValue = entity[condition.field as keyof T];
          const conditionResult = this.evaluateCondition(fieldValue, condition.operator, condition.value);

          if (currentLogic === 'AND') {
            result = result && conditionResult;
          } else {
            result = result || conditionResult;
          }

          currentLogic = condition.logic;
        }

        return result;
      });
    }

    // Appliquer l'ordre
    const orderBy = queryBuilder.getOrderBy();
    if (orderBy.field) {
      entities.sort((a, b) => {
        const aValue = a[orderBy.field as keyof T];
        const bValue = b[orderBy.field as keyof T];
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;
        
        return orderBy.direction === 'DESC' ? -comparison : comparison;
      });
    }

    // Appliquer la pagination
    const offset = queryBuilder.getOffset() || 0;
    const limit = queryBuilder.getLimit();
    
    if (limit !== undefined) {
      entities = entities.slice(offset, offset + limit);
    } else if (offset > 0) {
      entities = entities.slice(offset);
    }

    // Sélectionner les champs spécifiques
    const selectFields = queryBuilder.getSelectFields();
    if (selectFields.length > 0) {
      entities = entities.map(entity => {
        const selected: any = {};
        selectFields.forEach(field => {
          selected[field] = entity[field as keyof T];
        });
        return selected;
      });
    }

    return entities;
  }

  /**
   * Compte les résultats d'une requête
   */
  async executeCount(queryBuilder: QueryBuilderImpl): Promise<number> {
    const results = await this.executeQuery(queryBuilder);
    return results.length;
  }

  /**
   * Évalue une condition de requête
   */
  private evaluateCondition(fieldValue: any, operator: string, compareValue: any): boolean {
    switch (operator) {
      case '=':
        return fieldValue === compareValue;
      case '!=':
        return fieldValue !== compareValue;
      case '>':
        return fieldValue > compareValue;
      case '<':
        return fieldValue < compareValue;
      case '>=':
        return fieldValue >= compareValue;
      case '<=':
        return fieldValue <= compareValue;
      case 'LIKE':
        return typeof fieldValue === 'string' && typeof compareValue === 'string' &&
               fieldValue.toLowerCase().includes(compareValue.toLowerCase());
      case 'IN':
        return Array.isArray(compareValue) && compareValue.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Récupère toutes les entités d'une table
   */
  private async getAllEntities<T extends BaseEntity>(tableName: string): Promise<T[]> {
    if (typeof window === 'undefined' || typeof window.spark === 'undefined' || typeof window.spark.kv === 'undefined') {
      return [];
    }

    try {
      return await window.spark.kv.get(`entities_${tableName}`) || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return [];
    }
  }

  /**
   * Sauvegarde une entité avec validation
   */
  async save<T extends BaseEntity>(tableName: string, entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    // Valider l'entité
    const validation = await this.validateEntity(tableName, entity);
    if (!validation.isValid) {
      throw new Error(`Erreurs de validation: ${validation.errors.join(', ')}`);
    }

    // Créer l'entité avec les métadonnées
    const now = new Date();
    const newEntity = {
      ...entity,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    } as T;

    // Sauvegarder
    try {
      const existingEntities = await this.getAllEntities<T>(tableName);
      existingEntities.push(newEntity);
      
      await window.spark.kv.set(`entities_${tableName}`, existingEntities);
      return newEntity;
    } catch (error) {
      throw new Error(`Impossible de sauvegarder l'entité: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Met à jour une entité avec validation
   */
  async update<T extends BaseEntity>(tableName: string, id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    // Récupérer l'entité existante
    const existing = await this.findById<T>(tableName, id);
    if (!existing) {
      return null;
    }

    // Fusionner les mises à jour
    const updatedEntity = { ...existing, ...updates, updatedAt: new Date() };

    // Valider l'entité mise à jour
    const validation = await this.validateEntity(tableName, updatedEntity);
    if (!validation.isValid) {
      throw new Error(`Erreurs de validation: ${validation.errors.join(', ')}`);
    }

    // Sauvegarder
    try {
      const entities = await this.getAllEntities<T>(tableName);
      const index = entities.findIndex(e => e.id === id);
      
      if (index === -1) {
        return null;
      }

      entities[index] = updatedEntity;
      await window.spark.kv.set(`entities_${tableName}`, entities);
      
      return updatedEntity;
    } catch (error) {
      throw new Error(`Impossible de mettre à jour l'entité: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Trouve une entité par ID
   */
  async findById<T extends BaseEntity>(tableName: string, id: string): Promise<T | null> {
    const entities = await this.getAllEntities<T>(tableName);
    return entities.find(e => e.id === id) || null;
  }

  /**
   * Trouve des entités selon des critères
   */
  async findBy<T extends BaseEntity>(tableName: string, criteria: Partial<T>): Promise<T[]> {
    const entities = await this.getAllEntities<T>(tableName);
    
    return entities.filter(entity => {
      return Object.entries(criteria).every(([key, value]) => {
        return entity[key as keyof T] === value;
      });
    });
  }

  /**
   * Supprime une entité
   */
  async delete(tableName: string, id: string): Promise<boolean> {
    try {
      const entities = await this.getAllEntities(tableName);
      const initialLength = entities.length;
      const filteredEntities = entities.filter(e => e.id !== id);
      
      if (filteredEntities.length === initialLength) {
        return false;
      }

      await window.spark.kv.set(`entities_${tableName}`, filteredEntities);
      return true;
    } catch (error) {
      throw new Error(`Impossible de supprimer l'entité: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Récupère les entités avec les relations
   */
  async findWithRelations<T extends BaseEntity>(tableName: string, id: string, relations: string[] = []): Promise<T | null> {
    const entity = await this.findById<T>(tableName, id);
    if (!entity) {
      return null;
    }

    const entityRelations = this.relations.get(tableName) || [];
    const result = { ...entity } as any;

    for (const relationName of relations) {
      const relation = entityRelations.find(r => r.field === relationName);
      if (!relation) continue;

      switch (relation.type) {
        case 'one_to_many':
          if (relation.mappedBy) {
            result[relationName] = await this.findBy(relation.entity, { [relation.mappedBy]: entity.id });
          }
          break;
        
        case 'many_to_one':
          const foreignKey = entity[relationName as keyof T] as string;
          if (foreignKey) {
            result[relationName] = await this.findById(relation.entity, foreignKey);
          }
          break;
      }
    }

    return result;
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Effectue une migration de données
   */
  async runMigration(migrationName: string, migrationFunction: () => Promise<void>): Promise<void> {
    const migrations = await window.spark.kv.get('database_migrations') || [];
    
    if (migrations.includes(migrationName)) {
      console.log(`Migration ${migrationName} déjà exécutée`);
      return;
    }

    try {
      await migrationFunction();
      migrations.push(migrationName);
      await window.spark.kv.set('database_migrations', migrations);
      console.log(`Migration ${migrationName} exécutée avec succès`);
    } catch (error) {
      console.error(`Erreur lors de la migration ${migrationName}:`, error);
      throw error;
    }
  }

  /**
   * Exporte les données de la base
   */
  async exportData(): Promise<{ [tableName: string]: any[] }> {
    const data: { [tableName: string]: any[] } = {};
    
    for (const [tableName] of this.schemas) {
      data[tableName] = await this.getAllEntities(tableName);
    }
    
    return data;
  }

  /**
   * Importe des données dans la base
   */
  async importData(data: { [tableName: string]: any[] }): Promise<void> {
    for (const [tableName, entities] of Object.entries(data)) {
      if (this.schemas.has(tableName)) {
        await window.spark.kv.set(`entities_${tableName}`, entities);
      }
    }
  }
}

export default DatabaseService.getInstance();