/* ═══════════════════════════════════════════════════════════
   WelcomeHero — Initial Welcome Screen
   Logo + stars decoration + heading. Shown when chat is empty.
   Stars appear to the left of "AI Business Search," text.
   ═══════════════════════════════════════════════════════════ */

"use client";

import Image from "next/image";

export function WelcomeHero() {
  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Karobar Online Logo */}
      <Image
        src="/karobar-online-ai-logo1.png"
        alt="Karobar Online"
        width={140}
        height={42}
        priority
        className="mb-3"
      />

      {/* Heading row — stars positioned at the start of "AI" */}
      <div className="relative inline-block">
        {/* Stars decoration — snug against the left edge of text */}
        <Image
          src="/stars.png"
          alt=""
          width={36}
          height={36}
          className="absolute -left-9 -top-1 pointer-events-none select-none"
          aria-hidden="true"
        />

        <h1 className="text-[26px] font-bold text-[var(--color-primary)] text-center leading-tight">
          AI Business Search,
        </h1>
      </div>

      {/* Subheading */}
      <p className="text-lg text-[var(--color-text-secondary)] text-center font-light mt-0.5">
        what are you looking for?
      </p>
    </div>
  );
}
