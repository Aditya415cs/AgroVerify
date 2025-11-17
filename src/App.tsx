import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ExporterDashboard from "./pages/ExporterDashboard";
import ShipmentDetail from "./pages/ShipmentDetail";
import QADashboard from "./pages/QADashboard";
import Inspection from "./pages/Inspection";
import CertificateDetail from "./pages/CertificateDetail";
import Verify from "./pages/Verify";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/exporter/dashboard" element={<ExporterDashboard />} />
                <Route path="/exporter/shipment/:id" element={<ShipmentDetail />} />
                <Route path="/qa/dashboard" element={<QADashboard />} />
                <Route path="/qa/inspection/:shipmentId" element={<Inspection />} />
                <Route path="/certificate/:certificateId" element={<CertificateDetail />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
