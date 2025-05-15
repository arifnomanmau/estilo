import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { API_PATHS } from "@/lib/config";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { LoginDebug } from "@/components/LoginDebug";
import { AuthDebug } from "@/components/AuthDebug";
import { motion } from "framer-motion";
import { Lock, User, LogIn } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { loginMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    try {
      console.log("Validating login data");
      const validatedData = loginSchema.parse(data);
      
      console.log("Attempting login with:", validatedData.username);
      console.log("Using login endpoint:", API_PATHS.LOGIN);
      
      try {
        // Try logging in through the auth hook - this should set all user data correctly
        const result = await loginMutation.mutateAsync(validatedData);
        
        console.log("Login result:", result);
        
        if (result && result.isAdmin) {
          console.log("Admin login successful, navigating to dashboard");
          toast({
            title: "Login successful",
            description: "Welcome to the admin dashboard",
          });
          
          // Set a timeout to ensure state has time to update
          setTimeout(() => {
            // Force refresh the stored user data
            localStorage.setItem('user', JSON.stringify(result));
            // Navigate to the admin page
            navigate("/admin");
          }, 100);
        } else {
          console.error("User is not an admin:", result);
          setErrorMessage("You must be an admin to access this page");
          toast({
            title: "Access denied",
            description: "You must be an admin to access this page",
            variant: "destructive",
          });
        }
      } catch (loginError: any) {
        console.error("Login mutation error:", loginError);
        
        // Show helpful error messages based on the error
        let errorMsg = loginError.message || "Login failed. Please check your credentials.";
        
        if (errorMsg.includes("401")) {
          errorMsg = "Invalid username or password.";
        } else if (errorMsg.includes("500")) {
          errorMsg = "Server error. Please try again later.";
        } else if (errorMsg.includes("Network") || errorMsg.includes("fetch")) {
          errorMsg = "Network error. Please check your connection.";
        }
        
        setErrorMessage(errorMsg);
        toast({
          title: "Login failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Form validation error:', error);
      
      let errorMsg = "Invalid input. Please check your entries.";
      if (error.errors && error.errors.length > 0) {
        errorMsg = error.errors[0].message;
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "Validation error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // High-quality modern interior design image for background
  const loginBgImage = "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=1980";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${loginBgImage})` }}
      />
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="max-w-md w-full z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-xl overflow-hidden"
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Admin Login
              </h2>
              <p className="text-gray-500 mt-2">
                Please enter your credentials to access the admin panel
              </p>
            </div>
            
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                {errorMessage}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      placeholder="Enter your username"
                      defaultValue="admin"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign in
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Default credentials:</p>
              <p className="font-semibold">Username: admin / Password: admin123</p>
            </div>
          </div>
          
          {process.env.NODE_ENV !== 'production' && (
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <LoginDebug />
              <div className="mt-4">
                <AuthDebug />
              </div>
            </div>
          )}
        </motion.div>
        
        <p className="mt-4 text-center text-sm text-white">
          <a href="/" className="font-medium hover:text-amber-300 transition-colors">
            Return to website
          </a>
        </p>
      </div>
    </div>
  );
} 

