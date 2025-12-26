import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SiGoogle } from "react-icons/si";
import { Loader2, KeyRound } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { t } from "@/lib/translations";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});

export default function AuthPage() {
    const [, setLocation] = useLocation();
    const { user, loginMutation, registerMutation, forgotPasswordMutation } = useAuth();
    const [forgotEmail, setForgotEmail] = useState("");

    if (user) {
        setLocation("/");
        return null;
    }

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: "", password: "", firstName: "", lastName: "" },
    });

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t.nav.login}
                        </CardTitle>
                        <CardDescription>
                            Choose your preferred method to sign in
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full mb-6"
                            onClick={() => window.location.href = "/api/login/google"}
                        >
                            <SiGoogle className="mr-2 h-4 w-4" />
                            Sign in with Google
                        </Button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with email
                                </span>
                            </div>
                        </div>

                        <Tabs defaultValue="login">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <Form {...loginForm}>
                                    <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                                        <FormField
                                            control={loginForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="name@example.com" {...field} />
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
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel>Password</FormLabel>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" className="px-0 font-normal text-xs h-auto underline-offset-4 hover:underline text-primary hover:bg-transparent">
                                                                    Forgot password?
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Reset Password</DialogTitle>
                                                                    <DialogDescription>
                                                                        Enter your email address and we'll send you a link to reset your password.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="py-4">
                                                                    <Label htmlFor="forgot-email">Email Address</Label>
                                                                    <Input
                                                                        id="forgot-email"
                                                                        type="email"
                                                                        placeholder="name@example.com"
                                                                        value={forgotEmail}
                                                                        onChange={(e) => setForgotEmail(e.target.value)}
                                                                    />
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button
                                                                        onClick={() => forgotPasswordMutation.mutate(forgotEmail)}
                                                                        disabled={forgotPasswordMutation.isPending || !forgotEmail}
                                                                    >
                                                                        {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                        Send Reset Link
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                                            {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Sign In
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>

                            <TabsContent value="register">
                                <Form {...registerForm}>
                                    <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={registerForm.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>First Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={registerForm.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Doe" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={registerForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="name@example.com" {...field} />
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
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                                            {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create Account
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            <div className="hidden lg:flex flex-col justify-center p-12 bg-muted">
                <div className="max-w-lg space-y-6">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Preserve Your Memories for Generations
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        ReelRevive helps you digitize your old VHS tapes with premium quality and white-glove service.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Multiple Formats</h4>
                            <p className="text-sm text-muted-foreground">VHS, VHS-C, Hi8, and MiniDV support.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold">Secure Handling</h4>
                            <p className="text-sm text-muted-foreground">Full tracking and professional care for your tapes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
