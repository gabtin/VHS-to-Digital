import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Film, Loader2, CheckCircle2, XCircle, MailOpen } from "lucide-react";
import { Link } from "wouter";

export default function VerifyEmailPage() {
    const { verifyEmailMutation, user } = useAuth();
    const [, setLocation] = useLocation();
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const token = new URLSearchParams(window.location.search).get("token");

    useEffect(() => {
        if (token) {
            verifyEmailMutation.mutate(token, {
                onSuccess: () => setStatus('success'),
                onError: () => setStatus('error')
            });
        }
    }, [token]);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive font-bold flex items-center justify-center gap-2">
                            <XCircle className="w-6 h-6" /> Invalid Link
                        </CardTitle>
                        <CardDescription>
                            This email verification link is invalid or has already been used.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button className="w-full">Back to Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="max-w-md w-full text-center shadow-lg border-none">
                <CardHeader className="pt-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        {status === 'pending' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
                        {status === 'success' && <CheckCircle2 className="w-8 h-8 text-green-500" />}
                        {status === 'error' && <XCircle className="w-8 h-8 text-destructive" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {status === 'pending' && "Verifying your email..."}
                        {status === 'success' && "Email Verified!"}
                        {status === 'error' && "Verification Failed"}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        {status === 'pending' && "Please wait while we confirm your email address."}
                        {status === 'success' && "Your email has been successfully verified. You now have full access to ReelRevive."}
                        {status === 'error' && "The verification token is invalid or has expired."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-10 pt-4">
                    {status === 'success' && (
                        <div className="space-y-4">
                            <Button className="w-full h-12 text-lg font-semibold" onClick={() => setLocation(user ? "/dashboard" : "/auth")}>
                                {user ? "Go to Dashboard" : "Sign In Now"}
                            </Button>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="space-y-4">
                            <Link href="/auth">
                                <Button variant="outline" className="w-full">Back to Login</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
