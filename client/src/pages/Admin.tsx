import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  DollarSign,
  Eye,
  ArrowRight
} from "lucide-react";
import type { Order } from "@shared/schema";
import { AdminSidebar } from "@/components/AdminSidebar";

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

// AdminSidebar removed (extracted to component)

export default function Admin() {
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const recentOrders = orders.slice(0, 5);
  const tapesInQueue = orders
    .filter(o => o.status !== "complete" && o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalTapes, 0);

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  const isLoading = ordersLoading || statsLoading;

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
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card data-testid="metric-total-orders">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                  <Package className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-foreground">{stats?.totalOrders || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.pendingOrders || 0} pending
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="metric-revenue">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-foreground">
                        ${(stats?.totalRevenue || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        From completed orders
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="metric-tapes-queue">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tapes in Queue</CardTitle>
                  <Film className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-accent">{tapesInQueue}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Awaiting processing
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="metric-completed">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-foreground">{stats?.completedOrders || 0}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <p className="text-xs text-green-500">All time</p>
                      </div>
                    </>
                  )}
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
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tapes</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => {
                          const status = statusConfig[order.status] || statusConfig.pending;
                          return (
                            <tr key={order.id} className="border-b last:border-0" data-testid={`row-order-${order.id}`}>
                              <td className="py-3 px-4">
                                <span className="font-medium text-foreground text-sm">{order.orderNumber}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-foreground">{order.totalTapes}</span>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={status.color}>{status.label}</Badge>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-foreground">${order.total}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt!).toLocaleDateString()}
                                </span>
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
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
