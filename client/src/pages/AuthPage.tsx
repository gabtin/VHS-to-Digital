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
    password: z.string().min(1, "Password obbligatoria"),
});

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "La password deve contenere almeno 8 caratteri"),
    firstName: z.string().min(1, "Nome obbligatorio"),
    lastName: z.string().min(1, "Cognome obbligatorio"),
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
                            Scegli il tuo metodo preferito per accedere
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full mb-6"
                            onClick={() => window.location.href = "/api/login/google"}
                        >
                            <SiGoogle className="mr-2 h-4 w-4" />
                            Accedi con Google
                        </Button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Oppure continua con email
                                </span>
                            </div>
                        </div>

                        <Tabs defaultValue="login">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="login">Accedi</TabsTrigger>
                                <TabsTrigger value="register">Registrati</TabsTrigger>
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
                                                        <Input placeholder="nome@esempio.it" {...field} />
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
                                                                    Password dimenticata?
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Reimposta Password</DialogTitle>
                                                                    <DialogDescription>
                                                                        Inserisci il tuo indirizzo email e ti invieremo un link per reimpostare la password.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="py-4">
                                                                    <Label htmlFor="forgot-email">Indirizzo Email</Label>
                                                                    <Input
                                                                        id="forgot-email"
                                                                        type="email"
                                                                        placeholder="nome@esempio.it"
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
                                                                        Invia Link di Reimpostazione
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
                                            Accedi
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
                                                        <FormLabel>Nome</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Mario" {...field} />
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
                                                        <FormLabel>Cognome</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Rossi" {...field} />
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
                                                        <Input placeholder="nome@esempio.it" {...field} />
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
                                            Crea Account
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
                        Preserva i Tuoi Ricordi per le Generazioni Future
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        memorieindigitale.it ti aiuta a digitalizzare le tue vecchie videocassette VHS con qualità premium e servizio professionale.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Formati Multipli</h4>
                            <p className="text-sm text-muted-foreground">Supporto per VHS, VHS-C, Hi8 e MiniDV.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold">Gestione Sicura</h4>
                            <p className="text-sm text-muted-foreground">Tracciamento completo e cura professionale per le tue cassette.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
