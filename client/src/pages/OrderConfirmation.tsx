import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";

export default function OrderConfirmation() {
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get("orderNumber");
  const orderId = params.get("orderId");

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Order Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find your order details.
            </p>
            <Link href="/">
              <Button data-testid="button-go-home">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-confirmation-title">
            Order Placed Successfully
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Thank you for your order! We'll send you an email with shipping instructions shortly.
          </p>

          <div className="bg-secondary/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="text-xl font-mono font-semibold" data-testid="text-order-number">
              {orderNumber}
            </p>
          </div>

          <div className="space-y-3">
            <Link href={`/order/${orderId}`}>
              <Button className="w-full" data-testid="button-track-order">
                Track Your Order
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full" data-testid="button-home">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
            <h3 className="font-medium text-foreground mb-2">What's Next?</h3>
            <ol className="text-left space-y-2">
              <li>1. You'll receive an email with a prepaid shipping label</li>
              <li>2. Pack your tapes securely and ship them to us</li>
              <li>3. We'll notify you when we receive your tapes</li>
              <li>4. Track the progress of your digitization online</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
