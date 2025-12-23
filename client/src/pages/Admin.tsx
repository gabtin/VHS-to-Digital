import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  Film,
  TrendingUp,
  Clock,
  AlertTriangle,
  DollarSign,
  Eye,
  ArrowRight
} from "lucide-react";

const mockMetrics = {
  ordersToday: 12,
  ordersThisWeek: 67,
  ordersThisMonth: 245,
  revenueToday: 1840,
  revenueThisWeek: 9850,
  revenueThisMonth: 38420,
  tapesInQueue: 156,
  avgProcessingDays: 8.5,
};

const mockRecentOrders = [
  { id: "1", orderNumber: "RR-2024-001234", customer: "Sarah Mitchell", tapes: 5, status: "in_progress", date: "2024-12-23" },
  { id: "2", orderNumber: "RR-2024-001233", customer: "John Smith", tapes: 3, status: "tapes_received", date: "2024-12-23" },
  { id: "3", orderNumber: "RR-2024-001232", customer: "Emily Chen", tapes: 8, status: "quality_check", date: "2024-12-22" },
  { id: "4", orderNumber: "RR-2024-001231", customer: "Michael Brown", tapes: 2, status: "pending", date: "2024-12-22" },
  { id: "5", orderNumber: "RR-2024-001230", customer: "Lisa Wilson", tapes: 6, status: "ready_for_download", date: "2024-12-21" },
];

const mockAlerts = [
  { type: "warning", message: "3 orders waiting for tapes > 7 days", link: "/admin/orders?filter=waiting" },
  { type: "urgent", message: "2 rush orders approaching deadline", link: "/admin/orders?filter=rush" },
  { type: "info", message: "Low USB drive inventory (12 remaining)", link: "/admin/inventory" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground" },
  label_sent: { label: "Label Sent", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  tapes_received: { label: "Received", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  in_progress: { label: "In Progress", color: "bg-accent/20 text-accent" },
  quality_check: { label: "QC", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  ready_for_download: { label: "Ready", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  shipped: { label: "Shipped", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  complete: { label: "Complete", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
};

function AdminSidebar() {
  const [location] = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Orders", href: "/admin/orders" },
    { icon: Users, label: "Customers", href: "/admin/customers" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center">
            <Film className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sidebar-foreground">ReelRevive</div>
            <div className="text-xs text-sidebar-foreground/70">Admin Panel</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={location === item.href}>
                <Link href={item.href}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

export default function Admin() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold text-foreground" data-testid="text-admin-title">
                Dashboard
              </h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-view-site">
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>
          </header>

          <main className="flex-1 overflow-auto p-6 bg-muted/30">
            {/* Alerts */}
            {mockAlerts.length > 0 && (
              <div className="space-y-2 mb-6">
                {mockAlerts.map((alert, i) => (
                  <Card
                    key={i}
                    className={`border-l-4 ${
                      alert.type === "urgent" 
                        ? "border-l-destructive" 
                        : alert.type === "warning" 
                        ? "border-l-accent" 
                        : "border-l-primary"
                    }`}
                    data-testid={`alert-${i}`}
                  >
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-4 h-4 ${
                          alert.type === "urgent" ? "text-destructive" : "text-accent"
                        }`} />
                        <span className="text-sm text-foreground">{alert.message}</span>
                      </div>
                      <Link href={alert.link}>
                        <Button variant="ghost" size="sm">
                          View
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card data-testid="metric-orders-today">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Orders Today</CardTitle>
                  <Package className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{mockMetrics.ordersToday}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mockMetrics.ordersThisWeek} this week
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="metric-revenue-today">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Today</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">${mockMetrics.revenueToday.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${mockMetrics.revenueThisWeek.toLocaleString()} this week
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="metric-tapes-queue">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tapes in Queue</CardTitle>
                  <Film className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{mockMetrics.tapesInQueue}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting processing
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="metric-avg-processing">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Processing</CardTitle>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{mockMetrics.avgProcessingDays} days</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-green-500">2% faster than last month</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card data-testid="card-recent-orders">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>Recent Orders</CardTitle>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm" data-testid="button-view-all-orders">
                    View All
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tapes</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockRecentOrders.map((order) => {
                        const status = statusConfig[order.status] || statusConfig.pending;
                        return (
                          <tr key={order.id} className="border-b last:border-0" data-testid={`row-order-${order.id}`}>
                            <td className="py-3 px-4">
                              <span className="font-medium text-foreground text-sm">{order.orderNumber}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-foreground">{order.customer}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-foreground">{order.tapes}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={status.color}>{status.label}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground">{order.date}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link href={`/admin/orders/${order.id}`}>
                                <Button variant="ghost" size="sm" data-testid={`button-view-order-${order.id}`}>
                                  View
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
