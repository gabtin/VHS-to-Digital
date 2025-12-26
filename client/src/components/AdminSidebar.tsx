import { Link, useLocation } from "wouter";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Package,
    Users,
    Settings,
    Film,
} from "lucide-react";

export function AdminSidebar() {
    const [location] = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
        { icon: Package, label: "Orders", href: "/admin/orders" },
        { icon: Users, label: "Customers", href: "/admin/customers" },
        { icon: Settings, label: "Settings", href: "/admin/settings" },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center">
                        <Film className="w-4 h-4 text-sidebar-primary-foreground" />
                    </div>
                    <div>
                        <div className="font-semibold text-sidebar-foreground text-sm">ReelRevive</div>
                        <div className="text-[10px] text-sidebar-foreground/70 uppercase tracking-wider font-bold">Admin Panel</div>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild isActive={location === item.href}>
                                <Link href={item.href}>
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
