import { useState } from 'react';
import { useKV } from '@/lib/spark-mocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gear, 
  Globe, 
  CurrencyDollar, 
  FloppyDisk, 
  ArrowCounterClockwise,
  CheckCircle,
  WarningCircle,
  Database,
  Cloud
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import DatabaseManagement from './DatabaseManagement';
import CloudSyncGear from './CloudSyncSettings';

interface AppGear {
  currency: {
    code: string;
    symbol: string;
    name: string;
    position: 'before' | 'after';
  };
  garage: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  business: {
    taxRate: number;
    language: string;
    timezone: string;
  };
}

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'after' as const },
  { code: 'USD', symbol: '$', name: 'Dollar américain', position: 'before' as const },
  { code: 'MAD', symbol: 'DH', name: 'Dirham marocain', position: 'after' as const },
  { code: 'GBP', symbol: '£', name: 'Livre sterling', position: 'before' as const },
  { code: 'CAD', symbol: 'C$', name: 'Dollar canadien', position: 'before' as const },
  { code: 'CHF', symbol: 'CHF', name: 'Franc suisse', position: 'after' as const }
];

const LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'English' }
];

const TIMEZONES = [
  { code: 'Africa/Casablanca', name: 'Casablanca (GMT+1)' },
  { code: 'Europe/Paris', name: 'Paris (GMT+1)' },
  { code: 'UTC', name: 'UTC (GMT+0)' }
];

export default function SettingsManagement() {
  const [settings, setSettings] = useKV<AppSettings>('app-settings', {
    currency: {
      code: 'MAD',
      symbol: 'DH',
      name: 'Dirham marocain',
      position: 'after'
    },
    garage: {
      name: 'Garage Mohammed',
      address: 'Larache, Maroc',
      phone: '+212 6XX XXX XXX',
      email: 'contact@garage-mohammed.ma'
    },
    business: {
      taxRate: 20,
      language: 'fr',
      timezone: 'Africa/Casablanca'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateGear = (section: keyof AppGear, field: string, value: any) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const updateCurrency = (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (currency) {
      setSettings((current) => ({
        ...current,
        currency
      }));
      setHasChanges(true);
    }
  };

  const saveGear = async () => {
    setIsSaving(true);
    try {
      // Les changements sont déjà dans setGear grâce à useKV
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulation d'une sauvegarde
      setHasChanges(false);
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  const resetGear = () => {
    setSettings({
      currency: {
        code: 'MAD',
        symbol: 'DH',
        name: 'Dirham marocain',
        position: 'after'
      },
      garage: {
        name: 'Garage Mohammed',
        address: 'Larache, Maroc',
        phone: '+212 6XX XXX XXX',
        email: 'contact@garage-mohammed.ma'
      },
      business: {
        taxRate: 20,
        language: 'fr',
        timezone: 'Africa/Casablanca'
      }
    });
    setHasChanges(true);
    toast.info('Paramètres réinitialisés aux valeurs par défaut');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Gear className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Paramètres</h2>
            <p className="text-muted-foreground">Configuration de l'application</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WarningCircle className="w-3 h-3" />
              Modifications non sauvées
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={resetSettings}
            className="flex items-center gap-2"
          >
            <ArrowCounterClockwise className="w-4 h-4" />
            Réinitialiser
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <FloppyDisk className="w-4 h-4" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Gear className="w-4 h-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Entreprise
          </TabsTrigger>
          <TabsTrigger value="cloud" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Cloud
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Base de Données
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paramètres de devise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CurrencyDollar className="w-5 h-5 text-primary" />
                  Devise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise principale</Label>
              <Select
                value={settings.currency.code}
                onValueChange={updateCurrency}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{currency.symbol}</span>
                        <span>{currency.name}</span>
                        <span className="text-muted-foreground">({currency.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-2">Aperçu</div>
              <div className="space-y-1 text-sm">
                <div>
                  Exemple de prix: {settings.currency.position === 'before' 
                    ? `${settings.currency.symbol}1,250.00` 
                    : `1,250.00 ${settings.currency.symbol}`
                  }
                </div>
                <div className="text-muted-foreground">
                  Position: {settings.currency.position === 'before' ? 'Avant le montant' : 'Après le montant'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations du garage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gear className="w-5 h-5 text-primary" />
              Informations du garage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="garage-name">Nom du garage</Label>
              <Input
                id="garage-name"
                value={settings.garage.name}
                onChange={(e) => updateSettings('garage', 'name', e.target.value)}
                placeholder="Nom de votre garage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="garage-address">Adresse</Label>
              <Input
                id="garage-address"
                value={settings.garage.address}
                onChange={(e) => updateSettings('garage', 'address', e.target.value)}
                placeholder="Adresse complète"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="garage-phone">Téléphone</Label>
                <Input
                  id="garage-phone"
                  value={settings.garage.phone}
                  onChange={(e) => updateSettings('garage', 'phone', e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="garage-email">Email</Label>
                <Input
                  id="garage-email"
                  type="email"
                  value={settings.garage.email}
                  onChange={(e) => updateSettings('garage', 'email', e.target.value)}
                  placeholder="contact@garage.ma"
                />
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paramètres commerciaux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Paramètres commerciaux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Taux de TVA (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.business.taxRate}
                    onChange={(e) => updateSettings('business', 'taxRate', parseFloat(e.target.value) || 0)}
                    placeholder="20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select
                    value={settings.business.language}
                    onValueChange={(value) => updateSettings('business', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select
                    value={settings.business.timezone}
                    onValueChange={(value) => updateSettings('business', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((timezone) => (
                        <SelectItem key={timezone.code} value={timezone.code}>
                          {timezone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Statut de configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  Statut de la configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Devise configurée</span>
                    <Badge variant="default" className="bg-accent">
                      {settings.currency.code}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Informations du garage</span>
                    <Badge variant={settings.garage.name && settings.garage.address ? "default" : "secondary"}>
                      {settings.garage.name && settings.garage.address ? 'Complètes' : 'Incomplètes'}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paramètres commerciaux</span>
                    <Badge variant="default" className="bg-accent">
                      Configurés
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-accent-foreground">Configuration active</div>
                      <div className="text-muted-foreground">
                        Vos paramètres sont appliqués dans toute l'application
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cloud" className="space-y-6">
          <CloudSyncGear />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}