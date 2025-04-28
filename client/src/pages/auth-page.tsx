import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Scissors } from "lucide-react";

const authSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  
  const loginForm = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onLogin = (data: AuthFormValues) => {
    loginMutation.mutate(data);
  };
  
  const onRegister = (data: AuthFormValues) => {
    registerMutation.mutate(data);
  };
  
  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row">
        {/* Left column - Auth form */}
        <div className="flex-1 w-full lg:max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center justify-center lg:justify-start">
              <Scissors className="h-6 w-6 mr-2 text-primary" />
              Tailor Management
            </h1>
            <p className="mt-2 text-slate-600">Sign in to your account to manage client profiles</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Enter your credentials to access the tailor management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-slate-600">
              {activeTab === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setActiveTab("register")}
                  >
                    Register
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setActiveTab("login")}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {/* Right column - Hero section */}
        <div className="flex-1 hidden lg:flex items-center justify-center p-10 bg-primary-50 rounded-r-lg">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Tailor Management System
            </h2>
            <p className="text-slate-600 mb-6">
              A comprehensive solution for tailors to manage client profiles, dress types, and measurements in one place.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0 rounded-full p-1 bg-primary-100 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-slate-700">Manage client profiles with contact information</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 rounded-full p-1 bg-primary-100 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-slate-700">Store different dress types with custom measurements</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 rounded-full p-1 bg-primary-100 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-slate-700">Track style preferences and special notes</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 rounded-full p-1 bg-primary-100 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-slate-700">Easy search and filter for finding clients quickly</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
