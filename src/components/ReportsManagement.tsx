import { useKV } from '@/lib/spark-mocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Euro, 
  Calendar, 
  FileText,
  Download,
  BarChart,
  PieChart,
  Activity,
  Users,
  Car,
  Wrench
} from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import { Customer, Vehicle, Repair, Invoice, Mechanic } from '@/entities';
import { useAppSettings, formatCurrency } from '../hooks/useAppSettings';

interface ReportData {
  period: string;
  totalRevenue: number;
  totalRepairs: number;
  avgRepairCost: number;
  customerCount: number;
  popularServices: { name: string; count: number }[];
  monthlyTrends: { month: string; revenue: number; repairs: number }[];
  mechanicPerformance: { mechanicId: string; revenue: number; repairs: number; efficiency: number }[];
}

export default function ReportsManagement() {
  const settings = useAppSettings();
  const [customers] = useKV<Customer[]>('customers', []);
  const [vehicles] = useKV<Vehicle[]>('vehicles', []);
  const [repairs] = useKV<Repair[]>('repairs', []);
  const [invoices] = useKV<Invoice[]>('invoices', []);
  const [mechanics] = useKV<Mechanic[]>('mechanics', []);
  
  const [selectedPeriod, setSelectedPeriod] = useState('last-month');
  const [reportType, setReportType] = useState('overview');

  const reportData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'last-week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'last-quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last-year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    // Filtrer les données par période
    const periodRepairs = repairs.filter(r => new Date(r.createdAt) >= startDate);
    const periodInvoices = invoices.filter(i => new Date(i.createdAt) >= startDate);
    
    // Calculs des métriques
    const totalRevenue = periodInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalRepairs = periodRepairs.length;
    const avgRepairCost = totalRepairs > 0 ? totalRevenue / totalRepairs : 0;
    
    // Clients uniques pendant la période
    const uniqueCustomers = new Set(periodRepairs.map(r => r.customerId));
    const customerCount = uniqueCustomers.size;

    // Services populaires (basé sur les titres de réparation)
    const serviceCount: { [key: string]: number } = {};
    periodRepairs.forEach(repair => {
      const service = repair.title.toLowerCase();
      serviceCount[service] = (serviceCount[service] || 0) + 1;
    });
    
    const popularServices = Object.entries(serviceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tendances mensuelles (6 derniers mois)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthRepairs = repairs.filter(r => {
        const repairDate = new Date(r.createdAt);
        return repairDate >= monthDate && repairDate < nextMonth;
      });
      
      const monthInvoices = invoices.filter(i => {
        const invoiceDate = new Date(i.createdAt);
        return invoiceDate >= monthDate && invoiceDate < nextMonth;
      });
      
      monthlyTrends.push({
        month: monthDate.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        revenue: monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        repairs: monthRepairs.length
      });
    }

    // Performance des mécaniciens
    const mechanicPerformance = mechanics.map(mechanic => {
      const mechanicRepairs = periodRepairs.filter(r => r.mechanicId === mechanic.id);
      const mechanicInvoices = periodInvoices.filter(i => 
        mechanicRepairs.some(r => r.id === i.repairId)
      );
      
      const revenue = mechanicInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const repairCount = mechanicRepairs.length;
      const avgDuration = mechanicRepairs.length > 0 
        ? mechanicRepairs.reduce((sum, r) => sum + (r.actualDuration || r.estimatedDuration), 0) / mechanicRepairs.length
        : 0;
      const efficiency = avgDuration > 0 ? (revenue / avgDuration) : 0;

      return {
        mechanicId: mechanic.id,
        mechanicName: `${mechanic.firstName} ${mechanic.lastName}`,
        revenue,
        repairs: repairCount,
        efficiency
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      period: selectedPeriod,
      totalRevenue,
      totalRepairs,
      avgRepairCost,
      customerCount,
      popularServices,
      monthlyTrends,
      mechanicPerformance
    };
  }, [repairs, invoices, customers, vehicles, mechanics, selectedPeriod]);

  const generateReport = () => {
    // Simulation de génération de rapport
    const reportContent = `
RAPPORT DE GARAGE - ${reportData.period.toUpperCase()}
Généré le: ${new Date().toLocaleDateString('fr-FR')}

=== RÉSUMÉ EXÉCUTIF ===
Chiffre d'affaires total: ${formatCurrency(reportData.totalRevenue, settings.currency)}
Nombre de réparations: ${reportData.totalRepairs}
Coût moyen par réparation: ${formatCurrency(reportData.avgRepairCost, settings.currency)}
Clients uniques: ${reportData.customerCount}

=== SERVICES POPULAIRES ===
${reportData.popularServices.map((service, index) => 
  `${index + 1}. ${service.name} (${service.count} réparations)`
).join('\n')}

=== PERFORMANCE DES MÉCANICIENS ===
${reportData.mechanicPerformance.map((perf, index) => 
  `${index + 1}. ${perf.mechanicName} - ${formatCurrency(perf.revenue, settings.currency)} (${perf.repairs} réparations)`
).join('\n')}

=== TENDANCES MENSUELLES ===
${reportData.monthlyTrends.map(trend => 
  `${trend.month}: ${formatCurrency(trend.revenue, settings.currency)} (${trend.repairs} réparations)`
).join('\n')}
    `.trim();

    // Créer et télécharger le fichier
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-garage-${reportData.period}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Rapports et Analyses</h2>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-week">Dernière semaine</SelectItem>
              <SelectItem value="last-month">Dernier mois</SelectItem>
              <SelectItem value="last-quarter">Dernier trimestre</SelectItem>
              <SelectItem value="last-year">Dernière année</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter rapport
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.totalRevenue, settings.currency)}
                </p>
              </div>
              <Euro className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Réparations</p>
                <p className="text-2xl font-bold text-primary">
                  {reportData.totalRepairs}
                </p>
              </div>
              <Wrench className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coût moyen</p>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(reportData.avgRepairCost, settings.currency)}
                </p>
              </div>
              <BarChart className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reportData.customerCount}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services populaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Services les plus demandés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.popularServices.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <span className="font-medium capitalize">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{service.count}</div>
                    <div className="text-xs text-muted-foreground">réparations</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendances mensuelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Évolution mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.monthlyTrends.map((trend, index) => (
                <div key={trend.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-accent" />
                    </div>
                    <span className="font-medium">{trend.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(trend.revenue, settings.currency)}</div>
                    <div className="text-xs text-muted-foreground">{trend.repairs} réparations</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance des mécaniciens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance des mécaniciens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Mécanicien</th>
                  <th className="text-right py-3 px-4">Chiffre d'affaires</th>
                  <th className="text-right py-3 px-4">Réparations</th>
                  <th className="text-right py-3 px-4">Efficacité</th>
                </tr>
              </thead>
              <tbody>
                {reportData.mechanicPerformance.map((perf, index) => (
                  <tr key={perf.mechanicId} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{index + 1}</span>
                        </div>
                        <span className="font-medium">{perf.mechanicName}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-bold text-green-600">
                      {formatCurrency(perf.revenue, settings.currency)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {perf.repairs}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {perf.efficiency.toFixed(1)}{settings.currency.symbol}/h
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Types de rapports disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Rapports disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Euro className="w-6 h-6" />
              <span>Rapport financier</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Analyse clients</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Car className="w-6 h-6" />
              <span>Parc automobile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}