"use client";

import { useEffect, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "bazaar-theme";

const OPTIONS: Array<{ value: ThemeChoice; label: string; hint: string }> = [
  { value: "system", label: "System", hint: "Follow your device" },
  { value: "light", label: "Light", hint: "Cream and paper" },
  { value: "dark", label: "Dark", hint: "Dim and warm" },
];

function applyTheme(choice: ThemeChoice): void {
  const dark =
    choice === "dark" ||
    (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export default function AppearanceSettings() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setChoice(stored === "light" || stored === "dark" ? stored : "system");
  }, []);

  useEffect(() => {
    if (choice !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [choice]);

  function choose(next: ThemeChoice) {
    setChoice(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-2">
      {OPTIONS.map((option) => {
        const active = choice === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(option.value)}
            className={[
              "rounded-xl border px-2 py-3 text-center transition",
              active
                ? "border-ink bg-ink text-paper"
                : "border-line bg-white text-ink-soft hover:border-ink/25 hover:text-ink",
            ].join(" ")}
          >
            <span className="block text-sm font-medium">{option.label}</span>
            <span className={active ? "mt-0.5 block text-[11px] text-paper/70" : "mt-0.5 block text-[11px]"}>
              {option.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
