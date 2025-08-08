/**
 * Utilitaire pour nettoyer toutes les données de test et réinitialiser l'application
 * À utiliser uniquement en développement
 */

export class DataCleanup {
  /**
   * Nettoie toutes les données de l'application
   * ATTENTION: Cette action est irréversible
   */
  static async cleanAllData(): Promise<void> {
    try {
      console.log('🧹 Nettoyage de toutes les données...');

      // Liste de toutes les clés utilisées par l'application
      const keysToClean = [
        // Données principales
        'customers',
        'vehicles', 
        'repairs',
        'users',
        'invoices',
        'stock-items',
        'appointments',
        'mechanics',
        
        // Statistiques
        'dashboard-stats',
        'financial-stats',
        
        // Anciens systèmes de migration
        'database_migration_v1_complete',
        'database_migration_v2_complete', 
        'database_migration_v3_complete',
        'migration_completed',
        
        // Données de session
        'current-user',
        'auth-state',
        
        // Données de test spécifiques
        'test-data-created',
        'sample-customers',
        'sample-vehicles',
        'sample-repairs'
      ];

      // Obtenir toutes les clés existantes
      const allKeys = await window.spark.kv.keys();
      
      // Supprimer toutes les clés de données
      for (const key of keysToClean) {
        try {
          await window.spark.kv.delete(key);
          console.log(`✅ Supprimé: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Erreur lors de la suppression de ${key}:`, error);
        }
      }

      // Supprimer aussi toutes les clés qui commencent par certains préfixes
      const prefixesToClean = ['garage_', 'db_', 'migration_', 'test_'];
      
      for (const key of allKeys) {
        const shouldDelete = prefixesToClean.some(prefix => key.startsWith(prefix));
        if (shouldDelete) {
          try {
            await window.spark.kv.delete(key);
            console.log(`✅ Supprimé (préfixe): ${key}`);
          } catch (error) {
            console.warn(`⚠️ Erreur lors de la suppression de ${key}:`, error);
          }
        }
      }

      // Réinitialiser le flag d'initialisation pour forcer une nouvelle initialisation
      await window.spark.kv.delete('app_initialized');

      console.log('✨ Nettoyage terminé avec succès !');
      console.log('🔄 Rechargez la page pour redémarrer l\'application proprement.');
      
      return;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      throw error;
    }
  }

  /**
   * Affiche toutes les clés existantes pour débogage
   */
  static async listAllKeys(): Promise<string[]> {
    try {
      const keys = await window.spark.kv.keys();
      console.log('📋 Clés existantes dans le stockage:', keys);
      return keys;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des clés:', error);
      return [];
    }
  }

  /**
   * Sauvegarde les paramètres importants avant nettoyage
   */
  static async backupSettings(): Promise<any> {
    try {
      const settings = await window.spark.kv.get('app-settings');
      console.log('💾 Paramètres sauvegardés:', settings);
      return settings;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des paramètres:', error);
      return null;
    }
  }

  /**
   * Restaure les paramètres après nettoyage
   */
  static async restoreSettings(settings: any): Promise<void> {
    try {
      if (settings) {
        await window.spark.kv.set('app-settings', settings);
        console.log('🔄 Paramètres restaurés');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la restauration des paramètres:', error);
    }
  }

  /**
   * Nettoyage complet avec sauvegarde des paramètres
   */
  static async cleanWithSettingsBackup(): Promise<void> {
    const settings = await this.backupSettings();
    await this.cleanAllData();
    await this.restoreSettings(settings);
  }
}

// Fonction utilitaire pour un nettoyage rapide depuis la console
(window as any).cleanAllData = () => {
  DataCleanup.cleanAllData();
};

(window as any).listKeys = () => {
  DataCleanup.listAllKeys();
};

export default DataCleanup;