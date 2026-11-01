import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Briefs from "./pages/Briefs";
import ProfilePage from "./pages/Profile";
import HomePage from "./pages/Home";
import PodRoom from "./pages/PodRoom";
import EagleEye from "./pages/EagleEye";
import GameTheoryRoom from "./pages/GameTheoryRoom";

const queryClient = new QueryClient();
const protect = (page: React.ReactNode) => <ProtectedRoute>{page}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={protect(<Index />)} />
            <Route path="/dashboard" element={protect(<Index />)} />
            <Route path="/briefs" element={protect(<Briefs />)} />
            <Route path="/profile" element={protect(<ProfilePage />)} />
            <Route path="/home" element={protect(<HomePage />)} />
            <Route path="/pod-room" element={protect(<PodRoom />)} />
            <Route path="/eagle-eye" element={protect(<EagleEye />)} />
            <Route path="/game-theory" element={protect(<GameTheoryRoom />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;
