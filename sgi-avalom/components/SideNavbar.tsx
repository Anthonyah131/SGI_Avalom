"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookUser,
  Users,
  Building2,
  LineChart,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/UserContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function SideNavbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
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
  }

  const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, title }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground",
            pathname === href && "bg-accent text-accent-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">{title}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  );

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-14" : "w-20"
      )}
      onMouseEnter={() => isDesktop && setIsCollapsed(false)}
      onMouseLeave={() => isDesktop && setIsCollapsed(true)}
    >
      <nav className="flex flex-col items-center gap-4 p-4">
        <NavItem href="/homePage" icon={LayoutDashboard} title="Inicio" />
        <NavItem href="/mantClient" icon={BookUser} title="Clientes" />
        <NavItem href="/mantUser" icon={Users} title="Usuarios" />
        <NavItem href="/mantBuild" icon={Building2} title="Edificios" />
        <NavItem href="/accounting" icon={LineChart} title="Contabilidad" />
      </nav>
      <div className="mt-auto flex flex-col items-center gap-4 p-4">
        <NavItem href="/settings" icon={Settings} title="Ajustes" />
        {user && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={handleLogout}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt={`@${user.usu_nombre}`}
                  />
                  <AvatarFallback>
                    {user.usu_nombre ? user.usu_nombre[0] : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {truncateName(user.usu_nombre, 20)}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
