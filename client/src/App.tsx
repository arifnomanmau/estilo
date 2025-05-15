import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";
import Calculator from "@/pages/Calculator";
import Contact from "@/pages/Contact";
import AuthPage from "@/pages/auth/AuthPage";
import Dashboard from "@/pages/admin/Dashboard";
import NotFound from "@/pages/not-found";
import Booking from "@/pages/Booking"; // Added import

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/booking" component={Booking} />
      <Route path="/contact" component={Contact} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/admin" component={Dashboard} />
      <Route path="/admin/dashboard">
        {() => <Redirect to="/admin" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Layout>
            <Router />
        </Layout>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;