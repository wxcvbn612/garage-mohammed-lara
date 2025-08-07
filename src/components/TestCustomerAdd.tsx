import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerService } from '@/services';
import { toast } from 'sonner';

export default function TestCustomerAdd() {
  const [isLoading, setIsLoading] = useState(false);

  const addTestCustomer = async () => {
    setIsLoading(true);
    try {
      const testCustomer = {
        firstName: 'Ahmed',
        lastName: 'Benali',
        email: 'ahmed.benali@email.com',
        phone: '0612345678',
        address: '123 Rue Mohammed V',
        city: 'Larache',
        postalCode: '92000',
        notes: 'Client test créé automatiquement'
      };

      console.log('Création du client test:', testCustomer);
      const result = await customerService.createCustomer(testCustomer);
      console.log('Client test créé:', result);
      toast.success('Client test ajouté avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const listAllCustomers = async () => {
    try {
      const customers = await customerService.getAllCustomers();
      console.log('Tous les clients:', customers);
      toast.success(`${customers.length} client(s) trouvé(s) - voir la console`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des clients');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Ajout Client</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={addTestCustomer} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Ajout...' : 'Ajouter Client Test'}
        </Button>
        <Button 
          onClick={listAllCustomers} 
          variant="outline"
          className="w-full"
        >
          Lister tous les clients
        </Button>
      </CardContent>
    </Card>
  );
}