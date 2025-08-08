import { useState, useEffect } from 'react';
import { DatabaseService } from '../lib/database';

// Enhanced useKV hook that uses IndexedDB instead of localStorage
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  console.log(`useKV(${key}) - current value:`, value, 'defaultValue:', defaultValue, 'isLoaded:', isLoaded);

  // Load initial value from database
  useEffect(() => {
    const loadValue = async () => {
      try {
        console.log(`Loading value for key: ${key}`);
        const storedValue = await DatabaseService.getKV<T>(key);
        console.log(`Stored value for ${key}:`, storedValue);
        if (storedValue !== undefined) {
          setValue(storedValue);
        }
      } catch (error) {
        console.error(`Failed to load value for key ${key}:`, error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadValue();
  }, [key]);

  const updateValue = async (newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      
      // Save to database asynchronously
      DatabaseService.setKV(key, next).catch(error => {
        console.error(`Failed to save value for key ${key}:`, error);
      });
      
      return next;
    });
  };

  const deleteValue = async () => {
    setValue(defaultValue);
    try {
      await DatabaseService.deleteKV(key);
    } catch (error) {
      console.error(`Failed to delete value for key ${key}:`, error);
    }
  };

  // Return loading state as well for better UX
  return [isLoaded ? value : defaultValue, updateValue, deleteValue];
}