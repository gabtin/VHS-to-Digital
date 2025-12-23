import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Download,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  Eye,
  FileVideo
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

const mockOrders: Partial<Order>[] = [
  {
    id: "1",
    orderNumber: "RR-2024-001234",
    status: "in_progress",
    totalTapes: 5,
    total: "195.00",
    createdAt: new Date("2024-12-15"),
  },
  {
    id: "2",
    orderNumber: "RR-2024-001189",
    status: "complete",
    totalTapes: 3,
    total: "125.00",
    createdAt: new Date("2024-11-28"),
    downloadUrl: "https://example.com/download",
  },
  {
    id: "3",
    orderNumber: "RR-2024-001102",
    status: "complete",
    totalTapes: 8,
    total: "320.00",
    createdAt: new Date("2024-10-15"),
    downloadUrl: "https://example.com/download",
  },
];

export default function Dashboard() {
  const hasOrders = mockOrders.length > 0;
  const activeOrders = mockOrders.filter(o => o.status !== "complete" && o.status !== "cancelled");
  const completedOrders = mockOrders.filter(o => o.status === "complete");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          /* Empty State */
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
            {/* Active Orders */}
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
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                                <Badge className={status.color}>
                                  {status.label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span>{order.totalTapes} tapes</span>
                                <span>${order.total}</span>
                                <span>Ordered {order.createdAt?.toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Link href={`/order/${order.id}`}>
                              <Button variant="outline" data-testid={`button-view-${order.id}`}>
                                View Status
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

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-completed-orders">
                  Completed Orders
                </h2>
                <div className="space-y-4">
                  {completedOrders.map((order) => (
                    <Card key={order.id} data-testid={`card-order-${order.id}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Complete
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span>{order.totalTapes} tapes</span>
                              <span>${order.total}</span>
                              <span>Completed {order.createdAt?.toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {order.downloadUrl && (
                              <Button className="bg-accent text-accent-foreground" data-testid={`button-download-${order.id}`}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                            <Link href={`/order/${order.id}`}>
                              <Button variant="outline" data-testid={`button-details-${order.id}`}>
                                Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {hasOrders && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground" data-testid="stat-total-orders">
                  {mockOrders.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tapes Converted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground" data-testid="stat-total-tapes">
                  {mockOrders.reduce((sum, o) => sum + (o.totalTapes || 0), 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent" data-testid="stat-active-orders">
                  {activeOrders.length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
