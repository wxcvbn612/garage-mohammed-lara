import { useKV } from '../hooks/useKV';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendUp as TrendingUp, 
  TrendDown as TrendingDown, 
  CurrencyEur as Euro, 
  Calendar,
  Wrench,
  Users,
  Package,
  Warning as AlertTriangle
} from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import { useAppSettings, formatCurrency } from '../hooks/useAppSettings';

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  repairs: number;
}

interface RepairTypeData {
  type: string;
  count: number;
  revenue: number;
}

const FinancialDashboard = () => {
  const [invoices] = useKV('invoices', []);
  const [repairs] = useKV('repairs', []);
  const [stockItems] = useKV('stock-items', []);
  const [timeframe, setTimeframe] = useState('6months');
  const settings = useAppSettings();

  // Mock financial data - in a real app this would be calculated from actual data
  const financialData: FinancialData[] = [
    { month: 'Jan', revenue: 15000, expenses: 8000, profit: 7000, repairs: 45 },
    { month: 'Fév', revenue: 18000, expenses: 9000, profit: 9000, repairs: 52 },
    { month: 'Mar', revenue: 22000, expenses: 10000, profit: 12000, repairs: 58 },
    { month: 'Avr', revenue: 19000, expenses: 9500, profit: 9500, repairs: 48 },
    { month: 'Mai', revenue: 25000, expenses: 11000, profit: 14000, repairs: 65 },
    { month: 'Jun', revenue: 28000, expenses: 12000, profit: 16000, repairs: 72 }
  ];

  const repairTypeData: RepairTypeData[] = [
    { type: 'Freinage', count: 28, revenue: 8400 },
    { type: 'Moteur', count: 15, revenue: 12000 },
    { type: 'Suspension', count: 22, revenue: 6600 },
    { type: 'Électrique', count: 18, revenue: 5400 },
    { type: 'Carrosserie', count: 12, revenue: 9600 },
    { type: 'Entretien', count: 35, revenue: 3500 }
  ];

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const currentMonth = financialData[financialData.length - 1];
  const previousMonth = financialData[financialData.length - 2];
  
  const revenueGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100);
  const profitGrowth = ((currentMonth.profit - previousMonth.profit) / previousMonth.profit * 100);

  const totalRevenue = financialData.reduce((sum, month) => sum + month.revenue, 0);
  const totalProfit = financialData.reduce((sum, month) => sum + month.profit, 0);
  const avgMonthlyRevenue = totalRevenue / financialData.length;

  const topPerformingRepairType = repairTypeData.reduce((max, current) => 
    current.revenue > max.revenue ? current : max
  );

  const kpis = [
    {
      title: 'Chiffre d\'affaires mensuel',
      value: formatCurrency(currentMonth.revenue, settings.currency),
      change: revenueGrowth,
      icon: Euro,
      color: 'text-blue-600'
    },
    {
      title: 'Bénéfice mensuel',
      value: formatCurrency(currentMonth.profit, settings.currency),
      change: profitGrowth,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Réparations ce mois',
      value: currentMonth.repairs.toString(),
      change: ((currentMonth.repairs - previousMonth.repairs) / previousMonth.repairs * 100),
      icon: Wrench,
      color: 'text-orange-600'
    },
    {
      title: 'Marge bénéficiaire',
      value: `${(currentMonth.profit / currentMonth.revenue * 100).toFixed(1)}%`,
      change: ((currentMonth.profit / currentMonth.revenue) - (previousMonth.profit / previousMonth.revenue)) * 100,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Analyses Financières</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">3 derniers mois</SelectItem>
            <SelectItem value="6months">6 derniers mois</SelectItem>
            <SelectItem value="12months">12 derniers mois</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change > 0;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(kpi.change).toFixed(1)}% vs mois précédent
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value), settings.currency), '']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Chiffre d'affaires"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Bénéfice"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Repair Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par type de réparation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={repairTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {repairTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} réparations`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Repairs vs Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Réparations vs Chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="repairs" 
                  fill="#f59e0b" 
                  name="Nombre de réparations"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name={`Chiffre d'affaires (${settings.currency.symbol})`}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Repair Type */}
        <Card>
          <CardHeader>
            <CardTitle>Chiffre d'affaires par type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={repairTypeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" width={80} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value), settings.currency), 'CA']} />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Performance mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CA moyen mensuel:</span>
                <span className="font-medium">{formatCurrency(avgMonthlyRevenue, settings.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meilleur mois:</span>
                <span className="font-medium">Juin ({formatCurrency(currentMonth.revenue, settings.currency)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Croissance:</span>
                <span className={`font-medium ${revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              Analyse des réparations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type le plus rentable:</span>
                <span className="font-medium">{topPerformingRepairType.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CA généré:</span>
                <span className="font-medium">{formatCurrency(topPerformingRepairType.revenue, settings.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Panier moyen:</span>
                <span className="font-medium">
                  {formatCurrency((topPerformingRepairType.revenue / topPerformingRepairType.count), settings.currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Points d'attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="text-sm">
                  <div className="font-medium">Stock faible</div>
                  <div className="text-muted-foreground">
                    {stockItems.filter(item => item.currentStock <= item.minStock).length} articles à réapprovisionner
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div className="text-sm">
                  <div className="font-medium">Factures impayées</div>
                  <div className="text-muted-foreground">
                    {invoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).length} factures en attente
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="text-sm">
                  <div className="font-medium">Objectif mensuel</div>
                  <div className="text-muted-foreground">
                    {((currentMonth.revenue / 30000) * 100).toFixed(0)}% atteint
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé financier - 6 derniers mois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalRevenue, settings.currency)}</div>
              <div className="text-sm text-muted-foreground">Chiffre d'affaires total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{formatCurrency(totalProfit, settings.currency)}</div>
              <div className="text-sm text-muted-foreground">Bénéfice total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {financialData.reduce((sum, month) => sum + month.repairs, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Réparations totales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {((totalProfit / totalRevenue) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Marge moyenne</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;