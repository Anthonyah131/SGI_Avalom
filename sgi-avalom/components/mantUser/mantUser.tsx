"use client";
import { useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { useRouter } from "next/navigation";
import AuthRoute from "../AuthRoute";
import SideNavbar from "../SideNavbar";
import BodyMantUser from "./bodyMantUser";

const MantUser: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user?.usu_rol === "R") {
      router.push("/unauthorized");
    }
  }, [user, router]);

  return (
    <AuthRoute>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16">
          <BodyMantUser />
        </main>
      </div>
    </AuthRoute>
  );
};

export default MantUser;
