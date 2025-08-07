/**
 * Service de gestion des entités inspiré de Doctrine ORM
 * Fournit une interface unifiée pour la persistance des données
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'min' | 'max' | 'numeric' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [field: string]: string[] };
}

export class EntityManager {
  private static instance: EntityManager;
  
  private constructor() {}
  
  static getInstance(): EntityManager {
    if (!EntityManager.instance) {
      EntityManager.instance = new EntityManager();
    }
    return EntityManager.instance;
  }

  /**
   * Persiste une entité dans le stockage
   */
  async persist<T extends BaseEntity>(entityName: string, entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    // Vérification que spark.kv est disponible
    if (typeof window.spark === 'undefined' || typeof window.spark.kv === 'undefined') {
      throw new Error('Service de stockage non disponible');
    }

    const now = new Date();
    const newEntity = {
      ...entity,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    } as T;

    const existingEntities = await this.findAll<T>(entityName);
    existingEntities.push(newEntity);
    
    await spark.kv.set(`entities_${entityName}`, existingEntities);
    return newEntity;
  }

  /**
   * Met à jour une entité existante
   */
  async update<T extends BaseEntity>(entityName: string, id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    const entities = await this.findAll<T>(entityName);
    const entityIndex = entities.findIndex(e => e.id === id);
    
    if (entityIndex === -1) {
      return null;
    }

    const updatedEntity = {
      ...entities[entityIndex],
      ...updates,
      updatedAt: new Date()
    };

    entities[entityIndex] = updatedEntity;
    await spark.kv.set(`entities_${entityName}`, entities);
    
    return updatedEntity;
  }

  /**
   * Trouve une entité par son ID
   */
  async findById<T extends BaseEntity>(entityName: string, id: string): Promise<T | null> {
    const entities = await this.findAll<T>(entityName);
    return entities.find(e => e.id === id) || null;
  }

  /**
   * Trouve toutes les entités d'un type
   */
  async findAll<T extends BaseEntity>(entityName: string): Promise<T[]> {
    // Vérification que spark.kv est disponible
    if (typeof window.spark === 'undefined' || typeof window.spark.kv === 'undefined') {
      console.warn('Service de stockage non disponible, retour d\'un tableau vide');
      return [];
    }
    
    return await spark.kv.get(`entities_${entityName}`) || [];
  }

  /**
   * Trouve des entités selon des critères
   */
  async findBy<T extends BaseEntity>(entityName: string, criteria: Partial<T>): Promise<T[]> {
    const entities = await this.findAll<T>(entityName);
    
    return entities.filter(entity => {
      return Object.entries(criteria).every(([key, value]) => {
        return entity[key as keyof T] === value;
      });
    });
  }

  /**
   * Supprime une entité
   */
  async remove<T extends BaseEntity>(entityName: string, id: string): Promise<boolean> {
    const entities = await this.findAll<T>(entityName);
    const initialLength = entities.length;
    const filteredEntities = entities.filter(e => e.id !== id);
    
    if (filteredEntities.length === initialLength) {
      return false;
    }

    await spark.kv.set(`entities_${entityName}`, filteredEntities);
    return true;
  }

  /**
   * Valide une entité selon des règles définies
   */
  validate<T>(entity: T, rules: ValidationRule[]): ValidationResult {
    const errors: { [field: string]: string[] } = {};

    rules.forEach(rule => {
      const value = entity[rule.field as keyof T];
      let isFieldValid = true;

      switch (rule.rule) {
        case 'required':
          isFieldValid = value !== null && value !== undefined && value !== '';
          break;
        case 'email':
          isFieldValid = typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          break;
        case 'min':
          isFieldValid = typeof value === 'string' ? value.length >= rule.value : Number(value) >= rule.value;
          break;
        case 'max':
          isFieldValid = typeof value === 'string' ? value.length <= rule.value : Number(value) <= rule.value;
          break;
        case 'numeric':
          isFieldValid = !isNaN(Number(value));
          break;
        case 'custom':
          isFieldValid = rule.validator ? rule.validator(value) : true;
          break;
      }

      if (!isFieldValid) {
        if (!errors[rule.field]) {
          errors[rule.field] = [];
        }
        errors[rule.field].push(rule.message);
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Effectue une recherche avec pagination
   */
  async findWithPagination<T extends BaseEntity>(
    entityName: string, 
    page: number = 1, 
    limit: number = 10,
    criteria?: Partial<T>
  ): Promise<{ data: T[], total: number, totalPages: number, currentPage: number }> {
    let entities = await this.findAll<T>(entityName);
    
    if (criteria) {
      entities = entities.filter(entity => {
        return Object.entries(criteria).every(([key, value]) => {
          return entity[key as keyof T] === value;
        });
      });
    }

    const total = entities.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const data = entities.slice(startIndex, startIndex + limit);

    return {
      data,
      total,
      totalPages,
      currentPage: page
    };
  }
}

export default EntityManager.getInstance();