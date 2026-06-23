"use client";

/* ═══════════════════════════════════════════════════════════
   MarkdownRenderer — Premium Formatted Text Display
   Uses react-markdown and remark-gfm.
   Features beautiful typography, custom icons, table handling,
   and modern styling for all markdown elements.
   Includes custom AI Business Listing Interception!
   ═══════════════════════════════════════════════════════════ */

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Phone, Mail, MapPin, Globe, MessageCircle, Store } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────

const extractText = (children: React.ReactNode): string => {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (React.isValidElement(children) && children.props && (children.props as any).children) {
    return extractText((children.props as any).children);
  }
  return "";
};

function averageReviewScore(reviews: any[]) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return null;
  }
  const scores = reviews
    .map((r) => Number(r?.review_score))
    .filter((n) => Number.isFinite(n));
  if (scores.length === 0) {
    return null;
  }
  return scores.reduce((acc, n) => acc + n, 0) / scores.length;
}

function pseudoReviewCount(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return 33 + Math.abs(hash % 67);
}

function normalizeString(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findBusiness(name: string, businesses?: any[]) {
  if (!businesses || !Array.isArray(businesses)) return null;
  // Remove LLM list numbering like "1. ", "2) ", etc.
  const cleanName = name.replace(/^[0-9]+[\.\)]\s+/, '');
  const normalizedSearch = normalizeString(cleanName);
  for (const b of businesses) {
    const listing = b.listing || {};
    const bName = listing.business_name || listing.name || listing.title || b.business_name || b.full_name || b.name || "";
    if (normalizeString(bName) === normalizedSearch) {
      return b;
    }
  }
  return null;
}

const PROFILE_BASE_URL = 'https://karobaronline.ai/biz';

function buildBusinessProfileHref(href: string) {
  if (!href || typeof href !== 'string') {
    return '';
  }
  const trimmedHref = href.trim();
  if (!trimmedHref) {
    return '';
  }
  // If it's a full URL, return as is
  if (/^https?:\/\//i.test(trimmedHref)) {
    return trimmedHref;
  }
  // If it's a slug, append it to base URL
  const slug = trimmedHref.replace(/^\/+/, '').replace(/^biz\/+/i, '');
  // Make sure to add the trailing slash as requested by the user
  return slug ? `${PROFILE_BASE_URL}/${slug}/` : PROFILE_BASE_URL;
}

function getProfileHref(postgresBusiness: any) {
  const listing = postgresBusiness?.listing || {};
  const seo = postgresBusiness?.seo || {};
  const href =
    postgresBusiness?.slug ||
    postgresBusiness?.website_url ||
    listing.slug ||
    seo.slug ||
    listing.profile_url ||
    listing.url ||
    listing.website ||
    seo.canonical_url ||
    seo.url;

  return buildBusinessProfileHref(href);
}

// ── Custom UI Components ───────────────────────────────────

