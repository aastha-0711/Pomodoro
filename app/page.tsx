"use client";

import { useState, useEffect } from "react";
import PomodoroTimer from "@/components/PomodoroTimer";
import { SessionHistory } from "@/components/session-history";
import { Navbar } from "@/components/navbar"; // <-- Named import

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");
  const [activeTab, setActiveTab] = useState("timer");

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-gradient-to-br from-background to-background">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className={`absolute inset-0 ${
            mounted
              ? theme === "dark"
                ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background"
                : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 via-background to-background"
              : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] via-background to-background"
          }`}
        ></div>
      </div>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {activeTab === "timer" && (
          <div className="flex justify-center w-full max-w-5xl mx-auto">
            <PomodoroTimer />
          </div>
        )}

        {activeTab === "history" && (
          <div className="w-full max-w-5xl mx-auto">
            <SessionHistory />
          </div>
        )}
      </main>
    </div>
  );
}
