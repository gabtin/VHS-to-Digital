import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film, Loader2, KeyRound } from "lucide-react";
import { Link, useLocation } from "wouter";

const resetSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
    const { resetPasswordMutation } = useAuth();
    const [params] = useLocation();
    const token = new URLSearchParams(window.location.search).get("token");

    const form = useForm<ResetFormValues>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (data: ResetFormValues) => {
        if (!token) return;
        resetPasswordMutation.mutate({ token, password: data.password });
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive font-bold">Invalid Reset Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or has already been used.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/auth">
                            <Button className="w-full">Back to Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-md border-none shadow-none">
                    <div className="mb-8 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                            <Film className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">ReelRevive</span>
                    </div>

                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                        <CardDescription>
                            Enter a new password for your account.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-0 pt-6">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-9"
                                        {...form.register("password")}
                                    />
                                </div>
                                {form.formState.errors.password && (
                                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        className="pl-9"
                                        {...form.register("confirmPassword")}
                                    />
                                </div>
                                {form.formState.errors.confirmPassword && (
                                    <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={resetPasswordMutation.isPending}
                            >
                                {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="hidden lg:block relative overflow-hidden bg-primary/5">
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="max-w-lg space-y-6 text-center">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-accent/20 flex items-center justify-center">
                            <KeyRound className="w-10 h-10 text-accent" />
                        </div>
                        <h2 className="text-4xl font-bold text-foreground tracking-tight">
                            Secure Your Memories
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We take the security of your family history seriously. Refresh your credentials to keep your digitized legacy safe.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
