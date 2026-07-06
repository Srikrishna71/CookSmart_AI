import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const RecipeFeed = lazy(() => import("./pages/RecipeFeed"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const CreateRecipe = lazy(() => import("./pages/CreateRecipe"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const AIKitchen = lazy(() => import("./pages/AIKitchen"));
const EditRecipe = lazy(() => import("./pages/EditRecipe"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/recipes" element={<RecipeFeed />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/create" element={<CreateRecipe />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/ai-kitchen" element={<AIKitchen />} />
                <Route path="/recipe/:id/edit" element={<EditRecipe />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

