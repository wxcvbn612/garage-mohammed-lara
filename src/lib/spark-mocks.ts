import { useState, useEffect } from 'react';

// Mock implementation of Spark hooks for production deployment
// In production, data is stored in localStorage instead of Spark KV

export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const stored = localStorage.getItem(`spark_kv_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const updateValue = (newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      try {
        localStorage.setItem(`spark_kv_${key}`, JSON.stringify(next));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
      return next;
    });
  };

  const deleteValue = () => {
    setValue(defaultValue);
    try {
      localStorage.removeItem(`spark_kv_${key}`);
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
    }
  };

  return [value, updateValue, deleteValue];
}

// Mock Spark global object for production
if (typeof window !== 'undefined' && !window.spark) {
  window.spark = {
    llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => {
      return strings.reduce((result, string, i) => {
        return result + string + (values[i] || '');
      }, '');
    },
    
    llm: async (prompt: string, modelName?: string, jsonMode?: boolean) => {
      console.warn('LLM functionality not available in production');
      return Promise.resolve('LLM functionality not available in production');
    },
    
    user: async () => {
      return Promise.resolve({
        avatarUrl: '',
        email: 'demo@garage.com',
        id: 'demo-user',
        isOwner: true,
        login: 'demo'
      });
    },
    
    kv: {
      keys: async () => {
        try {
          const keys = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('spark_kv_')) {
              keys.push(key.replace('spark_kv_', ''));
            }
          }
          return keys;
        } catch {
          return [];
        }
      },
      
      get: async <T>(key: string): Promise<T | undefined> => {
        try {
          const stored = localStorage.getItem(`spark_kv_${key}`);
          return stored ? JSON.parse(stored) : undefined;
        } catch {
          return undefined;
        }
      },
      
      set: async <T>(key: string, value: T): Promise<void> => {
        try {
          localStorage.setItem(`spark_kv_${key}`, JSON.stringify(value));
        } catch (error) {
          console.warn('Failed to save to localStorage:', error);
        }
      },
      
      delete: async (key: string): Promise<void> => {
        try {
          localStorage.removeItem(`spark_kv_${key}`);
        } catch (error) {
          console.warn('Failed to delete from localStorage:', error);
        }
      }
    }
  };
}

// Declare global type for TypeScript
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
      user: () => Promise<{
        avatarUrl: string;
        email: string;
        id: string;
        isOwner: boolean;
        login: string;
      }>;
      kv: {
        keys: () => Promise<string[]>;
        get: <T>(key: string) => Promise<T | undefined>;
        set: <T>(key: string, value: T) => Promise<void>;
        delete: (key: string) => Promise<void>;
      };
    };
  }
}