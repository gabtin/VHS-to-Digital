import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Printer, Download, Package, MapPin } from "lucide-react";
import type { Order } from "@shared/schema";
import { t } from "@/lib/translations";

export default function ShippingLabel() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["/api/orders/number", orderNumber],
    queryFn: async () => {
      const res = await fetch(`/api/orders/number/${orderNumber}`);
      if (!res.ok) throw new Error("Ordine non trovato");
      return res.json();
    },
    enabled: !!orderNumber,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ordine Non Trovato</h2>
            <p className="text-muted-foreground mb-6">
              Non siamo riusciti a trovare questo ordine.
            </p>
            <Link href="/dashboard">
              <Button>Vai alla Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 print:p-0">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.common.back}
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} data-testid="button-print">
              <Printer className="w-4 h-4 mr-2" />
              {t.shippingLabel.printButton}
            </Button>
          </div>
        </div>

        <Card className="print:shadow-none print:border-2 print:border-black" data-testid="card-shipping-label">
          <CardHeader className="border-b print:border-black">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{t.shippingLabel.title}</CardTitle>
              <span className="text-sm text-muted-foreground print:text-black">
                {order.orderNumber}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x print:divide-black">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-muted-foreground print:text-black">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {t.shippingLabel.returnAddress}
                  </span>
                </div>
                <div className="text-lg font-semibold mb-1">
                  {order.shippingName}
                </div>
                <div className="text-foreground">
                  {order.shippingAddress}
                </div>
                <div className="text-foreground">
                  {order.shippingZip} {order.shippingCity} ({order.shippingState})
                </div>
                <div className="text-foreground">
                  Italia
                </div>
                {order.shippingPhone && (
                  <div className="text-muted-foreground mt-2 print:text-black">
                    Tel: {order.shippingPhone}
                  </div>
                )}
              </div>

              <div className="p-6 bg-secondary/50 print:bg-gray-100">
                <div className="flex items-center gap-2 mb-4 text-muted-foreground print:text-black">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {t.shippingLabel.toAddress}
                  </span>
                </div>
                <div className="text-lg font-semibold mb-1">
                  ReelRevive Italia
                </div>
                <div className="text-foreground">
                  Via dei Ricordi 123
                </div>
                <div className="text-foreground">
                  20121 Milano (MI)
                </div>
                <div className="text-foreground">
                  Italia
                </div>
                <div className="text-muted-foreground mt-2 print:text-black">
                  Tel: +39 02 1234 5678
                </div>
              </div>
            </div>

            <div className="border-t print:border-black p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground print:text-black">{t.paymentSuccess.orderNumber}:</span>
                  <span className="ml-2 font-mono font-semibold">{order.orderNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground print:text-black">Cassette:</span>
                  <span className="ml-2 font-semibold">{order.totalTapes}</span>
                </div>
              </div>
            </div>

            <div className="border-t print:border-black p-6 bg-accent/10 print:bg-gray-50">
              <h4 className="font-semibold mb-3">{t.shippingLabel.instructions}</h4>
              <ol className="space-y-2 text-sm text-muted-foreground print:text-black">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground print:text-black">1.</span>
                  Stampa questa etichetta
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground print:text-black">2.</span>
                  Ritaglia lungo i bordi
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground print:text-black">3.</span>
                  Incolla l'etichetta sul pacco contenente le cassette
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground print:text-black">4.</span>
                  Porta il pacco all'ufficio postale o chiedi il ritiro a domicilio
                </li>
              </ol>
            </div>

            <div className="border-t print:border-black p-6">
              <div className="text-center text-xs text-muted-foreground print:text-black">
                <p className="mb-1">Grazie per aver scelto ReelRevive!</p>
                <p>Per assistenza: info@reelrevive.it | +39 02 1234 5678</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center print:hidden">
          <p className="text-sm text-muted-foreground mb-4">
            Dopo aver stampato l'etichetta, porta il pacco all'ufficio postale piu vicino.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">
              Torna alla Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          [data-testid="card-shipping-label"],
          [data-testid="card-shipping-label"] * {
            visibility: visible;
          }
          [data-testid="card-shipping-label"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
