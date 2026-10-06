import { Routes, Route } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Locations from "@/pages/Locations";
import LocationDetail from "@/pages/LocationDetail";
import Maintenance from "@/pages/Maintenance";
import CaseStudies from "@/pages/CaseStudies";
import Contact from "@/pages/Contact";
import AiConsultant from "@/pages/AiConsultant";
import AiLandscapeDesigner from "@/pages/AiLandscapeDesigner";
import AiPlantDoctor from "@/pages/AiPlantDoctor";
import AiPlantFinder from "@/pages/AiPlantFinder";
import AiProposal from "@/pages/AiProposal";
import AiVisualizer from "@/pages/AiVisualizer";
import Admin from "@/pages/Admin";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/locations/:slug" element={<LocationDetail />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ai-consultant" element={<AiConsultant />} />
          <Route path="/ai-landscape-designer" element={<AiLandscapeDesigner />} />
          <Route path="/ai-plant-doctor" element={<AiPlantDoctor />} />
          <Route path="/ai-plant-finder" element={<AiPlantFinder />} />
          <Route path="/ai-proposal-generator" element={<AiProposal />} />
          <Route path="/ai-visualizer" element={<AiVisualizer />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFloat />
      <Toaster />
    </div>
  );
}
