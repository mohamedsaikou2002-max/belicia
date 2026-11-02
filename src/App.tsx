import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AccountRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {[
        ["/", <Index />], ["/briefs", <Briefs />], ["/profile", <ProfilePage />],
        ["/home", <HomePage />], ["/pod-room", <PodRoom />],
        ["/eagle-eye", <EagleEye />], ["/game-theory", <GameTheoryRoom />],
      ].map(([path, page]) => (
        <Route key={path as string} path={path as string} element={
          <ProtectedRoute><div key={user?.id}>{page}</div></ProtectedRoute>
        } />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider><AccountRoutes /></AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
