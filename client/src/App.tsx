import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import GetStarted from "@/pages/GetStarted";
import Dashboard from "@/pages/Dashboard";
import OrderStatus from "@/pages/OrderStatus";
import Admin from "@/pages/Admin";
import AdminOrders from "@/pages/AdminOrders";
import AdminOrderDetail from "@/pages/AdminOrderDetail";
import AdminSettings from "@/pages/AdminSettings";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import PaymentSuccess from "@/pages/PaymentSuccess";
import ShippingLabel from "@/pages/ShippingLabel";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <CustomerLayout>
          <Home />
        </CustomerLayout>
      </Route>
      <Route path="/pricing">
        <CustomerLayout>
          <Pricing />
        </CustomerLayout>
      </Route>
      <Route path="/about">
        <CustomerLayout>
          <About />
        </CustomerLayout>
      </Route>
      <Route path="/get-started">
        <CustomerLayout>
          <GetStarted />
        </CustomerLayout>
      </Route>
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <CustomerLayout>
            <Dashboard />
          </CustomerLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/order/:id">
        <CustomerLayout>
          <OrderStatus />
        </CustomerLayout>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <CustomerLayout>
            <ProfilePage />
          </CustomerLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/checkout">
        <ProtectedRoute>
          <CustomerLayout>
            <Checkout />
          </CustomerLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/order-confirmation">
        <CustomerLayout>
          <OrderConfirmation />
        </CustomerLayout>
      </Route>
      <Route path="/payment-success">
        <CustomerLayout>
          <PaymentSuccess />
        </CustomerLayout>
      </Route>
      <Route path="/order/:orderNumber/label">
        <CustomerLayout>
          <ShippingLabel />
        </CustomerLayout>
      </Route>
      <Route path="/admin" component={Admin} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/orders/:id" component={AdminOrderDetail} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/customers" component={Admin} />
      <Route>
        <CustomerLayout>
          <NotFound />
        </CustomerLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
