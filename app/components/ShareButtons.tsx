"use client";

import { Send, Mail, Share2 } from "lucide-react";
import { useEffect, useState, type ReactElement } from "react";
import { CopyButton } from "./CopyButton";

interface ShareButtonsProps {
  /** Absolute URL to share; must point to a working page. */
  url: string;
  title?: string;
  text?: string;
}

const BUTTON =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors active:scale-95 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800";

export function ShareButtons({
  url,
  title = "GitHub Streak Stats",
  text = "Check out this GitHub contribution streak!",
}: ShareButtonsProps): ReactElement {
  // Detected after mount so server and client render the same markup.
  const [canShare, setCanShare] = useState(false);
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanShare(typeof navigator.share === "function");
  }, []);

  const handleNativeShare = async (): Promise<void> => {
    setShareError("");
    try {
      await navigator.share({ title, text, url });
    } catch (err) {
      // AbortError = user closed the share sheet; not a failure.
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setShareError("Sharing failed. Use Copy link instead.");
      }
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Share">
        {canShare && (
          <button type="button" onClick={handleNativeShare} className={BUTTON}>
            <Share2 size={14} aria-hidden />
            Share
          </button>
        )}
        <CopyButton text={url} label="Copy link" />
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className={BUTTON}
          aria-label="Share on X (opens in a new tab)"
        >
          <Send size={14} aria-hidden />X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={BUTTON}
          aria-label="Share on LinkedIn (opens in a new tab)"
        >
          <Send size={14} aria-hidden />
          LinkedIn
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}
          className={BUTTON}
          aria-label="Share via email"
        >
          <Mail size={14} aria-hidden />
          Email
        </a>
      </div>
      <p role="alert" className="text-sm text-red-600 dark:text-red-400 empty:hidden">
        {shareError}
      </p>
    </div>
  );
}
