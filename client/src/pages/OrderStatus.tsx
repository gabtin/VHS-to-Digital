import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  HelpCircle
} from "lucide-react";

const orderSteps = [
  { id: "pending", label: "Order Placed", icon: FileText, description: "Your order has been confirmed" },
  { id: "label_sent", label: "Label Sent", icon: Package, description: "Check your email for the shipping label" },
  { id: "tapes_received", label: "Tapes Received", icon: Package, description: "We've received your tapes" },
  { id: "in_progress", label: "Digitization In Progress", icon: Sparkles, description: "Converting your tapes" },
  { id: "quality_check", label: "Quality Check", icon: Eye, description: "Reviewing the quality" },
  { id: "ready_for_download", label: "Ready for Download", icon: Download, description: "Your files are ready!" },
  { id: "shipped", label: "Shipped", icon: Truck, description: "Physical media on the way" },
  { id: "complete", label: "Complete", icon: CheckCircle2, description: "All done!" },
];

const mockOrder = {
  id: "1",
  orderNumber: "RR-2024-001234",
  status: "in_progress",
  totalTapes: 5,
  estimatedHours: 15,
  outputFormats: ["mp4", "usb"],
  tapeHandling: "dispose",
  processingSpeed: "standard",
  total: "195.00",
  createdAt: new Date("2024-12-15"),
  dueDate: new Date("2025-01-05"),
  shippingName: "John Doe",
  shippingAddress: "123 Main St",
  shippingCity: "San Francisco",
  shippingState: "CA",
  shippingZip: "94102",
  tapeFormats: { vhs: 3, hi8: 2 },
};

export default function OrderStatus() {
  const { id } = useParams<{ id: string }>();
  const order = mockOrder;
  
  const currentStepIndex = orderSteps.findIndex(step => step.id === order.status);
  const isComplete = order.status === "complete";
  const isReadyForDownload = order.status === "ready_for_download" || isComplete;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-order-number">
                  Order {order.orderNumber}
                </h1>
                <Badge className={
                  isComplete 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-accent/20 text-accent"
                }>
                  {orderSteps[currentStepIndex]?.label || "Processing"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Ordered on {order.createdAt.toLocaleDateString()}
              </p>
            </div>
            {isReadyForDownload && (
              <Button className="bg-accent text-accent-foreground" data-testid="button-download-files">
                <Download className="w-4 h-4 mr-2" />
                Download Files
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Tracker */}
          <div className="lg:col-span-2">
            <Card data-testid="card-progress-tracker">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Order Progress</h2>
                
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                  <div 
                    className="absolute left-5 top-0 w-0.5 bg-accent transition-all duration-500" 
                    style={{ height: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}
                  />

                  {/* Steps */}
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
                                In progress...
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

            {/* Next Steps */}
            {!isComplete && (
              <Card className="mt-6" data-testid="card-next-steps">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">What's Next?</h2>
                  {order.status === "pending" || order.status === "label_sent" ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-accent">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">Download your shipping label</h4>
                          <p className="text-sm text-muted-foreground mt-1">Check your email for the prepaid label</p>
                          <Button variant="outline" size="sm" className="mt-2" data-testid="button-download-label">
                            Download Shipping Label
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-muted-foreground">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">Pack your tapes securely</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Use bubble wrap or padding to protect your tapes during shipping
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-muted-foreground">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">Drop off at any USPS location</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            We'll notify you when we receive your package
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      We're working on your order! You'll receive an email when your files are ready.
                      Estimated completion: {order.dueDate?.toLocaleDateString()}.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card data-testid="card-order-details">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total tapes</span>
                    <span className="text-foreground font-medium">{order.totalTapes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated hours</span>
                    <span className="text-foreground font-medium">{order.estimatedHours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing</span>
                    <span className="text-foreground font-medium">
                      {order.processingSpeed === "rush" ? "Rush (5 days)" : "Standard"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Output</span>
                    <span className="text-foreground font-medium">
                      {order.outputFormats.map(f => f.toUpperCase()).join(", ")}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-lg font-bold text-accent">${order.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.tapeHandling === "return" && (
              <Card data-testid="card-shipping-address">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Return Address</h2>
                  <div className="text-sm text-muted-foreground">
                    <p className="text-foreground font-medium">{order.shippingName}</p>
                    <p>{order.shippingAddress}</p>
                    <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card data-testid="card-help">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Have questions about your order? We're here to help.
                    </p>
                    <a href="mailto:hello@reelrevive.com">
                      <Button variant="outline" size="sm" data-testid="button-contact-support">
                        Contact Support
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
