"use client";
import { useEffect, useState } from "react";
import { Nav } from "./ui/nav";
import {
  LayoutDashboard,
  BookUser,
  ChevronRight,
  Users,
  User,
} from "lucide-react";
import { Button } from "./ui/button";
import { useWindowWidth } from "@react-hook/window-size";

type Props = {};

const SideNavbar: React.FC<Props> = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const onlyWidth = useWindowWidth();
  const mobileWidth = onlyWidth < 768;

  useEffect(() => {
    setMounted(true); // Marcar el componente como montado
  }, []);

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  // Renderizar null en el servidor para evitar problemas de hidratación
  if (!mounted) {
    return null;
  }

  return (
    <div
      onMouseEnter={() => {
        setIsCollapsed(false);
      }}
      onMouseLeave={() => {
        setIsCollapsed(true);
      }}
      className="relative bg-sideBar min-w-[60px] md:min-w-[80px] border-r px-3 pb-10 pt-24 "
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
        ]}
      />
    </div>
  );
};

export default SideNavbar;
