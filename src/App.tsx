import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Briefs from "./pages/Briefs.tsx";
import ProfilePage from "./pages/Profile.tsx";
import HomePage from "./pages/Home.tsx";
import PodRoom from "./pages/PodRoom.tsx";
import EagleEye from "./pages/EagleEye.tsx";
import GameTheoryRoom from "./pages/GameTheoryRoom.tsx";

const queryClient = new QueryClient();

// Android bundles are served at https://localhost. Hash routes survive native
// WebView navigation, while the existing web deployment retains clean URLs.
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/briefs" element={<Briefs />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/pod-room" element={<PodRoom />} />
          <Route path="/eagle-eye" element={<EagleEye />} />
          <Route path="/game-theory" element={<GameTheoryRoom />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