function ProfileLinkButton({ href, className = '' }: { href: string; className?: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#e6ffda] px-2.5 py-1 align-middle text-[12px] font-semibold leading-4 text-[#111111] no-underline shadow-[inset_0_0_0_1px_rgba(13,79,57,0.08)] transition hover:bg-[#dcfcca] hover:text-[#111111] focus:outline-none ${className}`.trim()}
    >
      <span>View Profile</span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-3.5 w-3.5 fill-none stroke-[#07594d] stroke-[1.8]"
      >
        <path d="M4 10h16l-1.2-5.5A2 2 0 0 0 16.85 3h-9.7A2 2 0 0 0 5.2 4.5L4 10Z" strokeLinejoin="round" />
        <path d="M5 10v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 19v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 10c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

function StatusStarIcon({ tone }: { tone: 'gray' | 'green' }) {
  const fill = tone === 'gray' ? '#9aa0a6' : '#0f9d58';
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[14px] w-[14px] shrink-0">
      <path
        d="M12 1.5l2.2 2.6 3.3-1 .6 3.4 3.4.6-1 3.3 2.6 2.2-2.6 2.2 1 3.3-3.4.6-.6 3.4-3.3-1L12 22.5l-2.2-2.6-3.3 1-.6-3.4-3.4-.6 1-3.3L1 11.4l2.6-2.2-1-3.3 3.4-.6.6-3.4 3.3 1L12 1.5z"
        fill={fill}
      />
      <path
        d="M8 12.2l2.6 2.6L16 9.4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'gray' | 'green' }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium leading-5 text-[#1f1f1f]">
      <StatusStarIcon tone={tone} />
      <span>{label}</span>
    </span>
  );
}

function BusinessStatusBadges({ packageStatus }: { packageStatus?: string }) {
  const status = (packageStatus || '').trim().toLowerCase();
  if (status === 'business_guaranteed') {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
        <StatusBadge label="Verified" tone="green" />
        <StatusBadge label="Business Guaranteed" tone="green" />
      </span>
    );
  }
  if (status === 'verified') {
    return <StatusBadge label="Verified" tone="green" />;
  }
  return <StatusBadge label="Non-Verified" tone="gray" />;
}

function RatingStarCell({ fillFraction }: { fillFraction: number }) {
  const f = Math.min(1, Math.max(0, fillFraction));
  const isFull = f >= 1 - 1e-6;
  const isEmpty = f <= 1e-6;
  const needsClip = !isFull && !isEmpty;

  return (
    <span className="relative inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-[#fbbc04]">
      <span
        className="flex h-full w-full items-center justify-center"
        style={{
          ...(needsClip ? { clipPath: `inset(0 ${(1 - f) * 100}% 0 0)` } : {}),
          opacity: isEmpty ? 0.35 : 1,
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[11px] w-[11px]">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#fff" />
        </svg>
      </span>
    </span>
  );
}

function BusinessRatingInline({ business, fallbackName }: { business?: any; fallbackName: string }) {
  const name = business?.business_name || business?.full_name || business?.name || fallbackName;
  const reviews = business?.reviews || [];
  const avg = averageReviewScore(reviews);
  
  const rating = avg != null ? Math.min(5, Math.max(1, avg)) : 5;
  const reviewCount = pseudoReviewCount(name);

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 align-middle ml-1">
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <RatingStarCell key={i} fillFraction={Math.min(1, Math.max(0, rating - i))} />
        ))}
      </span>
      <span className="text-[12px] font-normal leading-5 text-[#1f1f1f] whitespace-nowrap">
        ( {reviewCount} reviews )
      </span>
    </span>
  );
}

function BusinessCard({ name, businesses }: { name: string; businesses?: any[] }) {
  const business = React.useMemo(() => findBusiness(name, businesses), [name, businesses]);
  const packageStatus = business?.listing?.package_status || business?.package_status;
  
  return (
    <>
      <BusinessStatusBadges packageStatus={packageStatus} />
      <BusinessRatingInline business={business} fallbackName={name} />
      <BusinessProfileButton name={name} businesses={businesses} />
    </>
  );
}

function BusinessProfileButton({ name, businesses }: { name: string; businesses?: any[] }) {
  const business = React.useMemo(() => findBusiness(name, businesses), [name, businesses]);
  let profileUrl = business ? getProfileHref(business) : '';
  
  // Fallback if business not found or has no URL
  if (!profileUrl) {
    const cleanName = name.replace(/^[0-9]+[\.\)]\s+/, '').trim();
    profileUrl = `https://karobar.pk/search?q=${encodeURIComponent(cleanName)}`;
  }
  
  return (
    <ProfileLinkButton href={profileUrl} className="px-3 py-1 shadow-sm hover:shadow-md" />
  );
}

