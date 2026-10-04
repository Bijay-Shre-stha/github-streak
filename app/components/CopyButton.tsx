"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { Check, Copy, X } from "lucide-react";
import { copyText } from "@/lib/share";

interface CopyButtonProps {
  text: string;
  label?: string;
  /** Accessible name when the visible label is short, e.g. "Copy README markdown for radical theme" */
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const BASE =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors active:scale-95";
const DEFAULT_LOOK =
  "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800";

export function CopyButton({
  text,
  label = "Copy",
  ariaLabel,
  className = DEFAULT_LOOK,
  style,
}: CopyButtonProps): ReactElement {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async (): Promise<void> => {
    const ok = await copyText(text);
    if (!ok) {
      // Last resort that works everywhere: let the user copy it themselves.
      window.prompt("Copy this text:", text);
    }
    setStatus(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`${BASE} ${className}`}
      style={style}
    >
      {status === "copied" ? (
        <Check size={14} className="text-green-600 dark:text-green-400" aria-hidden />
      ) : status === "failed" ? (
        <X size={14} className="text-red-500" aria-hidden />
      ) : (
        <Copy size={14} aria-hidden />
      )}
      <span aria-live="polite">
        {status === "copied" ? "Copied!" : status === "failed" ? "Copy failed" : label}
      </span>
    </button>
  );
}
