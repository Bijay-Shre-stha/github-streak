"use client";

import { Send, Mail, Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  title?: string;
  text?: string;
  url?: string;
  themeName?: string;
  username?: string;
}

export function ShareButtons({
  title = "GitHub Streak Stats",
  text = "Check out this GitHub contribution streak statistics!",
  url,
  themeName,
  username,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const defaultUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?username=${username}&theme=${themeName}`
    : url;

  const getShareData = (platform: string) => {
    const shareUrl = defaultUrl || url || "";
    const shareText = text + (username ? ` (@${username})` : "");

    switch (platform) {
      case "twitter":
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      case "email":
        return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
      default:
        return shareUrl;
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = getShareData(platform);

    if (platform === "native") {
      if (navigator.share) {
        navigator.share({
          title: title,
          text: text,
          url: shareUrl,
        });
      }
      return;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopy = () => {
    if (defaultUrl) {
      navigator.clipboard.writeText(defaultUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleShare("native")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        title="Share"
      >
        <Share2 size={14} />
        Share
      </button>

      <button
        onClick={() => handleShare("twitter")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/30"
        title="Share on Twitter"
      >
        <Send size={14} className="rotate-140" />
        Twitter
      </button>

      <button
        onClick={() => handleShare("linkedin")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/30"
        title="Share on LinkedIn"
      >
        <Send size={14} className="rotate-45" />
        LinkedIn
      </button>

      <button
        onClick={() => handleShare("email")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        title="Share via Email"
      >
        <Mail size={14} />
        Email
      </button>

      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        title="Copy Link"
      >
        {copied ? (
          <>
            <Check size={14} className="text-green-500" />
            Copied!
          </>
        ) : (
          <>
            <Copy size={14} />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
