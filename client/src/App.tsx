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
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import PaymentSuccess from "@/pages/PaymentSuccess";
import ShippingLabel from "@/pages/ShippingLabel";

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
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
      <Route path="/dashboard">
        <CustomerLayout>
          <Dashboard />
        </CustomerLayout>
      </Route>
      <Route path="/order/:id">
        <CustomerLayout>
          <OrderStatus />
        </CustomerLayout>
      </Route>
      <Route path="/checkout">
        <CustomerLayout>
          <Checkout />
        </CustomerLayout>
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
