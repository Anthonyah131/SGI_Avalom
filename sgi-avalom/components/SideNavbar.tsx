"use client";
import { useEffect, useState } from "react";
import { useWindowWidth } from "@react-hook/window-size";
import {
  LayoutDashboard,
  BookUser,
  ChevronRight,
  Users,
  Building2,
  LucideLineChart ,
} from "lucide-react";
import { Nav } from "./ui/nav";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/UserContext";
import { useRouter } from "next/navigation";

const SideNavbar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const onlyWidth = useWindowWidth();
  const mobileWidth = onlyWidth < 768;

  const { user, logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted) {
    return null;
  }

  const truncateName = (name: string, maxLength: number) => {
    if (name.length > maxLength) {
      return `${name.substring(0, maxLength)}...`;
    }
    return name;
  };

  return (
    <div
      onMouseEnter={() => {
        setIsCollapsed(false);
      }}
      onMouseLeave={() => {
        setIsCollapsed(true);
      }}
      className="relative bg-sideBar min-w-[60px] md:min-w-[95px] border-r px-3 pb-10 pt-24"
    >
      {!mobileWidth && (
        <div className="absolute right-[-20px] top-7">
          <Button
            onClick={toggleSidebar}
            variant="secondary"
            className="rounded-full p-2"
          >
            <ChevronRight />
          </Button>
        </div>
      )}
      <div className="flex items-center flex-col gap-2 m-1">
        {user && (
          <>
            <Avatar>
              <AvatarImage
                src={"https://github.com/shadcn.png"}
                alt={`@${user.usu_nombre}`}
              />
              <AvatarFallback>
                {user.usu_nombre ? user.usu_nombre[0] : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:flex text-sm md:text-sm">
              {truncateName(user.usu_nombre, 8)}
            </span>
            <span className="flex md:hidden text-sm md:text-sm">
              {user.usu_nombre ? user.usu_nombre.substring(0, 3) : "U"}
            </span>
          </>
        )}
      </div>
      <Nav
        isCollapsed={mobileWidth ? true : isCollapsed}
        links={[
          {
            title: "Inicio",
            href: "/homePage",
            icon: LayoutDashboard,
            variant: "ghost",
          },
          {
            title: "Clientes",
            href: "/mantClient",
            icon: BookUser,
            variant: "ghost",
          },
          {
            title: "Usuarios",
            href: "/mantUser",
            icon: Users,
            variant: "ghost",
          },
          {
            title: "Edificios",
            href: "/mantBuild",
            icon: Building2,
            variant: "ghost",
          },
          {
            title: "Contabilidad",
            href: "/accounting",
            icon: LucideLineChart,
            variant: "ghost",
          },
        ]}
      />
    </div>
  );
};

export default SideNavbar;
