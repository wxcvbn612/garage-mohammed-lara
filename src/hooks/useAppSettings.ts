import { useKV } from '../hooks/useDatabase';

interface AppSettings {
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

const DEFAULT_SETTINGS: AppSettings = {
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
};

export function useAppSettings() {
  const [settings] = useKV<AppSettings>('app-settings', DEFAULT_SETTINGS);
  return settings;
}

export function formatCurrency(amount: number, settings?: AppSettings['currency']): string {
  if (!settings) {
    // Fallback vers les paramètres par défaut si pas de settings
    settings = DEFAULT_SETTINGS.currency;
  }

  const formattedAmount = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return settings.position === 'before' 
    ? `${settings.symbol}${formattedAmount}`
    : `${formattedAmount} ${settings.symbol}`;
}

export function calculateTax(amount: number, settings?: AppSettings['business']): number {
  if (!settings) {
    settings = DEFAULT_SETTINGS.business;
  }
  return (amount * settings.taxRate) / 100;
}

export function calculateTotalWithTax(amount: number, settings?: AppSettings['business']): number {
  const tax = calculateTax(amount, settings);
  return amount + tax;
}

export type { AppSettings };