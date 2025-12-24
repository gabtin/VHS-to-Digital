import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  Package,
  Download,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  Eye,
  FileVideo,
  LogIn
} from "lucide-react";
import type { Order } from "@shared/schema";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  label_sent: { label: "Label Sent", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Package },
  tapes_received: { label: "Tapes Received", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Package },
  in_progress: { label: "In Progress", color: "bg-accent/20 text-accent", icon: Clock },
  quality_check: { label: "Quality Check", color: "bg-accent/20 text-accent", icon: Eye },
  ready_for_download: { label: "Ready", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Download },
  shipped: { label: "Shipped", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Package },
  complete: { label: "Complete", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-destructive/20 text-destructive", icon: Clock },
};

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/orders/user/${user.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const hasOrders = orders.length > 0;
  const activeOrders = orders.filter(o => o.status !== "complete" && o.status !== "cancelled");
  const completedOrders = orders.filter(o => o.status === "complete");

  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto" data-testid="card-login-prompt">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <LogIn className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sign in to view your orders
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Log in to track your orders and access your digital files.
            </p>
            <a href="/api/login">
              <Button className="bg-accent text-accent-foreground" data-testid="button-login">
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
                My Orders
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your orders and download your digital files
              </p>
            </div>
            <Link href="/get-started">
              <Button className="bg-accent text-accent-foreground" data-testid="button-new-order">
                <Plus className="w-4 h-4 mr-2" />
                New Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasOrders ? (
          <Card className="max-w-lg mx-auto" data-testid="card-empty-state">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <FileVideo className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No orders yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Start preserving your memories today. It only takes a few minutes to configure your first order.
              </p>
              <Link href="/get-started">
                <Button className="bg-accent text-accent-foreground" data-testid="button-start-first-order">
                  Start Your First Order
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {activeOrders.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-active-orders">
                  Active Orders
                </h2>
                <div className="space-y-4">
                  {activeOrders.map((order) => {
                    const status = statusConfig[order.status as string] || statusConfig.pending;
                    return (
                      <Card key={order.id} className="hover-elevate" data-testid={`card-order-${order.id}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className="font-semibold text-foreground" data-testid={`text-order-number-${order.id}`}>
                                  {order.orderNumber}
                                </span>
                                <Badge className={status.color}>
                                  {status.label}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                                <span>{order.totalTapes} tapes</span>
                                <span className="text-muted-foreground/50">|</span>
                                <span>${order.total}</span>
                                <span className="text-muted-foreground/50">|</span>
                                <span>{new Date(order.createdAt!).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Link href={`/order/${order.orderNumber}`}>
                              <Button variant="outline" data-testid={`button-track-${order.id}`}>
                                Track Order
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {completedOrders.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-completed-orders">
                  Completed Orders
                </h2>
                <div className="space-y-4">
                  {completedOrders.map((order) => {
                    const status = statusConfig[order.status as string] || statusConfig.complete;
                    return (
                      <Card key={order.id} data-testid={`card-order-${order.id}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className="font-semibold text-foreground" data-testid={`text-order-number-${order.id}`}>
                                  {order.orderNumber}
                                </span>
                                <Badge className={status.color}>
                                  {status.label}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                                <span>{order.totalTapes} tapes</span>
                                <span className="text-muted-foreground/50">|</span>
                                <span>${order.total}</span>
                                <span className="text-muted-foreground/50">|</span>
                                <span>{new Date(order.createdAt!).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {order.downloadUrl && (
                                <Button className="bg-accent text-accent-foreground" data-testid={`button-download-${order.id}`}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              )}
                              <Link href={`/order/${order.orderNumber}`}>
                                <Button variant="outline" data-testid={`button-view-${order.id}`}>
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            <Card data-testid="card-stats">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                    <div className="mt-2 text-3xl font-bold text-foreground" data-testid="text-total-orders">
                      {orders.length}
                    </div>
                  </div>
                  <div className="text-center">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tapes Converted</CardTitle>
                    <div className="mt-2 text-3xl font-bold text-foreground" data-testid="text-total-tapes">
                      {orders.reduce((sum, o) => sum + (o.totalTapes || 0), 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Value</CardTitle>
                    <div className="mt-2 text-3xl font-bold text-accent" data-testid="text-total-spent">
                      ${orders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
