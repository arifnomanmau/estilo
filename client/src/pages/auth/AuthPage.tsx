import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  useEffect(() => {
    if (user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  const form = useForm<FormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues, isLogin: boolean) => {
    if (isLogin) {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 mb-8">
              Access the admin dashboard to manage portfolio items and testimonials.
            </p>
            
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login">
                  <TabsList className="mb-4">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                          {loginMutation.isPending ? "Logging in..." : "Login"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => onSubmit(data, false))} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Choose password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                          {registerMutation.isPending ? "Creating account..." : "Register"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="hidden md:block">
            <div className="h-full bg-gradient-to-br from-primary to-primary/80 rounded-lg p-8 text-white flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">Interior Design Management</h2>
              <ul className="space-y-4">
                <li className="flex items-center">
                  ✓ Manage portfolio projects
                </li>
                <li className="flex items-center">
                  ✓ Handle client testimonials
                </li>
                <li className="flex items-center">
                  ✓ Update service offerings
                </li>
                <li className="flex items-center">
                  ✓ Secure admin access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
