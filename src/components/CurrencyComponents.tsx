import React from 'react';
import { useAppGear, formatCurrency } from '../hooks/useAppSettings';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ amount, className }) => {
  const settings = useAppSettings();
  
  return (
    <span className={className}>
      {formatCurrency(amount, settings.currency)}
    </span>
  );
};

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  className 
}) => {
  const settings = useAppSettings();
  
  return (
    <div className={className}>
      <label className="text-sm font-medium mb-1 block">
        {label} ({settings.currency.symbol})
      </label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-input rounded-md"
        step="0.01"
        min="0"
      />
    </div>
  );
};