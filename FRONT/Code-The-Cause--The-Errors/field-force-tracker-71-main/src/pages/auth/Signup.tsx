import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Loader2,
  MapPin,
  User,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";

type UserRole = "ADMIN" | "MANAGER" | "WORKER";

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const roleOptions: RoleOption[] = [
  {
    value: "WORKER",
    label: "Volunteer / Worker",
    description: "Field staff who perform tasks and track attendance",
    icon: <User className="h-5 w-5" />,
  },
  {
    value: "MANAGER",
    label: "Manager",
    description: "Supervisors who manage teams and approve requests",
    icon: <Users className="h-5 w-5" />,
  },
  {
    value: "ADMIN",
    label: "Administrator",
    description: "Full system access with all administrative privileges",
    icon: <Shield className="h-5 w-5" />,
  },
];

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "" as UserRole | "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.firstname.trim()) return "First name is required";
    if (!formData.lastname.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.email.includes("@")) return "Please enter a valid email";
    if (!formData.phone.trim()) return "Phone number is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    if (!formData.role) return "Please select a role";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.signup({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role as UserRole,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-border/50">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Registration Successful!
              </h2>
              <p className="text-muted-foreground">
                Your account has been created. Redirecting to login...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 py-8">
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
                Create Account
              </CardTitle>
              <CardDescription className="mt-1">
                Join Field Force Tracker today
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

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstname">First Name</Label>
                  <Input
                    id="firstname"
                    placeholder="John"
                    value={formData.firstname}
                    onChange={(e) => handleChange("firstname", e.target.value)}
                    disabled={isSubmitting}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input
                    id="lastname"
                    placeholder="Doe"
                    value={formData.lastname}
                    onChange={(e) => handleChange("lastname", e.target.value)}
                    disabled={isSubmitting}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  autoComplete="email"
                  disabled={isSubmitting}
                  className="h-11"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={isSubmitting}
                  className="h-11"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Select Your Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange("role", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose your role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          {role.icon}
                          <div>
                            <span className="font-medium">{role.label}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.role && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {
                      roleOptions.find((r) => r.value === formData.role)
                        ?.description
                    }
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  autoComplete="new-password"
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Terms hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
