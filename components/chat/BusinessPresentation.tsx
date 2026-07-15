"use client";

import type React from "react";
import type {
  BusinessPresentation as Presentation,
  PresentedBusiness,
} from "@/lib/types";
import {
  ProfileButton,
  Rating,
  VerificationBadge,
  businessName,
  DetailFieldsGrid,
} from "./businessUi";

function SearchResults({ businesses }: { businesses: PresentedBusiness[] }) {
  return (
    <div className="my-4 flex flex-col gap-5 ml-2 sm:ml-4">
      {businesses.map((business, index) => (
        <article key={business.id} className="flex flex-col">
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

        <DetailFieldsGrid business={business} className="mt-6" />
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
              <th
                key={business.id}
                className="min-w-56 border-b border-emerald-100 px-5 py-4 text-base font-bold text-gray-950"
              >
                {businessName(business)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {compareRows.map((row) => (
            <tr
              key={row.label}
              className="group border-b border-gray-100 last:border-0 hover:bg-emerald-50/30"
            >
              <th className="sticky left-0 z-10 border-r border-gray-100 bg-gray-50 px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:bg-emerald-50">
                {row.label}
              </th>
              {businesses.map((business) => (
                <td
                  key={business.id}
                  className="px-5 py-4 align-top text-sm leading-6 text-gray-700"
                >
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
