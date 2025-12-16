"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import cookie from "js-cookie";

export function ThemeInitializer() {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Cargar preferencia de tema desde cookies
    const savedTheme = cookie.get("theme");
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      setTheme(savedTheme);
    } else {
      // Si no hay cookie, usar tema oscuro por defecto
      setTheme("dark");
      cookie.set("theme", "dark", { expires: 365 });
    }
  }, [setTheme]);

  return null;
}

