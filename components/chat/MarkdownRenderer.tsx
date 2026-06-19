"use client";

/* ═══════════════════════════════════════════════════════════
   MarkdownRenderer — Premium Formatted Text Display
   Uses react-markdown and remark-gfm.
   Features beautiful typography, custom icons, table handling,
   and modern styling for all markdown elements.
   Includes custom AI Business Listing Interception!
   ═══════════════════════════════════════════════════════════ */

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Phone, Mail, MapPin } from "lucide-react";

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

function pseudoReviewCount(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return 33 + Math.abs(hash % 67);
}

function createSlug(name: string) {
  // Remove leading numbers, dots, and spaces (e.g. "1. ", "10) ")
  const cleanName = name.replace(/^\d+[\.\-)]?\s*/, '');
  return cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Custom UI Components ───────────────────────────────────

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

function BusinessBadge({ name }: { name: string }) {
  const reviews = pseudoReviewCount(name);
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 align-middle ml-1">
      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-600">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[14px] w-[14px] shrink-0">
          <path d="M12 1.5l2.2 2.6 3.3-1 .6 3.4 3.4.6-1 3.3 2.6 2.2-2.6 2.2 1 3.3-3.4.6-.6 3.4-3.3-1L12 22.5l-2.2-2.6-3.3 1-.6-3.4-3.4-.6 1-3.3L1 11.4l2.6-2.2-1-3.3 3.4-.6.6-3.4 3.3 1L12 1.5z" fill="#9aa0a6" />
          <path d="M8 12.2l2.6 2.6L16 9.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <span>Non-Verified</span>
      </span>
      <span className="select-none text-[13px] font-normal text-gray-300">|</span>
      <span className="inline-flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <RatingStarCell key={i} fillFraction={1} />
        ))}
      </span>
      <span className="text-[12px] font-normal text-gray-800 mr-1">
        ( {reviews} reviews )
      </span>
    </span>
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
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body text-[15px] leading-[1.8] text-gray-800 text-justify">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ── Typography & Special Layouts ──
          p: ({ node, children }) => {
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
                       <BusinessBadge name={name} />
                    </div>
                  );
               }
            }

            return <p className="mb-4 last:mb-0 text-gray-700">{children}</p>;
          },
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
          
          // ── Headings ──
          h1: ({ children }) => (
            <h1 className="flex items-center text-2xl font-extrabold mt-8 mb-4 text-gray-900 tracking-tight border-b border-gray-200 pb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-emerald-600">
                {children}
              </span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-7 mb-3 text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[var(--color-primary)] rounded-full"></div>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-900">
              {children}
            </h3>
          ),

          // ── Lists & Search UI Interceptor ──
          ul: ({ children }) => (
            <ul className="mb-5 pl-6 list-none space-y-3 relative">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 pl-6 list-decimal marker:text-gray-500 marker:font-medium space-y-4">
              {children}
            </ol>
          ),
          li: ({ node, children, className }) => {
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
                              <span key={index} className="inline-flex flex-wrap items-center gap-1 align-middle">
                                <span className="font-semibold text-gray-900">{pChild}</span>
                                <BusinessBadge name={businessName} />
                              </span>
                           );
                       }
                    }
                    return pChild;
                 });
                 return React.cloneElement(child as React.ReactElement, {}, ...newPChildren);
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
                        <span key="strong" className="inline-flex flex-wrap items-center gap-1 align-middle">
                           <span className="font-semibold text-gray-900">{child}</span>
                           <BusinessBadge name={businessName} />
                        </span>
                      );
                  }
              }
              return child;
            });

            if (isBusiness && businessName) {
              return (
                <li className={`relative pl-2 mb-2 ${className || ""}`}>
                   <div className="text-gray-800">
                      {newChildren}
                   </div>
                </li>
              );
            }

            return (
              <li className={`relative pl-1 ${className || ""}`}>
                <span className="absolute -left-5 top-2.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span>
                <div className="text-gray-700">{children}</div>
              </li>
            );
          },

          // ── Links & Slug Interceptor ──
          a: ({ href, children }) => {
            if (href && href.startsWith("slug:")) {
               const slug = href.replace("slug:", "");
               const name = extractText(children).trim();
               return (
                 <span className="inline-flex flex-wrap items-center gap-1 align-middle">
                   <span className="font-semibold text-gray-900 text-[16.5px]">{children}</span>
                   <BusinessBadge name={name} />
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
          table: ({ children }) => (
            <div className="my-6 w-full overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50 border-b border-gray-200">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => <th className="px-4 py-3 font-semibold text-gray-900 text-sm">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 text-sm text-gray-700">{children}</td>,

          // ── Dividers ──
          hr: () => (
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-gray-200"></div>
              <div className="mx-4 text-gray-300">✦</div>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          ),

          // ── Blockquotes ──
          blockquote: ({ children }) => (
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

