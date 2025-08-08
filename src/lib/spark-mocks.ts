import { DatabaseService } from './database';

// Re-export the enhanced useKV hook from the dedicated hook
export { useKV } from '../hooks/useKV';
export { useDatabaseMigration } from '../hooks/useDatabase';

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
        return DatabaseService.getAllKeys();
      },
      
      get: async <T>(key: string): Promise<T | undefined> => {
        return DatabaseService.getKV<T>(key);
      },
      
      set: async <T>(key: string, value: T): Promise<void> => {
        return DatabaseService.setKV(key, value);
      },
      
      delete: async (key: string): Promise<void> => {
        return DatabaseService.deleteKV(key);
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