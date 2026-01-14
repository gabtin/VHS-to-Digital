import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Eye,
  ArrowLeft,
  MapPin,
  Clock,
  Zap,
  Save,
  AlertCircle,
  Upload,
  Loader2,
  FileCheck
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderNote, TapeFormat } from "@shared/schema";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminOrderMessagesPanel } from "@/components/messaging/AdminOrderMessagesPanel";
import { t } from "@/lib/translations";

const statusOptions = [
  { value: "pending", label: t.orderStatus.pending },
  { value: "label_sent", label: t.orderStatus.label_sent },
  { value: "tapes_received", label: t.orderStatus.tapes_received },
  { value: "in_progress", label: t.orderStatus.in_progress },
  { value: "quality_check", label: t.orderStatus.quality_check },
  { value: "ready_for_download", label: t.orderStatus.ready_for_download },
  { value: "shipped", label: t.orderStatus.shipped },
  { value: "complete", label: t.orderStatus.complete },
  { value: "cancelled", label: t.orderStatus.cancelled },
];

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

// Local AdminSidebar removed

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [newNote, setNewNote] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: order, isLoading: orderLoading } = useQuery<Order>({
    queryKey: ["/api/orders", id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Order not found");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: notes = [] } = useQuery<OrderNote[]>({
    queryKey: ["/api/orders", id, "notes"],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}/notes`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id,
  });

  const [status, setStatus] = useState<string>("");

  const updateOrderMutation = useMutation({
    mutationFn: async (data: Partial<Order>) => {
      return apiRequest("PATCH", `/api/orders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Ordine aggiornato con successo" });
    },
    onError: () => {
      toast({ title: "Errore nell'aggiornamento ordine", variant: "destructive" });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      return apiRequest("POST", `/api/orders/${id}/notes`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", id, "notes"] });
      setNewNote("");
      toast({ title: "Nota aggiunta con successo" });
    },
    onError: () => {
      toast({ title: "Errore nell'aggiunta nota", variant: "destructive" });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/orders/${id}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      toast({ title: "File caricato con successo", description: "Link Google Drive generato e cliente notificato." });
      queryClient.invalidateQueries({ queryKey: ["/api/orders", id] });
    } catch (error: any) {
      toast({ title: "Caricamento fallito", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  if (orderLoading) {
    return (
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center gap-4 p-4 border-b bg-background">
              <SidebarTrigger />
              <Skeleton className="h-8 w-48" />
            </header>
            <main className="flex-1 overflow-auto p-6 bg-muted/30">
              <Skeleton className="h-96 w-full" />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!order) {
    return (
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1 items-center justify-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{t.admin.orderNotFound}</h2>
            <Link href="/admin/orders">
              <Button>{t.admin.backToOrders}</Button>
            </Link>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const currentStatus = statusConfig[status || order.status] || statusConfig.pending;
  const tapeFormats = order.tapeFormats as Record<TapeFormat, number>;

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <div className="flex items-center gap-4 flex-wrap">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-xl font-semibold text-foreground" data-testid="text-order-detail-title">
                  Ordine #{order.orderNumber}
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
                {t.admin.viewSite}
              </Button>
            </Link>
          </header>

          <main className="flex-1 overflow-auto p-6 bg-muted/30">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card data-testid="card-status-update">
                  <CardHeader>
                    <CardTitle>{t.admin.updateStatus}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Select value={status || order.status} onValueChange={setStatus}>
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
                      <Button
                        className="bg-accent text-accent-foreground"
                        onClick={() => updateOrderMutation.mutate({ status: status || order.status })}
                        disabled={updateOrderMutation.isPending || (status === order.status && !status)}
                        data-testid="button-save-status"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateOrderMutation.isPending ? "Salvataggio..." : t.admin.saveStatus}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-digital-delivery">
                  <CardHeader>
                    <CardTitle>{t.admin.digitalDelivery}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border-2 border-dashed border-accent/20 rounded-xl bg-accent/5 flex flex-col items-center justify-center space-y-3 transition-colors hover:border-accent/40">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        {isUploading ? <Loader2 className="w-6 h-6 text-accent animate-spin" /> : <Upload className="w-6 h-6 text-accent" />}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">Carica File Digitalizzato</p>
                        <p className="text-xs text-muted-foreground mt-1">MP4, MOV o altri formati video</p>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          accept="video/*"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUploading}
                          asChild
                        >
                          <span>{isUploading ? t.admin.uploading : t.admin.uploadFile}</span>
                        </Button>
                      </label>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">
                          {t.admin.manualLink}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Download URL</label>
                      <div className="flex gap-4">
                        <Textarea
                          placeholder="Esempio: https://drive.google.com/..."
                          value={downloadUrl || order.downloadUrl || ""}
                          onChange={(e) => setDownloadUrl(e.target.value)}
                          className="flex-1"
                          rows={1}
                        />
                        <Button
                          onClick={() => updateOrderMutation.mutate({ downloadUrl: downloadUrl })}
                          disabled={updateOrderMutation.isPending || !downloadUrl || downloadUrl === order.downloadUrl}
                        >
                          {t.admin.saveLink}
                        </Button>
                      </div>
                    </div>
                    {order.downloadUrl && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileCheck className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-xs text-green-700 dark:text-green-400 truncate">{order.downloadUrl}</span>
                        </div>
                        <a href={order.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-accent hover:underline shrink-0">Test Link</a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-order-details">
                  <CardHeader>
                    <CardTitle>{t.admin.orderDetails}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{t.common.tapes}</h4>
                        <div className="space-y-1">
                          {Object.entries(tapeFormats).filter(([_, qty]) => qty > 0).map(([format, qty]) => (
                            <div key={format} className="flex justify-between text-sm">
                              <span className="text-foreground capitalize">{format}</span>
                              <span className="text-muted-foreground">{qty} {t.common.tapes}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-medium border-t pt-1 mt-2">
                            <span className="text-foreground">Totale</span>
                            <span className="text-foreground">{order.totalTapes} {t.common.tapes}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Output</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-foreground">{t.wizard.sections.duration}</span>
                            <span className="text-muted-foreground">{order.estimatedHours} {t.common.hours}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Formati</span>
                            <span className="text-muted-foreground">
                              {(order.outputFormats as string[]).map(f => f.toUpperCase()).join(", ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Gestione</span>
                            <span className="text-muted-foreground capitalize">{order.tapeHandling}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Priorità</span>
                            <span className="text-muted-foreground capitalize">{order.processingSpeed}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.specialInstructions && (
                      <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-1">Istruzioni Speciali</h4>
                        <p className="text-sm text-muted-foreground">{order.specialInstructions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-notes">
                  <CardHeader>
                    <CardTitle>{t.admin.notes}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-6">
                      {notes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t.admin.noNotes}</p>
                      ) : (
                        notes.map((note) => (
                          <div key={note.id} className="p-3 bg-secondary/50 rounded-lg">
                            <p className="text-sm text-foreground">{note.note}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{new Date(note.createdAt!).toLocaleString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-3">
                      <Textarea
                        placeholder="Aggiungi una nota..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="resize-none"
                        rows={3}
                        data-testid="textarea-new-note"
                      />
                      <Button
                        variant="outline"
                        onClick={() => addNoteMutation.mutate(newNote)}
                        disabled={addNoteMutation.isPending || !newNote.trim()}
                        data-testid="button-add-note"
                      >
                        {addNoteMutation.isPending ? "Salvataggio..." : t.admin.addNote}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <AdminOrderMessagesPanel
                  orderId={order.id}
                  orderNumber={order.orderNumber}
                  customerName={order.shippingName}
                />
              </div>

              <div className="space-y-6">
                <Card data-testid="card-customer-info">
                  <CardHeader>
                    <CardTitle>{t.admin.customer}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground">{order.shippingName}</h4>
                      </div>
                      {order.shippingPhone && (
                        <p className="text-sm text-muted-foreground">{order.shippingPhone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {order.tapeHandling === "return" && (
                  <Card data-testid="card-shipping">
                    <CardHeader>
                      <CardTitle>{t.admin.returnAddress}</CardTitle>
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

                <Card data-testid="card-pricing">
                  <CardHeader>
                    <CardTitle>{t.admin.pricing}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotale</span>
                        <span className="text-foreground">€{order.subtotal}</span>
                      </div>
                      {parseFloat(order.rushFee || "0") > 0 && (
                        <div className="flex justify-between text-accent">
                          <span>Supplemento Urgenza</span>
                          <span>+€{order.rushFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium border-t pt-2 mt-2">
                        <span className="text-foreground">Totale</span>
                        <span className="text-lg text-accent">€{order.total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-timeline">
                  <CardHeader>
                    <CardTitle>{t.admin.timeline}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-foreground">{t.admin.orderPlaced}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {order.dueDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-accent" />
                          <div>
                            <p className="text-foreground">{t.admin.dueDate}</p>
                            <p className="text-xs text-accent">
                              {new Date(order.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
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
