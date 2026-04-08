"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { logout } from "@/store/authSlice";
import {
  ArrowUpDown,
  Banknote,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileImage,
  GitGraph,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { useDispatch } from "react-redux";

// ─── Sidebar Collapsed Context ──────────────────────────────
export const SidebarContext = createContext<{
  isCollapsed: boolean;
  toggleCollapse: () => void;
}>({
  isCollapsed: false,
  toggleCollapse: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);

// ─── Navigation Items ───────────────────────────────────────
const navigation = [
  { name: "Dashboard",       href: "/admin/dashboard",      icon: LayoutDashboard },
  { name: "Promoters",       href: "/admin/promoters",      icon: Users },
  { name: "Promoter's network", href: "/admin/network",        icon: GitGraph },
  { name: "Seasons",         href: "/admin/seasons",        icon: Calendar },
  { name: "Customers",       href: "/admin/customers",      icon: UserCheck },
  // { name: "Requests",        href: "/admin/requests",       icon: FileSearch },
  { name: "Withdrawals",     href: "/admin/withdrawals",    icon: CreditCard },
  { name: "Transactions",    href: "/admin/transactions",   icon: ArrowUpDown },
  { name: "Repayments",      href: "/admin/repayments",     icon: Banknote },
  { name: "Poster-upload",   href: "/admin/upload-poster",  icon: FileImage },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-background relative border-r border-border/50">
      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center py-8 min-h-[120px] overflow-hidden">
        <div className="relative w-[160px] h-[70px] flex items-center justify-center">
          <Image
            src="/Logo.png"
            alt="Logo"
            width={180}
            height={180}
            className={cn(
              "object-contain transition-all duration-300 absolute pointer-events-none",
              isCollapsed ? "scale-75 -ml-[0px]" : "w-[200px] scale-125 top-[-65px] h-[180px]"
            )}
            priority
          />
        </div>
        {!isCollapsed && (
          <div className="px-8 w-full mt-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 uppercase">
              Main Menu
            </p>
          </div>
        )}
      </div>

      {/* Main Navigation - Non-scrollable */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-hidden">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href === "/admin/network" && pathname.includes("/admin/promoters/") && pathname.includes("/network"));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex items-center rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden",
                isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3",
                isActive
                  ? "bg-foreground/5 dark:bg-white/10 text-foreground dark:text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <span className="absolute left-0 inset-y-2 w-1 bg-foreground dark:bg-white rounded-r-md" />
              )}
              <item.icon 
                className={cn("shrink-0", isCollapsed ? "w-6 h-6" : "w-[18px] h-[18px]", isActive ? "text-foreground dark:text-white" : "text-muted-foreground/60 group-hover:text-foreground")} 
                strokeWidth={isActive ? 2 : 1.5} 
              />
              {!isCollapsed && <span className="truncate tracking-wide">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 flex flex-col gap-2 pb-6">
        <Button
          variant="ghost"
          className={cn(
            "hidden lg:flex w-full text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all duration-300 overflow-hidden rounded-xl",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "justify-start gap-4 px-4 py-3"
          )}
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={1.5} /> : <ChevronLeft className="h-5 w-5 shrink-0" strokeWidth={1.5} />}
          {!isCollapsed && <span className="text-sm font-medium tracking-wide">Collapse</span>}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300 overflow-hidden rounded-xl",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "justify-start gap-4 px-4 py-3"
          )}
          onClick={() => setLogoutDialogOpen(true)}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={2} />
          {!isCollapsed && <span className="text-sm font-medium tracking-wide">Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-50">
        <div className={cn("h-full transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
          {SidebarContent}
        </div>
      </div>

      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 px-4 flex items-center justify-between">
         <Image src="/Logo.png" alt="Logo" width={80} height={40} className="object-contain" />
         <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
           <SheetTrigger asChild>
             <Button variant="ghost" size="icon" className="h-10 w-10">
               <Menu className="h-6 w-6" />
             </Button>
           </SheetTrigger>
           <SheetContent side="left" className="p-0 border-none w-72">
             {SidebarContent}
           </SheetContent>
         </Sheet>
      </div>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold tracking-tight">Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              Are you sure you want to log out of the Winnerspin admin panel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3">
            <AlertDialogCancel className="rounded-xl font-bold border-muted-foreground/20">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold border-none shadow-lg shadow-rose-500/20 px-8"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
