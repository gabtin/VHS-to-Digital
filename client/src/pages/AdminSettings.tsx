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
import { Loader2, Save, RefreshCw, Plus, Trash2 } from "lucide-react";
import type { PricingConfig, ProductAvailability } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        mutationFn: async ({ name, data }: { name: string; data: Partial<ProductAvailability> }) => {
            await apiRequest("PATCH", `/api/admin/availability/${name}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/availability"] });
            toast({ title: "Availability updated", description: "Changes have been saved successfully." });
        },
    });

    const createAvailabilityMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/admin/availability", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/availability"] });
            toast({ title: "Service added", description: "New service has been added successfully." });
            setIsAddDialogOpen(false);
        },
    });

    const deleteAvailabilityMutation = useMutation({
        mutationFn: async (name: string) => {
            await apiRequest("DELETE", `/api/admin/availability/${name}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/availability"] });
            toast({ title: "Service deleted", description: "Service has been removed." });
        },
    });

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newService, setNewService] = useState({
        name: "",
        label: "",
        type: "output_format",
        price: "0",
        isActive: true
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
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <SidebarTrigger />
                                <h1 className="text-xl font-semibold">Settings</h1>
                            </div>
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Service
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Service</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select
                                                value={newService.type}
                                                onValueChange={(val) => setNewService(prev => ({ ...prev, type: val }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tape_format">Tape Format</SelectItem>
                                                    <SelectItem value="output_format">Output Option</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="s-name">System Name (ID)</Label>
                                            <Input
                                                id="s-name"
                                                placeholder="e.g. blu-ray"
                                                value={newService.name}
                                                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="s-label">Display Label</Label>
                                            <Input
                                                id="s-label"
                                                placeholder="e.g. Blu-ray Disc"
                                                value={newService.label}
                                                onChange={(e) => setNewService(prev => ({ ...prev, label: e.target.value }))}
                                            />
                                        </div>
                                        {newService.type === "output_format" && (
                                            <div className="space-y-2">
                                                <Label htmlFor="s-price">Price (EUR)</Label>
                                                <Input
                                                    id="s-price"
                                                    type="number"
                                                    value={newService.price}
                                                    onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={() => createAvailabilityMutation.mutate(newService)}>Create Service</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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
                                        <div className="grid grid-cols-1 gap-4">
                                            {tapeAvailability.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-background">
                                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-muted-foreground">Label</p>
                                                            <Input
                                                                defaultValue={item.label || item.name}
                                                                className="h-8"
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== item.label) {
                                                                        updateAvailabilityMutation.mutate({ name: item.name, data: { label: e.target.value } });
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-muted-foreground">ID</p>
                                                            <code className="text-sm px-1 bg-muted rounded">{item.name}</code>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={item.isActive}
                                                            onCheckedChange={(checked) => updateAvailabilityMutation.mutate({ name: item.name, data: { isActive: checked } })}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive h-8 w-8"
                                                            onClick={() => {
                                                                if (confirm("Are you sure? This may affect existing orders if deleted.")) {
                                                                    deleteAvailabilityMutation.mutate(item.name);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="text-sm font-medium">Output Options</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {outputAvailability.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-background">
                                                    <div className="flex-1 grid grid-cols-3 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-muted-foreground">Label</p>
                                                            <Input
                                                                defaultValue={item.label || item.name}
                                                                className="h-8"
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== item.label) {
                                                                        updateAvailabilityMutation.mutate({ name: item.name, data: { label: e.target.value } });
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-muted-foreground">Price (EUR)</p>
                                                            <Input
                                                                type="number"
                                                                defaultValue={item.price || "0"}
                                                                className="h-8"
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== item.price) {
                                                                        updateAvailabilityMutation.mutate({ name: item.name, data: { price: e.target.value } });
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-muted-foreground">ID</p>
                                                            <code className="text-sm px-1 bg-muted rounded">{item.name}</code>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={item.isActive}
                                                            onCheckedChange={(checked) => updateAvailabilityMutation.mutate({ name: item.name, data: { isActive: checked } })}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive h-8 w-8"
                                                            onClick={() => {
                                                                if (confirm("Are you sure? This may affect existing orders if deleted.")) {
                                                                    deleteAvailabilityMutation.mutate(item.name);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
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
