"use client";

import type React from "react";
import {
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";
import type { PresentedBusiness } from "@/lib/types";

export function businessName(business: PresentedBusiness) {
  return business.business_name || business.full_name || "Business";
}

export function VerificationBadge({ status }: { status?: string | null }) {
  const normalized = (status || "").toLowerCase();
  const guaranteed = normalized === "business_guaranteed";
  const verified = guaranteed || normalized === "verified";
  const Icon = guaranteed ? ShieldCheck : CheckCircle2;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        verified ? "text-emerald-700" : "text-gray-600"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${verified ? "fill-emerald-100" : "fill-gray-100"}`} />
      {guaranteed ? "Business Guaranteed" : verified ? "Verified" : "Non-Verified"}
    </span>
  );
}

export function Rating({ business }: { business: PresentedBusiness }) {
  const rating = Math.max(0, Math.min(5, business.display_rating || 0));

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="inline-flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
        {[0, 1, 2, 3, 4].map((index) => (
          <span
            key={index}
            className="relative inline-flex h-4 w-4 items-center justify-center overflow-hidden rounded-[4px] bg-amber-400"
          >
            <span
              className="absolute inset-0 bg-gray-200"
              style={{ left: `${Math.max(0, Math.min(1, rating - index)) * 100}%` }}
            />
            <svg viewBox="0 0 24 24" className="relative z-10 h-3 w-3 fill-white" aria-hidden="true">
              <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
            </svg>
          </span>
        ))}
      </span>
      <span className="text-xs text-gray-600">
        ({business.display_review_count} reviews)
      </span>
    </span>
  );
}

export function ProfileButton({ business }: { business: PresentedBusiness }) {
  if (!business.profile_url) return null;

  return (
    <a
      href={business.profile_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-[#e6ffda] px-4 py-1.5 text-xs font-semibold text-gray-900 no-underline shadow-[inset_0_0_0_1px_rgba(13,79,57,0.08)] transition hover:-translate-y-0.5 hover:bg-[#dcfcca] hover:shadow-sm"
    >
      View Profile
      <Store className="h-3.5 w-3.5 text-emerald-700" />
    </a>
  );
}

export function DetailField({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  href?: string;
}) {
  if (!value) return null;
  const content = href ? (
    <a href={href} className="break-all font-medium text-emerald-700 hover:underline">
      {value}
    </a>
  ) : (
    <span className="break-words font-medium text-gray-800">{value}</span>
  );

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5">
      <span className="mt-0.5 rounded-lg bg-white p-2 text-emerald-700 shadow-sm">{icon}</span>
      <div className="min-w-0">
        <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</div>
        <div className="text-sm leading-6">{content}</div>
      </div>
    </div>
  );
}

export function DetailFieldsGrid({
  business,
  className = "",
}: {
  business: PresentedBusiness;
  className?: string;
}) {
  return (
    <div className={`grid gap-3 md:grid-cols-2 ${className}`}>
      <DetailField icon={<MapPin className="h-4 w-4" />} label="Address" value={business.business_address} />
      <DetailField
        icon={<Phone className="h-4 w-4" />}
        label="Phone"
        value={business.mobile_number}
        href={business.mobile_number ? `tel:${business.mobile_number}` : undefined}
      />
      <DetailField
        icon={<MessageCircle className="h-4 w-4" />}
        label="WhatsApp"
        value={business.whatsapp_number}
        href={
          business.whatsapp_number
            ? `https://wa.me/${business.whatsapp_number.replace(/\D/g, "")}`
            : undefined
        }
      />
      <DetailField
        icon={<Mail className="h-4 w-4" />}
        label="Email"
        value={business.email}
        href={business.email ? `mailto:${business.email}` : undefined}
      />
      <DetailField icon={<MapPin className="h-4 w-4" />} label="City" value={business.city} />
      <DetailField
        icon={<ExternalLink className="h-4 w-4" />}
        label="Website"
        value={business.website_url}
        href={business.website_url || undefined}
      />
    </div>
  );
}
