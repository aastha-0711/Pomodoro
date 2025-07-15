"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAllSessions,
  fetchUserDetails,
  updateUserProfile,
  predictFocusState,
  saveSession,
} from "@/lib/api";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export default function PomodoroTimer() {
  const { theme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);

  const [preferences, setPreferences] = useState({
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notifications: false,
    soundEffects: false,
  });

  const preferencesRef = useRef(preferences);
  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  const modeChangedManually = useRef(false);

  useEffect(() => {
    setMounted(true);
    loadDurationsAndPrefs();
  }, []);

  const loadDurationsAndPrefs = async () => {
    const res = await fetchUserDetails();
    const allSessions = await fetchAllSessions();

    const sessionsExist =
      allSessions.success &&
      Array.isArray(allSessions.sessions) &&
      allSessions.sessions.length > 0;

    if (res.success) {
      const prefs = res.user.preferences || {};

      setFocusDuration(sessionsExist ? prefs.focusDuration || 25 : 25);
      setShortBreak(sessionsExist ? prefs.shortBreakDuration || 5 : 5);
      setLongBreak(sessionsExist ? prefs.longBreakDuration || 15 : 15);
      setPreferences({
        autoStartBreaks: prefs.autoStartBreaks ?? false,
        autoStartPomodoros: prefs.autoStartPomodoros ?? false,
        notifications: prefs.notifications ?? false,
        soundEffects: prefs.soundEffects ?? false,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
        setProgress(((timeLeft - 1) / getCurrentDuration()) * 100);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerEnd();
    }

    return () => clearTimeout(timerRef.current!);
  }, [isActive, timeLeft, mode]);

  useEffect(() => {
    setTimeLeft(Math.round(getCurrentDuration()));
    setProgress(100);
    setIsActive(false);
  }, [focusDuration, shortBreak, longBreak]);

  useEffect(() => {
    setTimeLeft(Math.round(getCurrentDuration()));
    setProgress(100);

    if (modeChangedManually.current) {
      setIsActive(false);
      modeChangedManually.current = false;
      return;
    }

    const prefs = preferencesRef.current;
    if (mode === "pomodoro" && prefs.autoStartPomodoros) {
      setIsActive(true);
    } else if ((mode === "shortBreak" || mode === "longBreak") && prefs.autoStartBreaks) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [mode]);

  const getCurrentDuration = () => {
    if (mode === "pomodoro") return focusDuration * 60;
    if (mode === "shortBreak") return shortBreak * 60;
    if (mode === "longBreak") return longBreak * 60;
    return 25 * 60;
  };

  const adjustDurations = async () => {
    const res = await fetchAllSessions();
    if (!res.success || !Array.isArray(res.sessions)) return;

    const sessions = res.sessions as { result: string }[];
    const total = sessions.length;
    if (total === 0) return;

    const focused = sessions.filter((s) => s.result === "focused").length;
    const ratio = focused / total;

    const newFocus = Math.round((25 + (ratio - 0.5) * 20) * 100) / 100;
    const clampedFocus = Math.min(35, Math.max(15, newFocus));

    const newShort = Math.round((clampedFocus / 5) * 100) / 100;
    const newLong = Math.round((clampedFocus * 3 / 5) * 100) / 100;

    console.log("🔁 Duration adjusted:", {
      focusedSessions: focused,
      totalSessions: total,
      ratio: ratio.toFixed(2),
      focusDuration: clampedFocus,
      shortBreak: newShort,
      longBreak: newLong,
    });

    setFocusDuration(clampedFocus);
    setShortBreak(newShort);
    setLongBreak(newLong);

    if (user) {
      await updateUserProfile({
        name: user.name!,
        email: user.email,
        preferences: {
          ...preferencesRef.current,
          focusDuration: clampedFocus,
          shortBreakDuration: newShort,
          longBreakDuration: newLong,
        },
      });
    }

    const durationInSec =
      (mode === "pomodoro" ? clampedFocus : mode === "shortBreak" ? newShort : newLong) * 60;
    setTimeLeft(Math.round(durationInSec));
    setProgress(100);
  };

  const handleTimerEnd = async () => {
    setIsActive(false);

    if (mode === "pomodoro") {
      let result: "focused" | "unfocused" = "focused";
      try {
        const mockEEG = Array.from({ length: 6 }, () => Array(320).fill(Math.random()));
        const prediction = await predictFocusState(mockEEG);
        if (prediction.success) result = prediction.result;
      } catch {
        result = Math.random() > 0.5 ? "focused" : "unfocused";
      }

      await saveSession(result, getCurrentDuration());
      await adjustDurations();

      if (preferencesRef.current.notifications && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Pomodoro done", { body: `You were ${result}` });
        } else {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              new Notification("Pomodoro done", { body: `You were ${result}` });
            }
          });
        }
      }
    }

    setMode(
      mode === "pomodoro"
        ? shortBreak >= longBreak
          ? "shortBreak"
          : "longBreak"
        : "pomodoro"
    );
  };

  const toggleTimer = () => setIsActive((prev) => !prev);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(Math.round(getCurrentDuration()));
    setProgress(100);
  };

  const formatTime = (s: number) => {
    const totalSeconds = Math.round(s);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress / 100);
  const isDarkMode = mounted && (resolvedTheme === "dark" || theme === "dark");
  const textClass = isDarkMode ? "text-white drop-shadow-md" : "text-blue-600 font-bold";

  if (loading || !mounted) return null;

  return (
    <Card
      className={cn(
        "w-full max-w-md mx-auto border-2",
        isDarkMode
          ? "bg-black/40 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          : "bg-white/80 border-blue-200 shadow-md"
      )}
    >
      <CardContent className="p-6 flex flex-col items-center">
        <Tabs
          value={mode}
          onValueChange={(v) => {
            modeChangedManually.current = true;
            setMode(v as TimerMode);
          }}
          className="w-full mb-6"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-64 h-64 flex items-center justify-center mb-6">
          <svg className="absolute w-full h-full" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              strokeWidth="4"
              stroke="rgba(168,85,247,0.1)"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              strokeWidth="4"
              stroke="rgba(168,85,247,0.8)"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 128 128)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className={`text-5xl tabular-nums z-10 ${textClass}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Button onClick={toggleTimer}>
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button variant="outline" onClick={resetTimer}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        <div className="w-full text-center mt-2">
          <Label className="text-muted-foreground">
            {mode === "pomodoro" && (
              <>
                Focus Duration: <strong>{Math.floor(focusDuration)} min {Math.round((focusDuration % 1) * 60)} sec</strong>
              </>
            )}
            {mode === "shortBreak" && (
              <>
                Short Break: <strong>{Math.floor(shortBreak)} min {Math.round((shortBreak % 1) * 60)} sec</strong>
              </>
            )}
            {mode === "longBreak" && (
              <>
                Long Break: <strong>{Math.floor(longBreak)} min {Math.round((longBreak % 1) * 60)} sec</strong>
              </>
            )}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
