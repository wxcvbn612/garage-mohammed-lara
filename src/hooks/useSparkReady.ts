import { useState, useEffect } from 'react';

export function useSparkReady() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // 2 secondes maximum d'attente
    
    const checkSparkReady = () => {
      attempts++;
      
      if (typeof window !== 'undefined' && 
          typeof window.spark !== 'undefined' && 
          typeof window.spark.kv !== 'undefined') {
        setIsReady(true);
        setError(null);
        return;
      }
      
      if (attempts >= maxAttempts) {
        setError('API Spark non disponible après 2 secondes d\'attente');
        return;
      }
      
      // Réessaye dans 100ms
      setTimeout(checkSparkReady, 100);
    };
    
    checkSparkReady();
  }, []);
  
  return { isReady, error };
}