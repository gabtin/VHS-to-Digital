import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Circle,
  Package,
  Download,
  Truck,
  Eye,
  Sparkles,
  ArrowLeft,
  FileText,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import type { Order, TapeFormat } from "@shared/schema";
import { OrderMessagesPanel } from "@/components/messaging/OrderMessagesPanel";
import { t } from "@/lib/translations";

const orderSteps = [
  { id: "pending", label: t.orderStatus.pending, icon: FileText, description: t.orderStatus.descriptions.pending },
  { id: "label_sent", label: t.orderStatus.label_sent, icon: Package, description: t.orderStatus.descriptions.label_sent },
  { id: "tapes_received", label: t.orderStatus.tapes_received, icon: Package, description: t.orderStatus.descriptions.tapes_received },
  { id: "in_progress", label: t.orderStatus.in_progress, icon: Sparkles, description: t.orderStatus.descriptions.in_progress },
  { id: "quality_check", label: t.orderStatus.quality_check, icon: Eye, description: t.orderStatus.descriptions.quality_check },
  { id: "ready_for_download", label: t.orderStatus.ready_for_download, icon: Download, description: t.orderStatus.descriptions.ready_for_download },
  { id: "shipped", label: t.orderStatus.shipped, icon: Truck, description: t.orderStatus.descriptions.shipped },
  { id: "complete", label: t.orderStatus.complete, icon: CheckCircle2, description: t.orderStatus.descriptions.complete },
];

export default function OrderStatus() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["/api/orders/number", id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/number/${id}`);
      if (!res.ok) throw new Error("Order not found");
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{t.shippingLabel.orderNotFound}</h2>
            <p className="text-muted-foreground mb-6">
              {t.shippingLabel.orderNotFoundDesc}
            </p>
            <Link href="/dashboard">
              <Button data-testid="button-back-dashboard">{t.shippingLabel.backToDashboard}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = orderSteps.findIndex(step => step.id === order.status);
  const isComplete = order.status === "complete";
  const isReadyForDownload = order.status === "ready_for_download" || isComplete;
  const tapeFormats = order.tapeFormats as Record<TapeFormat, number>;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t.common.back}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-order-number">
                  Ordine #{order.orderNumber}
                </h1>
                <Badge className={
                  isComplete
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-accent/20 text-accent"
                }>
                  {orderSteps[currentStepIndex]?.label || "In Elaborazione"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {t.orderStatus.timeline.orderPlaced}: {new Date(order.createdAt!).toLocaleDateString()}
              </p>
            </div>
            {isReadyForDownload && order.downloadUrl && (
              <a href={order.downloadUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-accent text-accent-foreground" data-testid="button-download-files">
                  <Download className="w-4 h-4 mr-2" />
                  {t.dashboard.download}
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card data-testid="card-progress-tracker">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Avanzamento Ordine</h2>

                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                  <div
                    className="absolute left-5 top-0 w-0.5 bg-accent transition-all duration-500"
                    style={{ height: `${Math.max(0, (currentStepIndex / (orderSteps.length - 1)) * 100)}%` }}
                  />

                  <div className="space-y-6">
                    {orderSteps.map((step, index) => {
                      const isCompleted = index < currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const isPending = index > currentStepIndex;

                      return (
                        <div key={step.id} className="relative flex gap-4" data-testid={`step-${step.id}`}>
                          <div className={`
                            relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                            ${isCompleted ? "bg-accent" : isCurrent ? "bg-accent ring-4 ring-accent/20" : "bg-secondary"}
                          `}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
                            ) : isCurrent ? (
                              <step.icon className="w-5 h-5 text-accent-foreground" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className={`flex-1 pb-6 ${isPending ? "opacity-50" : ""}`}>
                            <h3 className={`font-medium ${isCurrent ? "text-accent" : "text-foreground"}`}>
                              {step.label}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {step.description}
                            </p>
                            {isCurrent && !isComplete && (
                              <p className="text-sm text-accent mt-2">
                                {t.orderStatus.in_progress}...
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isComplete && (
              <Card className="mt-6" data-testid="card-next-steps">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">{t.orderStatus.nextSteps.title}</h2>
                  {order.status === "pending" || order.status === "label_sent" ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-accent">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{t.orderStatus.nextSteps.step1.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{t.orderStatus.nextSteps.step1.desc}</p>
                          <Button variant="outline" size="sm" className="mt-2" data-testid="button-download-label">
                            {t.orderStatus.nextSteps.step1.btn}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-muted-foreground">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{t.orderStatus.nextSteps.step2.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t.orderStatus.nextSteps.step2.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-muted-foreground">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{t.orderStatus.nextSteps.step3.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t.orderStatus.nextSteps.step3.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {t.orderStatus.nextSteps.waitMessage}
                      {order.dueDate && ` ${t.orderStatus.timeline.dueDate}: ${new Date(order.dueDate).toLocaleDateString()}.`}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card data-testid="card-order-details">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">{t.checkout.paymentTitle.replace("Pagamento", "Dettagli")}</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.wizard.step2.totalTapes}</span>
                    <span className="text-foreground font-medium">{order.totalTapes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.wizard.sections.duration}</span>
                    <span className="text-foreground font-medium">{order.estimatedHours} {t.common.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.wizard.sections.processing}</span>
                    <span className="text-foreground font-medium">
                      {order.processingSpeed === "rush" ? t.wizard.step6.rushTitle : t.wizard.step6.standardTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Output</span>
                    <span className="text-foreground font-medium">
                      {(order.outputFormats as string[]).map(f => f.toUpperCase()).join(", ")}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-foreground font-medium">Totale</span>
                    <span className="text-lg font-bold text-accent">{order.total}€</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.tapeHandling === "return" && (
              <Card data-testid="card-shipping-address">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">{t.wizard.step5.returnTitle} - Indirizzo</h2>
                  <div className="text-sm text-muted-foreground">
                    <p className="text-foreground font-medium">{order.shippingName}</p>
                    <p>{order.shippingAddress}</p>
                    <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <OrderMessagesPanel orderId={order.id} orderNumber={order.orderNumber} />
          </div>
        </div>
      </div>
    </div>
  );
}
