import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Package, ArrowRight, AlertCircle } from "lucide-react";

interface OrderResult {
  id: string;
  orderNumber: string;
}

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const sessionRes = await fetch(`/api/stripe/session/${sessionId}`);
      if (!sessionRes.ok) throw new Error("Failed to retrieve session");
      const { session } = await sessionRes.json();
      
      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      const orderConfig = JSON.parse(session.metadata.orderConfig);
      const shippingInfo = JSON.parse(session.metadata.shippingInfo);
      
      const response = await apiRequest("POST", "/api/orders", {
        ...orderConfig,
        ...shippingInfo,
        stripeSessionId: sessionId,
        paymentStatus: "paid",
      });
      
      return await response.json();
    },
    onSuccess: (data) => {
      setOrderResult(data);
      localStorage.removeItem("orderConfig");
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create order");
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
              Processing Your Order
            </h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment...
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
              Something Went Wrong
            </h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Link href="/checkout">
              <Button className="bg-accent text-accent-foreground" data-testid="button-try-again">
                Try Again
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
              No payment session found. Please start a new order.
            </p>
            <Link href="/get-started">
              <Button className="mt-4 bg-accent text-accent-foreground">
                Start New Order
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
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We've received your payment.
          </p>
          
          <div className="bg-secondary/50 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="text-2xl font-mono font-bold text-foreground" data-testid="text-order-number">
              {orderResult.orderNumber}
            </p>
          </div>

          <div className="bg-card border rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              What's Next?
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">1.</span>
                Check your email for shipping instructions
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">2.</span>
                Pack your tapes securely and ship them to us
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">3.</span>
                We'll notify you when we receive your tapes
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">4.</span>
                Your digital files will be ready in 7-10 business days
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/order/${orderResult.id}`}>
              <Button className="bg-accent text-accent-foreground" data-testid="button-track-order">
                Track Your Order
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" data-testid="button-return-home">
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
