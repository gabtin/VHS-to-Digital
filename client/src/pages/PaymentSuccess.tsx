import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Package, ArrowRight, AlertCircle, FileText } from "lucide-react";
import { t } from "@/lib/translations";
import { useCart } from "@/hooks/use-cart";

interface OrderResult {
  id: string;
  orderNumber: string;
}

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();

  const createOrderMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", "/api/stripe/verify-and-create-order", {
        sessionId,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Impossibile verificare il pagamento");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      setOrderResult(data.order);
      clearCart();
    },
    onError: (err: any) => {
      setError(err.message || "Impossibile creare l'ordine");
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (sessionId && !orderResult && !error) {
      createOrderMutation.mutate(sessionId);
    }
  }, []);

  if (createOrderMutation.isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-16 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-accent" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Elaborazione Ordine
            </h2>
            <p className="text-muted-foreground">
              Attendere la conferma del pagamento...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto" data-testid="card-payment-error">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Qualcosa e Andato Storto
            </h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Link href="/checkout">
              <Button className="bg-accent text-accent-foreground" data-testid="button-try-again">
                {t.common.retry}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orderResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              Nessuna sessione di pagamento trovata. Inizia un nuovo ordine.
            </p>
            <Link href="/get-started">
              <Button className="mt-4 bg-accent text-accent-foreground">
                {t.nav.getStarted}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg mx-auto" data-testid="card-payment-success">
        <CardContent className="py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-success-title">
            {t.paymentSuccess.title}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t.paymentSuccess.subtitle}
          </p>

          <div className="bg-secondary/50 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground mb-1">{t.paymentSuccess.orderNumber}</p>
            <p className="text-2xl font-mono font-bold text-foreground" data-testid="text-order-number">
              {orderResult.orderNumber}
            </p>
          </div>

          <div className="bg-card border rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              {t.paymentSuccess.nextSteps}
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {t.paymentSuccess.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/order/${orderResult.orderNumber}/label`}>
              <Button className="bg-accent text-accent-foreground" data-testid="button-view-label">
                <FileText className="w-4 h-4 mr-2" />
                {t.shippingLabel.viewButton}
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" data-testid="button-dashboard">
                {t.paymentSuccess.dashboardButton}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
