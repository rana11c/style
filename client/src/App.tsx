import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Wardrobe from "@/pages/Wardrobe";
import Suggestions from "@/pages/Suggestions";
import Shopping from "@/pages/Shopping";
import Profile from "@/pages/Profile";
import { AuthProvider } from "./context/AuthContext";

// Create a protected route component
const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        setAuthenticated(res.ok);
      } catch (error) {
        setAuthenticated(false);
        console.error("Error checking auth:", error);
      }
    };
    
    checkAuth();
  }, []);
  
  // Show loading while checking
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (authenticated === false) {
    window.location.href = "/login";
    return null;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

function App() {
  const [dir, setDir] = useState("rtl");
  const [lang, setLang] = useState("ar");

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Switch>
          {/* Public routes */}
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />

          {/* Protected routes - only accessible when authenticated */}
          <Route path="/">
            <ProtectedRoutes>
              <Home />
            </ProtectedRoutes>
          </Route>
          
          <Route path="/wardrobe">
            <ProtectedRoutes>
              <Wardrobe />
            </ProtectedRoutes>
          </Route>
          
          <Route path="/suggestions">
            <ProtectedRoutes>
              <Suggestions />
            </ProtectedRoutes>
          </Route>
          
          <Route path="/shopping">
            <ProtectedRoutes>
              <Shopping />
            </ProtectedRoutes>
          </Route>
          
          <Route path="/profile">
            <ProtectedRoutes>
              <Profile />
            </ProtectedRoutes>
          </Route>

          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
