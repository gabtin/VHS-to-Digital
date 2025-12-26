import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Loader2, Save, RefreshCw } from "lucide-react";
import type { PricingConfig, ProductAvailability } from "@shared/schema";

export default function AdminSettings() {
    const { toast } = useToast();

    const { data: pricing, isLoading: pricingLoading } = useQuery<PricingConfig[]>({
        queryKey: ["/api/admin/pricing"],
    });

    const { data: availability, isLoading: availabilityLoading } = useQuery<ProductAvailability[]>({
        queryKey: ["/api/admin/availability"],
    });

    const updatePricingMutation = useMutation({
        mutationFn: async ({ key, value }: { key: string; value: string }) => {
            await apiRequest("PATCH", `/api/admin/pricing/${key}`, { value });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing"] });
            toast({ title: "Pricing updated", description: "Changes have been saved successfully." });
        },
        onError: () => {
            toast({ title: "Update failed", variant: "destructive", description: "Could not save pricing changes." });
        },
    });

    const updateAvailabilityMutation = useMutation({
        mutationFn: async ({ name, isActive }: { name: string; isActive: boolean }) => {
            await apiRequest("PATCH", `/api/admin/availability/${name}`, { isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/availability"] });
            toast({ title: "Availability updated", description: "Changes have been saved successfully." });
        },
    });

    const isLoading = pricingLoading || availabilityLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const tapeAvailability = availability?.filter(a => a.type === "tape_format") || [];
    const outputAvailability = availability?.filter(a => a.type === "output_format") || [];

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <AdminSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h1 className="text-xl font-semibold">Settings</h1>
                        </div>
                    </header>

                    <main className="flex-1 overflow-auto p-6 bg-muted/30">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Pricing Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing Scheme</CardTitle>
                                    <CardDescription>Adjust the costs for various services and options.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {pricing?.map((config) => (
                                            <div key={config.id} className="space-y-2">
                                                <Label htmlFor={config.key}>{config.description}</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id={config.key}
                                                        defaultValue={config.value}
                                                        type="number"
                                                        step="0.01"
                                                        onBlur={(e) => {
                                                            if (e.target.value !== config.value) {
                                                                updatePricingMutation.mutate({ key: config.key, value: e.target.value });
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Availability Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Service Availability</CardTitle>
                                    <CardDescription>Toggle which formats and products are currently offered to customers.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium">Tape Formats</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {tapeAvailability.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                                    <Label className="capitalize">{item.name}</Label>
                                                    <Switch
                                                        checked={item.isActive}
                                                        onCheckedChange={(checked) => updateAvailabilityMutation.mutate({ name: item.name, isActive: checked })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="text-sm font-medium">Output Options</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {outputAvailability.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                                    <Label className="capitalize">{item.name}</Label>
                                                    <Switch
                                                        checked={item.isActive}
                                                        onCheckedChange={(checked) => updateAvailabilityMutation.mutate({ name: item.name, isActive: checked })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
