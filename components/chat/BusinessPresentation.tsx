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
import type {
  BusinessPresentation as Presentation,
  PresentedBusiness,
} from "@/lib/types";

function businessName(business: PresentedBusiness) {
  return business.business_name || business.full_name || "Business";
}

function VerificationBadge({ status }: { status?: string | null }) {
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

function Rating({ business }: { business: PresentedBusiness }) {
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

function ProfileButton({ business }: { business: PresentedBusiness }) {
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

function SearchResults({ businesses }: { businesses: PresentedBusiness[] }) {
  return (
    <div className="my-4 flex flex-col gap-5 ml-2 sm:ml-4">
      {businesses.map((business, index) => (
        <article
          key={business.id}
          className="flex flex-col"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="m-0 text-[17px] font-bold leading-6 text-gray-950">
              {index + 1}. {businessName(business)}
            </h3>
            {business.match_quality === "related" && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                Related match
              </span>
            )}
            <VerificationBadge status={business.package_status} />
            <Rating business={business} />
            <ProfileButton business={business} />
          </div>
          <p className="mb-0 mt-3 max-w-4xl text-[14px] leading-7 text-gray-700 text-justify">
            {business.description}
          </p>
        </article>
      ))}
    </div>
  );
}

function DetailField({
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

function BusinessDetail({ business }: { business: PresentedBusiness }) {
  return (
    <article className="my-5 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_18px_55px_-35px_rgba(5,89,73,0.55)]">
      <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-2xl font-extrabold tracking-tight text-gray-950">
              {businessName(business)}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <VerificationBadge status={business.package_status} />
              <Rating business={business} />
            </div>
          </div>
          <ProfileButton business={business} />
        </div>
      </div>

      <div className="p-6">
        <section>
          <h3 className="mb-2 mt-0 text-sm font-bold uppercase tracking-wider text-emerald-800">
            About
          </h3>
          <p className="m-0 text-[15px] leading-7 text-gray-700">{business.description}</p>
        </section>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
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
            href={business.whatsapp_number ? `https://wa.me/${business.whatsapp_number.replace(/\D/g, "")}` : undefined}
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
      </div>
    </article>
  );
}

const compareRows: Array<{
  label: string;
  value: (business: PresentedBusiness) => React.ReactNode;
}> = [
  { label: "Description", value: (business) => business.description },
  { label: "City", value: (business) => business.city || "Not listed" },
  {
    label: "Status",
    value: (business) => <VerificationBadge status={business.package_status} />,
  },
  { label: "Rating", value: (business) => <Rating business={business} /> },
  { label: "Phone", value: (business) => business.mobile_number || "Not listed" },
  { label: "WhatsApp", value: (business) => business.whatsapp_number || "Not listed" },
  { label: "Address", value: (business) => business.business_address || "Not listed" },
  {
    label: "Profile",
    value: (business) => <ProfileButton business={business} />,
  },
];

function BusinessComparison({ businesses }: { businesses: PresentedBusiness[] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-[0_12px_40px_-30px_rgba(15,23,42,0.45)]">
      <table className="min-w-[720px] w-full border-collapse text-left">
        <thead>
          <tr className="bg-gradient-to-r from-emerald-50 to-lime-50">
            <th className="sticky left-0 z-20 w-36 border-b border-r border-emerald-100 bg-emerald-50 px-4 py-4 text-xs font-bold uppercase tracking-wider text-emerald-800">
              Compare
            </th>
            {businesses.map((business) => (
              <th key={business.id} className="min-w-56 border-b border-emerald-100 px-5 py-4 text-base font-bold text-gray-950">
                {businessName(business)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {compareRows.map((row) => (
            <tr key={row.label} className="group border-b border-gray-100 last:border-0 hover:bg-emerald-50/30">
              <th className="sticky left-0 z-10 border-r border-gray-100 bg-gray-50 px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:bg-emerald-50">
                {row.label}
              </th>
              {businesses.map((business) => (
                <td key={business.id} className="px-5 py-4 align-top text-sm leading-6 text-gray-700">
                  {row.value(business)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BusinessPresentation({ presentation }: { presentation: Presentation }) {
  if (presentation.type === "detail") {
    return <BusinessDetail business={presentation.businesses[0]} />;
  }
  if (presentation.type === "compare") {
    return <BusinessComparison businesses={presentation.businesses} />;
  }
  return <SearchResults businesses={presentation.businesses} />;
}
