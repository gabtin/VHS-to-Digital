import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Eye,
  Zap,
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
  cancelled: { label: "Cancelled", color: "bg-destructive/20 text-destructive" },
};

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "label_sent", label: "Label Sent" },
  { value: "tapes_received", label: "Tapes Received" },
  { value: "in_progress", label: "In Progress" },
  { value: "quality_check", label: "Quality Check" },
  { value: "ready_for_download", label: "Ready for Download" },
  { value: "shipped", label: "Shipped" },
  { value: "complete", label: "Complete" },
  { value: "cancelled", label: "Cancelled" },
];

// Local AdminSidebar removed

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
              <h1 className="text-xl font-semibold text-foreground" data-testid="text-orders-title">
                Orders
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
            <Card className="mb-6" data-testid="card-filters">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by order number or customer name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48" data-testid="select-status">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-orders-table">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>
                  Orders ({filteredOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No orders found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tapes</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => {
                          const status = statusConfig[order.status] || statusConfig.pending;
                          const isRush = order.processingSpeed === "rush";
                          return (
                            <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50" data-testid={`row-order-${order.id}`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-foreground text-sm">{order.orderNumber}</span>
                                  {isRush && (
                                    <Badge className="bg-accent/20 text-accent text-xs">
                                      <Zap className="w-3 h-3 mr-1" />
                                      Rush
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-foreground">{order.shippingName}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-foreground">{order.totalTapes}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-medium text-foreground">${order.total}</span>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={status.color}>{status.label}</Badge>
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
                                    <ArrowRight className="w-3 h-3 ml-1" />
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
