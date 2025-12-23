import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

const mockOrders = [
  { id: "1", orderNumber: "RR-2024-001234", customer: "Sarah Mitchell", email: "sarah@example.com", tapes: 5, status: "in_progress", date: "2024-12-23", total: "195.00", rush: false },
  { id: "2", orderNumber: "RR-2024-001233", customer: "John Smith", email: "john@example.com", tapes: 3, status: "tapes_received", date: "2024-12-23", total: "125.00", rush: true },
  { id: "3", orderNumber: "RR-2024-001232", customer: "Emily Chen", email: "emily@example.com", tapes: 8, status: "quality_check", date: "2024-12-22", total: "320.00", rush: false },
  { id: "4", orderNumber: "RR-2024-001231", customer: "Michael Brown", email: "michael@example.com", tapes: 2, status: "pending", date: "2024-12-22", total: "85.00", rush: false },
  { id: "5", orderNumber: "RR-2024-001230", customer: "Lisa Wilson", email: "lisa@example.com", tapes: 6, status: "ready_for_download", date: "2024-12-21", total: "240.00", rush: true },
  { id: "6", orderNumber: "RR-2024-001229", customer: "David Lee", email: "david@example.com", tapes: 4, status: "complete", date: "2024-12-20", total: "160.00", rush: false },
  { id: "7", orderNumber: "RR-2024-001228", customer: "Jennifer Taylor", email: "jennifer@example.com", tapes: 10, status: "shipped", date: "2024-12-19", total: "450.00", rush: false },
  { id: "8", orderNumber: "RR-2024-001227", customer: "Robert Garcia", email: "robert@example.com", tapes: 7, status: "complete", date: "2024-12-18", total: "280.00", rush: false },
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
              <SidebarMenuButton asChild isActive={location === item.href || location.startsWith(item.href + "/")}>
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

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    
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
            {/* Filters */}
            <Card className="mb-6" data-testid="card-filters">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by order number, customer name, or email..."
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

            {/* Orders Table */}
            <Card data-testid="card-orders-table">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>
                  Orders ({filteredOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                        return (
                          <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50" data-testid={`row-order-${order.id}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground text-sm">{order.orderNumber}</span>
                                {order.rush && (
                                  <Badge className="bg-accent/20 text-accent text-xs">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Rush
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="text-sm text-foreground">{order.customer}</div>
                                <div className="text-xs text-muted-foreground">{order.email}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-foreground">{order.tapes}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-foreground">${order.total}</span>
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

                {filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No orders found matching your criteria.</p>
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
