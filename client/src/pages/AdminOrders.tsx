import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Search,
  Eye,
  Filter,
  Loader2
} from "lucide-react";
import type { Order } from "@shared/schema";
import { AdminSidebar } from "@/components/AdminSidebar";
import { t } from "@/lib/translations";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: t.orderStatus.pending, color: "bg-muted text-muted-foreground" },
  label_sent: { label: t.orderStatus.label_sent, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  tapes_received: { label: t.orderStatus.tapes_received, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  in_progress: { label: t.orderStatus.in_progress, color: "bg-accent/20 text-accent" },
  quality_check: { label: t.orderStatus.quality_check, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  ready_for_download: { label: t.orderStatus.ready_for_download, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  shipped: { label: t.orderStatus.shipped, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  complete: { label: t.orderStatus.complete, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: t.orderStatus.cancelled, color: "bg-destructive/20 text-destructive" },
};

export default function AdminOrders() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.shippingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold text-foreground" data-testid="text-orders-title">
                {t.admin.backToOrders}
              </h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-view-site">
                <Eye className="w-4 h-4 mr-2" />
                {t.admin.viewSite}
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
                      placeholder="Cerca ordini..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48" data-testid="select-status">
                      <SelectValue placeholder="Filtra per stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli stati</SelectItem>
                      <SelectItem value="pending">{t.orderStatus.pending}</SelectItem>
                      <SelectItem value="label_sent">{t.orderStatus.label_sent}</SelectItem>
                      <SelectItem value="tapes_received">{t.orderStatus.tapes_received}</SelectItem>
                      <SelectItem value="in_progress">{t.orderStatus.in_progress}</SelectItem>
                      <SelectItem value="quality_check">{t.orderStatus.quality_check}</SelectItem>
                      <SelectItem value="ready_for_download">{t.orderStatus.ready_for_download}</SelectItem>
                      <SelectItem value="shipped">{t.orderStatus.shipped}</SelectItem>
                      <SelectItem value="complete">{t.orderStatus.complete}</SelectItem>
                      <SelectItem value="cancelled">{t.orderStatus.cancelled}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-orders-table">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>
                  Orders ({filteredOrders?.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]"># Ordine</TableHead>
                        <TableHead>{t.admin.customer}</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Totale</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {t.admin.orderNotFound}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders?.map((order) => {
                          const status = statusConfig[order.status] || statusConfig.pending;
                          const isRush = order.processingSpeed === "rush";
                          return (
                            <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.href = `/admin/orders/${order.id}`}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-foreground text-sm">{order.orderNumber}</span>
                                  {isRush && (
                                    <Badge className="bg-accent/20 text-accent text-xs">
                                      <Zap className="w-3 h-3 mr-1" />
                                      Rush
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{order.shippingName}</div>
                                {order.shippingPhone && (
                                  <div className="text-xs text-muted-foreground">{order.shippingPhone}</div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={status.color}>{status.label}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(order.createdAt!).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                €{order.total}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link href={`/admin/orders/${order.id}`}>
                                  <Button variant="ghost" size="sm">
                                    View
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main >
        </div >
      </div >
    </SidebarProvider >
  );
}
