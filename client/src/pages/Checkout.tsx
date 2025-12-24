import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Loader2, Package, CheckCircle2 } from "lucide-react";
import { PRICING, type TapeFormat, type OutputFormat, type TapeHandling, type ProcessingSpeed } from "@shared/schema";
import { useMemo, useEffect, useState } from "react";
import { Link } from "wouter";

const shippingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  shippingName: z.string().min(1, "Shipping name is required"),
  shippingAddress: z.string().min(1, "Address is required"),
  shippingCity: z.string().min(1, "City is required"),
  shippingState: z.string().min(1, "State is required"),
  shippingZip: z.string().min(5, "Valid ZIP code is required"),
  shippingPhone: z.string().optional(),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

interface OrderConfig {
  tapeFormats: Record<TapeFormat, number>;
  totalTapes: number;
  estimatedHours: number;
  outputFormats: OutputFormat[];
  dvdQuantity?: number;
  tapeHandling: TapeHandling;
  processingSpeed: ProcessingSpeed;
  specialInstructions?: string;
  isGift?: boolean;
}

interface OrderPricing {
  basePrice: number;
  hourlyPrice: number;
  usbPrice: number;
  dvdPrice: number;
  cloudPrice: number;
  returnPrice: number;
  subtotal: number;
  rushFee: number;
  total: number;
}

const tapeFormatLabels: Record<TapeFormat, string> = {
  vhs: "VHS",
  vhsc: "VHS-C",
  hi8: "Hi8 / Video8",
  minidv: "MiniDV",
  betamax: "Betamax",
};

const outputFormatLabels: Record<OutputFormat, string> = {
  mp4: "Digital Download (MP4)",
  usb: "USB Flash Drive",
  dvd: "DVD Copies",
  cloud: "Cloud Storage",
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderConfig, setOrderConfig] = useState<OrderConfig | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const configParam = params.get("config");
    
    if (configParam) {
      try {
        const config = JSON.parse(decodeURIComponent(configParam));
        setOrderConfig(config);
        localStorage.setItem("orderConfig", JSON.stringify(config));
      } catch {
        const stored = localStorage.getItem("orderConfig");
        if (stored) {
          setOrderConfig(JSON.parse(stored));
        }
      }
    } else {
      const stored = localStorage.getItem("orderConfig");
      if (stored) {
        setOrderConfig(JSON.parse(stored));
      }
    }
  }, []);

  const pricing = useMemo<OrderPricing | null>(() => {
    if (!orderConfig) return null;
    
    const basePrice = orderConfig.totalTapes * PRICING.basePricePerTape;
    const hourlyPrice = orderConfig.estimatedHours * PRICING.pricePerHour;
    const usbPrice = orderConfig.outputFormats.includes("usb") ? PRICING.usbDrive : 0;
    const dvdPrice = orderConfig.outputFormats.includes("dvd") ? (orderConfig.dvdQuantity || 1) * PRICING.dvdPerDisc : 0;
    const cloudPrice = orderConfig.outputFormats.includes("cloud") ? PRICING.cloudStorage : 0;
    const returnPrice = orderConfig.tapeHandling === "return" ? PRICING.returnShipping : 0;
    
    const subtotal = basePrice + hourlyPrice + usbPrice + dvdPrice + cloudPrice + returnPrice;
    const rushFee = orderConfig.processingSpeed === "rush" ? subtotal * PRICING.rushMultiplier : 0;
    const total = subtotal + rushFee;

    return { basePrice, hourlyPrice, usbPrice, dvdPrice, cloudPrice, returnPrice, subtotal, rushFee, total };
  }, [orderConfig]);

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      shippingName: "",
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
      shippingPhone: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: ShippingFormValues) => {
      if (!orderConfig) throw new Error("Order configuration not found");
      
      const orderData = {
        ...orderConfig,
        ...data,
      };
      
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.removeItem("orderConfig");
      setLocation(`/order-confirmation?orderNumber=${data.orderNumber}&orderId=${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShippingFormValues) => {
    createOrderMutation.mutate(data);
  };

  if (!orderConfig || !pricing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Order Found</h2>
            <p className="text-muted-foreground mb-6">
              It looks like you haven't configured your order yet.
            </p>
            <Link href="/get-started">
              <Button data-testid="button-start-order">
                Start Your Order
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/get-started">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Configuration
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-8" data-testid="text-checkout-title">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Doe" 
                                {...field} 
                                data-testid="input-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="john@example.com" 
                                {...field} 
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <FormField
                      control={form.control}
                      name="shippingName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Name on shipping label" 
                              {...field} 
                              data-testid="input-shipping-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="123 Main St" 
                              {...field} 
                              data-testid="input-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingCity"
                        render={({ field }) => (
                          <FormItem className="col-span-2 md:col-span-2">
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="City" 
                                {...field} 
                                data-testid="input-city"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shippingState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="CA" 
                                {...field} 
                                data-testid="input-state"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shippingZip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="12345" 
                                {...field} 
                                data-testid="input-zip"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="shippingPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="(555) 123-4567" 
                              {...field} 
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={createOrderMutation.isPending}
                      data-testid="button-place-order"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Place Order - ${pricing.total.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Tapes</h4>
                  {Object.entries(orderConfig.tapeFormats)
                    .filter(([, qty]) => qty > 0)
                    .map(([format, qty]) => (
                      <div key={format} className="flex justify-between text-sm" data-testid={`text-tape-${format}`}>
                        <span>{tapeFormatLabels[format as TapeFormat]}</span>
                        <span>x{qty}</span>
                      </div>
                    ))}
                  <div className="flex justify-between text-sm font-medium mt-1">
                    <span>Total Tapes</span>
                    <span data-testid="text-total-tapes">{orderConfig.totalTapes}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Output Formats</h4>
                  {orderConfig.outputFormats.map((format) => (
                    <div key={format} className="text-sm" data-testid={`text-output-${format}`}>
                      {outputFormatLabels[format]}
                      {format === "dvd" && orderConfig.dvdQuantity && ` (x${orderConfig.dvdQuantity})`}
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Options</h4>
                  <div className="text-sm">
                    <span className="capitalize">{orderConfig.processingSpeed}</span> Processing
                  </div>
                  <div className="text-sm">
                    {orderConfig.tapeHandling === "return" ? "Return Tapes" : "Dispose of Tapes"}
                  </div>
                  <div className="text-sm">
                    Est. {orderConfig.estimatedHours} hours of footage
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Price ({orderConfig.totalTapes} tapes)</span>
                    <span data-testid="text-base-price">${pricing.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Footage ({orderConfig.estimatedHours} hrs)</span>
                    <span>${pricing.hourlyPrice.toFixed(2)}</span>
                  </div>
                  {pricing.usbPrice > 0 && (
                    <div className="flex justify-between">
                      <span>USB Drive</span>
                      <span>${pricing.usbPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.dvdPrice > 0 && (
                    <div className="flex justify-between">
                      <span>DVD Copies</span>
                      <span>${pricing.dvdPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.cloudPrice > 0 && (
                    <div className="flex justify-between">
                      <span>Cloud Storage</span>
                      <span>${pricing.cloudPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.returnPrice > 0 && (
                    <div className="flex justify-between">
                      <span>Return Shipping</span>
                      <span>${pricing.returnPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.rushFee > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>Rush Fee (50%)</span>
                      <span>${pricing.rushFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="text-total-price">${pricing.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
