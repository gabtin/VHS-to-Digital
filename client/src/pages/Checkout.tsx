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
import { t } from "@/lib/translations";

const shippingFormSchema = z.object({
  name: z.string().min(1, "Nome obbligatorio"),
  email: z.string().email("Email valida obbligatoria"),
  shippingName: z.string().min(1, "Nome destinatario obbligatorio"),
  shippingAddress: z.string().min(1, "Indirizzo obbligatorio"),
  shippingCity: z.string().min(1, "Citta obbligatoria"),
  shippingState: z.string().min(2, "Provincia obbligatoria"),
  shippingZip: z.string().min(5, "CAP valido obbligatorio"),
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

  const createCheckoutMutation = useMutation({
    mutationFn: async (data: ShippingFormValues) => {
      if (!orderConfig || !pricing) throw new Error("Configurazione ordine non trovata");
      
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {
        orderConfig,
        shippingInfo: data,
        pricing: {
          subtotal: pricing.subtotal,
          rushFee: pricing.rushFee,
          total: pricing.total,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Errore",
          description: "Impossibile creare la sessione di pagamento",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile avviare il pagamento. Riprova.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShippingFormValues) => {
    createCheckoutMutation.mutate(data);
  };

  if (!orderConfig || !pricing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nessun Ordine Trovato</h2>
            <p className="text-muted-foreground mb-6">
              Sembra che tu non abbia ancora configurato il tuo ordine.
            </p>
            <Link href="/get-started">
              <Button data-testid="button-start-order">
                {t.nav.getStarted}
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
              {t.common.back}
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-8" data-testid="text-checkout-title">
          {t.checkout.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t.checkout.shippingTitle}</CardTitle>
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
                            <FormLabel>{t.checkout.fields.name}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Mario Rossi" 
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
                                placeholder="mario@esempio.it" 
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
                          <FormLabel>Nome Destinatario</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nome sull'etichetta di spedizione" 
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
                          <FormLabel>{t.checkout.fields.address}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Via Roma 123" 
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
                            <FormLabel>{t.checkout.fields.city}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Milano" 
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
                            <FormLabel>{t.checkout.fields.province}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="MI" 
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
                            <FormLabel>{t.checkout.fields.postalCode}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="20121" 
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
                          <FormLabel>{t.checkout.fields.phone}</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+39 02 1234 5678" 
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
                      className="w-full bg-accent text-accent-foreground"
                      disabled={createCheckoutMutation.isPending}
                      data-testid="button-place-order"
                    >
                      {createCheckoutMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Reindirizzamento al pagamento...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {t.checkout.payButton} - {pricing.total.toFixed(2)} EUR
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      {t.checkout.securePayment}
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t.checkout.paymentTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{t.wizard.sections.tapes}</h4>
                  {Object.entries(orderConfig.tapeFormats)
                    .filter(([, qty]) => qty > 0)
                    .map(([format, qty]) => (
                      <div key={format} className="flex justify-between text-sm" data-testid={`text-tape-${format}`}>
                        <span>{t.formats[format as TapeFormat].name}</span>
                        <span>x{qty}</span>
                      </div>
                    ))}
                  <div className="flex justify-between text-sm font-medium mt-1">
                    <span>{t.wizard.step2.totalTapes}</span>
                    <span data-testid="text-total-tapes">{orderConfig.totalTapes}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{t.wizard.sections.output}</h4>
                  {orderConfig.outputFormats.map((format) => (
                    <div key={format} className="text-sm" data-testid={`text-output-${format}`}>
                      {t.outputs[format].name}
                      {format === "dvd" && orderConfig.dvdQuantity && ` (x${orderConfig.dvdQuantity})`}
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Opzioni</h4>
                  <div className="text-sm">
                    {orderConfig.processingSpeed === "rush" ? t.wizard.step6.rushTitle : t.wizard.step6.standardTitle}
                  </div>
                  <div className="text-sm">
                    {orderConfig.tapeHandling === "return" ? t.wizard.step5.returnTitle : t.wizard.step5.disposeTitle}
                  </div>
                  <div className="text-sm">
                    Stima {orderConfig.estimatedHours} ore di filmato
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t.wizard.summary.baseCost} ({orderConfig.totalTapes} {t.wizard.summary.tapes})</span>
                    <span data-testid="text-base-price">{pricing.basePrice.toFixed(2)} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.wizard.summary.footage} ({orderConfig.estimatedHours} {t.wizard.summary.hours})</span>
                    <span>{pricing.hourlyPrice.toFixed(2)} EUR</span>
                  </div>
                  {pricing.usbPrice > 0 && (
                    <div className="flex justify-between">
                      <span>{t.wizard.summary.usbDrive}</span>
                      <span>{pricing.usbPrice.toFixed(2)} EUR</span>
                    </div>
                  )}
                  {pricing.dvdPrice > 0 && (
                    <div className="flex justify-between">
                      <span>{t.wizard.summary.dvdCopies}</span>
                      <span>{pricing.dvdPrice.toFixed(2)} EUR</span>
                    </div>
                  )}
                  {pricing.cloudPrice > 0 && (
                    <div className="flex justify-between">
                      <span>{t.wizard.summary.cloudStorage}</span>
                      <span>{pricing.cloudPrice.toFixed(2)} EUR</span>
                    </div>
                  )}
                  {pricing.returnPrice > 0 && (
                    <div className="flex justify-between">
                      <span>{t.wizard.summary.returnShipping}</span>
                      <span>{pricing.returnPrice.toFixed(2)} EUR</span>
                    </div>
                  )}
                  {pricing.rushFee > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>{t.wizard.summary.rushFee} (50%)</span>
                      <span>{pricing.rushFee.toFixed(2)} EUR</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Totale</span>
                  <span data-testid="text-total-price">{pricing.total.toFixed(2)} EUR</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
