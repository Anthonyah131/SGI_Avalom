"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookUser,
  Users,
  Building2,
  LineChart,
  FilePen,
  Receipt,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/UserContext";
import { useTheme } from "next-themes";
import cookie from "js-cookie";

export default function SideNavbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Cargar preferencia de tema desde cookies
    const savedTheme = cookie.get("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      setIsDarkMode(savedTheme === "dark");
    } else {
      // Si no hay cookie, usar tema oscuro por defecto
      setTheme("dark");
      setIsDarkMode(true);
      cookie.set("theme", "dark", { expires: 365 });
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [setTheme]);

  useEffect(() => {
    // Sincronizar estado cuando cambia el tema
    setIsDarkMode(theme === "dark");
  }, [theme]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    setIsDarkMode(checked);
    cookie.set("theme", newTheme, { expires: 365 });
  };

  if (!mounted) return null;

  const truncateName = (name: string, maxLength: number) => {
    return name.length > maxLength
      ? `${name.substring(0, maxLength)}...`
      : name;
  };

  interface NavItemProps {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    allowedRoles: string[];
  }

  const navItems: NavItemProps[] = [
    {
      href: "/homePage",
      icon: LayoutDashboard,
      title: "Inicio",
      allowedRoles: ["A", "J", "E", "R"],
    },
    {
      href: "/mantClient",
      icon: BookUser,
      title: "Clientes",
      allowedRoles: ["A", "J", "E"],
    },
    {
      href: "/mantUser",
      icon: Users,
      title: "Usuarios",
      allowedRoles: ["A", "J", "E"],
    },
    {
      href: "/mantBuild",
      icon: Building2,
      title: "Edificios",
      allowedRoles: ["A", "J", "E"],
    },
    {
      href: "/mantRent",
      icon: FilePen,
      title: "Alquileres",
      allowedRoles: ["A", "J", "E"],
    },
    {
      href: "/accounting",
      icon: LineChart,
      title: "Contabilidad",
      allowedRoles: ["A", "J", "E", "R"],
    },
    {
      href: "/expenses",
      icon: Receipt,
      title: "Gastos",
      allowedRoles: ["A", "J", "E", "R"],
    },
  ];

  const NavItem: React.FC<Omit<NavItemProps, "allowedRoles">> = ({
    href,
    icon: Icon,
    title,
  }) => {
    const isActive = pathname === href;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-primary-foreground")} />
            {isActive && (
              <span className="absolute left-0 h-6 w-1 rounded-r-full bg-primary" />
            )}
            <span className="sr-only">{title}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {title}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card/95 backdrop-blur-sm shadow-lg transition-all duration-300",
        isCollapsed ? "w-16" : "w-20"
      )}
      onMouseEnter={() => isDesktop && setIsCollapsed(false)}
      onMouseLeave={() => isDesktop && setIsCollapsed(true)}
    >
      {/* Logo/Brand Area */}
      <div className="flex h-16 items-center justify-center border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <LayoutDashboard className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-1 flex-col items-center gap-2 p-3">
        {navItems
          .filter((item) => item.allowedRoles.includes(user?.usu_rol || ""))
          .map(({ href, icon, title }) => (
            <NavItem key={href} href={href} icon={icon} title={title} />
          ))}
      </nav>

      {/* User Menu */}
      <div className="mt-auto border-t p-3">
        {user && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt={`@${user.usu_nombre}`}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.usu_nombre ? user.usu_nombre[0].toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {truncateName(user.usu_nombre, 20)}
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.usu_nombre} {user.usu_papellido}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.usu_correo}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isDarkMode ? (
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Sun className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Label
                      htmlFor="theme-toggle"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Modo oscuro
                    </Label>
                  </div>
                  <Switch
                    id="theme-toggle"
                    checked={isDarkMode}
                    onCheckedChange={handleThemeToggle}
                  />
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
}
