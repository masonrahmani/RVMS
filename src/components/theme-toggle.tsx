"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Icons } from "@/components/icons";

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent">
      {theme === "light" ? <Icons.moon className="h-5 w-5" /> : <Icons.sun className="h-5 w-5" />}
    </button>
  );
};
