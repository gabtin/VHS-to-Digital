import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, User, Phone, MapPin, Trash2, ShieldAlert } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
    defaultAddress: z.string().optional(),
    defaultCity: z.string().optional(),
    defaultState: z.string().optional(),
    defaultZip: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, updateProfileMutation, deleteAccountMutation } = useAuth();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            phone: user?.phone || "",
            defaultAddress: user?.defaultAddress || "",
            defaultCity: user?.defaultCity || "",
            defaultState: user?.defaultState || "",
            defaultZip: user?.defaultZip || "",
        },
    });

    const onSave = (data: ProfileFormValues) => {
        updateProfileMutation.mutate(data);
    };

    const onDelete = () => {
        deleteAccountMutation.mutate();
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

                <div className="grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and contact information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" {...form.register("firstName")} />
                                        {form.formState.errors.firstName && (
                                            <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" {...form.register("lastName")} />
                                        {form.formState.errors.lastName && (
                                            <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="phone" className="pl-9" {...form.register("phone")} />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Default Shipping Address
                                    </h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="defaultAddress">Address</Label>
                                        <Input id="defaultAddress" {...form.register("defaultAddress")} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="defaultCity">City</Label>
                                            <Input id="defaultCity" {...form.register("defaultCity")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="defaultState">State/Province</Label>
                                            <Input id="defaultState" {...form.register("defaultState")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="defaultZip">ZIP/Postal Code</Label>
                                            <Input id="defaultZip" {...form.register("defaultZip")} />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="w-full md:w-auto"
                                >
                                    {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                                <Trash2 className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Once you delete your account, there is no going back. Please be certain.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Delete Account</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={onDelete}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
