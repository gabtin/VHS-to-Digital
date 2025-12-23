import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Eye,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  Zap,
  Save,
  Send
} from "lucide-react";

const mockOrder = {
  id: "1",
  orderNumber: "RR-2024-001234",
  status: "in_progress",
  customer: {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    phone: "+1 (555) 123-4567",
  },
  tapeFormats: { vhs: 3, hi8: 2 },
  totalTapes: 5,
  estimatedHours: 15,
  outputFormats: ["mp4", "usb"],
  tapeHandling: "dispose",
  processingSpeed: "standard",
  specialInstructions: "Wedding footage - please handle with extra care",
  isGift: false,
  shippingName: "Sarah Mitchell",
  shippingAddress: "123 Main Street",
  shippingCity: "San Francisco",
  shippingState: "CA",
  shippingZip: "94102",
  shippingPhone: "+1 (555) 123-4567",
  subtotal: "170.00",
  rushFee: "0.00",
  total: "195.00",
  createdAt: new Date("2024-12-15"),
  dueDate: new Date("2025-01-05"),
  notes: [
    { id: "1", note: "Order received, label sent to customer", createdBy: "Admin", createdAt: new Date("2024-12-15T10:30:00") },
    { id: "2", note: "Tapes received in good condition", createdBy: "Operator", createdAt: new Date("2024-12-18T14:15:00") },
  ],
};

const statusOptions = [
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
              <SidebarMenuButton asChild isActive={location.startsWith(item.href)}>
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

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = mockOrder;
  const [status, setStatus] = useState(order.status);
  const [newNote, setNewNote] = useState("");

  const currentStatus = statusConfig[status] || statusConfig.pending;

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
              <div className="flex items-center gap-3">
                <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-xl font-semibold text-foreground" data-testid="text-order-detail-title">
                  Order {order.orderNumber}
                </h1>
                <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
                {order.processingSpeed === "rush" && (
                  <Badge className="bg-accent/20 text-accent">
                    <Zap className="w-3 h-3 mr-1" />
                    Rush
                  </Badge>
                )}
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-view-site">
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>
          </header>

          <main className="flex-1 overflow-auto p-6 bg-muted/30">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status Update */}
                <Card data-testid="card-status-update">
                  <CardHeader>
                    <CardTitle>Update Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full sm:w-64" data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button className="bg-accent text-accent-foreground" data-testid="button-save-status">
                        <Save className="w-4 h-4 mr-2" />
                        Save Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Details */}
                <Card data-testid="card-order-details">
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Tapes</h4>
                        <div className="space-y-1">
                          {Object.entries(order.tapeFormats).map(([format, qty]) => (
                            <div key={format} className="flex justify-between text-sm">
                              <span className="text-foreground capitalize">{format}</span>
                              <span className="text-muted-foreground">{qty} tapes</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-medium border-t pt-1 mt-2">
                            <span className="text-foreground">Total</span>
                            <span className="text-foreground">{order.totalTapes} tapes</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Output</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-foreground">Estimated footage</span>
                            <span className="text-muted-foreground">{order.estimatedHours} hrs</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Formats</span>
                            <span className="text-muted-foreground">
                              {order.outputFormats.map(f => f.toUpperCase()).join(", ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Tape handling</span>
                            <span className="text-muted-foreground capitalize">{order.tapeHandling}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Processing</span>
                            <span className="text-muted-foreground capitalize">{order.processingSpeed}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.specialInstructions && (
                      <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-1">Special Instructions</h4>
                        <p className="text-sm text-muted-foreground">{order.specialInstructions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card data-testid="card-notes">
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-6">
                      {order.notes.map((note) => (
                        <div key={note.id} className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm text-foreground">{note.note}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{note.createdBy}</span>
                            <span>•</span>
                            <span>{note.createdAt.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add a note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="resize-none"
                        rows={3}
                        data-testid="textarea-new-note"
                      />
                      <Button variant="outline" data-testid="button-add-note">
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Customer & Pricing */}
              <div className="space-y-6">
                {/* Customer Info */}
                <Card data-testid="card-customer-info">
                  <CardHeader>
                    <CardTitle>Customer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground">{order.customer.name}</h4>
                      </div>
                      <div className="space-y-2">
                        <a 
                          href={`mailto:${order.customer.email}`} 
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Mail className="w-4 h-4" />
                          {order.customer.email}
                        </a>
                        {order.customer.phone && (
                          <a 
                            href={`tel:${order.customer.phone}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Phone className="w-4 h-4" />
                            {order.customer.phone}
                          </a>
                        )}
                      </div>
                      <Button variant="outline" className="w-full" data-testid="button-email-customer">
                        <Send className="w-4 h-4 mr-2" />
                        Email Customer
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                {order.tapeHandling === "return" && (
                  <Card data-testid="card-shipping">
                    <CardHeader>
                      <CardTitle>Return Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-foreground">{order.shippingName}</p>
                          <p className="text-muted-foreground">{order.shippingAddress}</p>
                          <p className="text-muted-foreground">
                            {order.shippingCity}, {order.shippingState} {order.shippingZip}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pricing */}
                <Card data-testid="card-pricing">
                  <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">${order.subtotal}</span>
                      </div>
                      {parseFloat(order.rushFee) > 0 && (
                        <div className="flex justify-between text-accent">
                          <span>Rush Fee</span>
                          <span>+${order.rushFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium border-t pt-2 mt-2">
                        <span className="text-foreground">Total</span>
                        <span className="text-lg text-accent">${order.total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card data-testid="card-timeline">
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-foreground">Order placed</p>
                          <p className="text-xs text-muted-foreground">{order.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <div>
                          <p className="text-foreground">Due date</p>
                          <p className="text-xs text-accent">{order.dueDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
