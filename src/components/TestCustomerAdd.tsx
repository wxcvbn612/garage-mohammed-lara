import { useState, useEffect } from 'react';
import { useKV } from '../hooks/useKV';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer } from '@/entities';
import { toast } from 'sonner';

export default function TestCustomerAdd() {
  const [customers, setCustomers] = useKV<Customer[]>('customers', []);
  const [isLoading, setIsLoading] = useState(false);

  const addTestCustomer = async () => {
    setIsLoading(true);
    try {
      const testCustomer: Customer = {
        id: Date.now().toString(),
        firstName: 'Ahmed',
        lastName: 'Benali', 
        email: 'ahmed.benali@email.com',
        phone: '0612345678',
        address: '123 Rue Mohammed V',
        city: 'Larache',
        postalCode: '92000',
        notes: 'Client test créé automatiquement',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setCustomers(current => [...current, testCustomer]);
      toast.success('Client test ajouté avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const listAllCustomers = () => {
    console.log('Tous les clients:', customers);
    toast.success(`${customers.length} client(s) trouvé(s) - voir la console`);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Ajout Client</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
          Clients actuels: {customers.length}
        </div>
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