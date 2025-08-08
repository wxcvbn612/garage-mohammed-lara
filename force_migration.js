// Script pour forcer une nouvelle migration des données
console.log('Forcing database remigration...');
window.spark.kv.delete('database_migration_v3_complete').then(() => {
  console.log('Migration key deleted, reloading...');
  window.location.reload();
});