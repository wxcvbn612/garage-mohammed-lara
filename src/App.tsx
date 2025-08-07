import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Calendar, 
  Package, 
  Euro, 
  TrendingUp, 
  Plus,
  Car,
  Users,
  Clock,
  AlertTriangle,
  User,
  ChartBar
} from '@phosphor-icons/react';
import { useState } from 'react';
import { Toaster } from 'sonner';
import RepairsList from './components/RepairsList';
import AddRepairDialog from './components/AddRepairDialog';
import AppointmentCalendar from './components/AppointmentCalendar';
import StockManagement from './components/StockManagement';
import InvoiceManagement from './components/InvoiceManagement';
import FinancialDashboard from './components/FinancialDashboard';
import CustomerManagement from './components/CustomerManagement';
import VehicleManagement from './components/VehicleManagement';
import MechanicManagement from './components/MechanicManagement';
import ReportsManagement from './components/ReportsManagement';
import NotificationCenter from './components/NotificationCenter';
import TestCustomerAdd from './components/TestCustomerAdd';

interface DashboardStats {
  totalRepairs: number;
  pendingRepairs: number;
  todayAppointments: number;
  lowStockItems: number;
  monthlyRevenue: number;
  unpaidInvoices: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats] = useKV<DashboardStats>('dashboard-stats', {
    totalRepairs: 0,
    pendingRepairs: 0,
    todayAppointments: 0,
    lowStockItems: 0,
    monthlyRevenue: 0,
    unpaidInvoices: 0
  });

  const navigation = [
    { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
    { id: 'customers', label: 'Clients', icon: Users },
    { id: 'vehicles', label: 'Véhicules', icon: Car },
    { id: 'mechanics', label: 'Mécaniciens', icon: User },
    { id: 'repairs', label: 'Réparations', icon: Wrench },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'invoices', label: 'Facturation', icon: Euro },
    { id: 'reports', label: 'Rapports', icon: ChartBar },
    { id: 'analytics', label: 'Analyses', icon: TrendingUp }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'customers':
        return <CustomerManagement />;
      case 'vehicles':
        return <VehicleManagement />;
      case 'mechanics':
        return <MechanicManagement />;
      case 'repairs':
        return <RepairsList />;
      case 'appointments':
        return <AppointmentCalendar />;
      case 'stock':
        return <StockManagement />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'reports':
        return <ReportsManagement />;
      case 'analytics':
        return <FinancialDashboard />;
      default:
        return <DashboardOverview stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Garage Mohammed</h1>
              <p className="text-sm text-muted-foreground">Larache - Gestion Automobile</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Mohammed Larache
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-card border-r">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
      
      {/* Toaster pour les notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}

function DashboardOverview({ stats }: { stats: DashboardStats }) {
  const dashboardCards = [
    {
      title: 'Réparations en cours',
      value: stats.pendingRepairs,
      total: stats.totalRepairs,
      icon: Wrench,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'RDV aujourd\'hui',
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Stock faible',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      title: 'Chiffre d\'affaires',
      value: `${stats.monthlyRevenue}€`,
      icon: Euro,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Tableau de bord</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Mis à jour il y a 5 min
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {card.value}
                  {card.total && (
                    <span className="text-sm text-muted-foreground ml-1">
                      / {card.total}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <Plus className="w-5 h-5" />
              Nouvelle réparation
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-12">
              <Calendar className="w-5 h-5" />
              Ajouter RDV
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-12">
              <Euro className="w-5 h-5" />
              Créer facture
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Réparation terminée - Peugeot 308</p>
                <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nouveau client ajouté - Ahmed Benali</p>
                <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Stock faible - Plaquettes de frein</p>
                <p className="text-xs text-muted-foreground">Il y a 6 heures</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Component */}
      <Card>
        <CardHeader>
          <CardTitle>Test du système</CardTitle>
        </CardHeader>
        <CardContent>
          <TestCustomerAdd />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;