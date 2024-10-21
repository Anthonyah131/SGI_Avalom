"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import cookie from "js-cookie";

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const token = cookie.get("token");
    if (!token) {
      router.push("/");
      return;
    }
  }, []);

  return <>{children}</>;
};

export default AuthRoute;
