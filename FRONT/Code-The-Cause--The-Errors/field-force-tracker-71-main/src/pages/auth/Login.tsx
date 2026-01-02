import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: authLoading } = useAuth();

  const roleParam = new URLSearchParams(location.search).get("role")?.toUpperCase() || null;
  const roleLabel =
    roleParam === "ADMIN"
      ? "Administrator"
      : roleParam === "MANAGER"
      ? "Supervisor"
      : roleParam === "WORKER"
      ? "Volunteer"
      : null;

  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the redirect path from location state or default based on role
  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);

      // Navigate based on user role (handled by API response)
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === "ADMIN") {
          navigate("/admin", { replace: true });
        } else if (user.role === "MANAGER") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/volunteer", { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center space-y-4 pb-2">
            {/* Logo/Brand */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {roleLabel ? `${roleLabel} Login` : "Field Force Tracker"}
              </CardTitle>
              <CardDescription className="mt-1">
                {roleLabel ? `Sign in as ${roleLabel}` : "Sign in to access your dashboard"}
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isSubmitting}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className="h-11"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Request access
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Demo credentials hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Demo credentials:{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">
              admin@ecoforce.com
            </code>{" "}
            /{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">
              password123
            </code>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