function QuoteIcon() {
  return (
    <svg className="w-5 h-5 text-[var(--color-primary)] opacity-60 absolute top-3 left-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-3 h-3 inline-block ml-1 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────

interface MarkdownRendererProps {
  content: string;
  businesses?: any[];
}

export function MarkdownRenderer({ content, businesses }: MarkdownRendererProps) {
  // Use useMemo so we don't recreate components every render
  const components = useMemo(() => ({
    // ── Typography & Special Layouts ──
    p: ({ node, children }: any) => {
      const text = extractText(children);
      
      // 1. Detect Contact Rows (Details UI)
      if (text.includes("Phone Number:") || text.includes("Email Address:") || text.includes("Business Address:")) {
         const isPhone = text.includes("Phone Number:");
         const isEmail = text.includes("Email Address:");
         const isAddress = text.includes("Business Address:");
         
         let icon = null;
         if (isPhone) icon = <Phone className="w-4 h-4 text-gray-500 shrink-0" />;
         else if (isEmail) icon = <Mail className="w-4 h-4 text-gray-500 shrink-0" />;
         else if (isAddress) icon = <MapPin className="w-4 h-4 text-gray-500 shrink-0" />;
         
         return (
           <p className="flex items-start gap-2 text-[14px] leading-6 text-gray-600 mb-2">
             <span className="mt-1">{icon}</span>
             <span className="font-medium">{children}</span>
           </p>
         );
      }

      // 2. Detect Business Heading Paragraph (Details UI)
      const pChildren = React.Children.toArray(children);
      if (pChildren.length === 1 && React.isValidElement(pChildren[0]) && (pChildren[0].props as any)?.node?.tagName === 'strong') {
         const name = extractText(pChildren[0]).trim();
         const nameLower = name.toLowerCase();
         const isLabel = name.endsWith(':') || 
                         name.includes('Phone') || 
                         name.includes('Email') || 
                         name.includes('Address') || 
                         nameLower.includes('customer') || 
                         nameLower.includes('saying') || 
                         nameLower.includes('review') || 
                         nameLower.includes('description') || 
                         name.length > 60;
         if (!isLabel && name.length > 2 && name.length < 50) {
            return (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                 <h3 className="text-[18px] font-bold text-gray-900 m-0">
                   {name}
                 </h3>
                 <BusinessCard name={name} businesses={businesses} />
              </div>
            );
         }
      }

      return <p className="mb-4 last:mb-0 text-gray-700">{children}</p>;
    },
    strong: ({ children }: any) => (
      <strong className="font-bold text-gray-900">
        {children}
      </strong>
    ),
    em: ({ children }: any) => <em className="italic text-gray-600">{children}</em>,
    
    // ── Headings ──
    h1: ({ children }: any) => (
      <h1 className="flex items-center text-2xl font-extrabold mt-8 mb-4 text-gray-900 tracking-tight border-b border-gray-200 pb-2">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-emerald-600">
          {children}
        </span>
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold mt-7 mb-3 text-gray-900 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-[var(--color-primary)] rounded-full"></div>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-900">
        {children}
      </h3>
    ),

    // ── Lists & Search UI Interceptor ──
    ul: ({ children }: any) => (
      <ul className="mb-5 pl-6 list-none space-y-3 relative">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="mb-5 pl-6 list-decimal marker:text-gray-500 marker:font-medium space-y-4">
        {children}
      </ol>
    ),
    li: function CustomLi({ node, children, className }: any) {
      let isBusiness = false;
      let businessName = "";
      
      // Detect if this list item is a Business Listing
      const newChildren = React.Children.map(children, (child, childIndex) => {
        if (React.isValidElement(child) && (child.props as any)?.node?.tagName === 'p') {
           const pChildren = React.Children.toArray((child.props as any).children);
           const newPChildren = pChildren.map((pChild, index) => {
              if (index === 0 && React.isValidElement(pChild) && (pChild.props as any)?.node?.tagName === 'strong') {
                 const name = extractText(pChild).trim();
                 const nameLower = name.toLowerCase();
                 const isLabel = name.endsWith(':') || 
                                 name.includes('Phone') || 
                                 name.includes('Email') || 
                                 name.includes('Address') || 
                                 nameLower.includes('customer') || 
                                 nameLower.includes('saying') || 
                                 nameLower.includes('review') || 
                                 nameLower.includes('description') || 
                                 name.length > 60;
                 if (!isLabel && name.length > 2) {
                     isBusiness = true;
                     businessName = name;
                     return (
                        <React.Fragment key={index}>
                          <span className="font-semibold text-gray-900 text-[15.5px]">{pChild}</span>
                          <BusinessCard name={businessName} businesses={businesses} />
                        </React.Fragment>
                     );
                 }
              }
              return pChild;
           });
           
           if (isBusiness) {
               if (React.isValidElement(child)) {
                   const element = child as React.ReactElement<{ className?: string }>;
                   const existingClass = element.props.className || "";
                   const mergedClass = `flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-1 mt-1 ${existingClass}`.trim();
                   return React.cloneElement(element, { className: mergedClass }, ...newPChildren);
               }
           }
           if (React.isValidElement(child)) {
               return React.cloneElement(child as React.ReactElement, {}, ...newPChildren);
           }
           return child;
        }
        // If it's a direct string or strong without a 'p' tag wrapper
        // Only check the first few children to avoid matching bold words in the middle of a sentence
        if (!isBusiness && childIndex <= 1 && React.isValidElement(child) && (child.props as any)?.node?.tagName === 'strong') {
            const name = extractText(child).trim();
            const nameLower = name.toLowerCase();
            const isLabel = name.endsWith(':') || 
                            name.includes('Phone') || 
                            name.includes('Email') || 
                            name.includes('Address') || 
                            nameLower.includes('customer') || 
                            nameLower.includes('saying') || 
                            nameLower.includes('review') || 
                            nameLower.includes('description') || 
                            name.length > 60;
            if (!isLabel && name.length > 2) {
                isBusiness = true;
                businessName = name;
                return (
                  <span key="strong" className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-1 mt-1">
                     <span className="font-semibold text-gray-900 text-[15.5px]">{child}</span>
                     <BusinessCard name={businessName} businesses={businesses} />
                  </span>
                );
            }
        }
        return child;
      });

      if (isBusiness && businessName) {
        return (
          <li className={`relative pl-2 mb-2 mt-4 ${className || ""}`}>
             <div className="text-gray-800">
                {newChildren}
             </div>
          </li>
        );
      }

      const textContent = extractText(children).trim();
      const lowerText = textContent.toLowerCase();
      
      let icon = <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span>;
      
      if (lowerText.startsWith("address:")) icon = <MapPin className="w-4 h-4 text-[var(--color-primary)]" />;
      else if (lowerText.startsWith("phone") || lowerText.startsWith("whatsapp")) icon = <Phone className="w-4 h-4 text-[var(--color-primary)]" />;
      else if (lowerText.startsWith("email:")) icon = <Mail className="w-4 h-4 text-[var(--color-primary)]" />;
      else if (lowerText.startsWith("website:")) icon = <Globe className="w-4 h-4 text-[var(--color-primary)]" />;

      return (
        <li className={`relative pl-1 mb-3 ${className || ""}`}>
          <div className="absolute -left-6 top-0 flex items-center justify-center w-6 h-6">
            {icon}
          </div>
          <div className="text-gray-700 leading-relaxed">{children}</div>
        </li>
      );
    },

    // ── Links & Slug Interceptor ──
    a: ({ href, children }: any) => {
      if (href && href.startsWith("slug:")) {
         const slug = href.replace("slug:", "");
         const name = extractText(children).trim();
         return (
           <span className="inline-flex flex-wrap items-center gap-1 align-middle">
             <span className="font-semibold text-gray-900 text-[16.5px]">{children}</span>
             <BusinessCard name={name} businesses={businesses} />
           </span>
         );
      }
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group inline-flex items-center text-[#3d6dff] font-medium hover:text-[#254ee8] transition-colors duration-200 break-all"
        >
          <span className="underline underline-offset-4 decoration-[#b7c5ff] group-hover:decoration-[#3d6dff] transition-all">
            {children}
          </span>
          <LinkIcon />
        </a>
      );
    },

    // ── Tables ──
    table: ({ children }: any) => (
      <div className="my-6 w-full overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-gray-50 border-b border-gray-200">{children}</thead>,
    tbody: ({ children }: any) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
    tr: ({ children }: any) => <tr>{children}</tr>,
    th: ({ children }: any) => <th className="px-4 py-3 font-semibold text-gray-900 text-sm">{children}</th>,
    td: ({ children }: any) => <td className="px-4 py-3 text-sm text-gray-700">{children}</td>,

    // ── Dividers ──
    hr: () => (
      <div className="flex items-center my-8">
        <div className="flex-1 border-t border-gray-200"></div>
        <div className="mx-4 text-gray-300">✦</div>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>
    ),

    // ── Blockquotes ──
    blockquote: ({ children }: any) => (
      <blockquote className="relative my-6 px-6 py-4 pl-12 bg-emerald-50/50 border border-emerald-100 rounded-xl text-gray-700 italic shadow-sm">
        <QuoteIcon />
        <div className="relative z-10">{children}</div>
      </blockquote>
    ),

    // ── Code Blocks ──
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline ? (
        <div className="my-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-[#1e1e1e]">
          <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-[#404040]">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-4 text-xs font-mono text-gray-400 uppercase tracking-wider">
              {match?.[1] || "code"}
            </div>
          </div>
          <pre className="p-5 overflow-x-auto text-[13.5px] leading-relaxed text-gray-100 font-mono">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      ) : (
        <code 
          className="bg-gray-100 text-[var(--color-primary)] px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-gray-200 mx-0.5" 
          {...props}
        >
          {children}
        </code>
      );
    },
  }), [businesses]);

  return (
    <div className="markdown-body text-[14px] leading-[1.8] text-gray-800 text-left md:text-justify break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
