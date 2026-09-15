"use client";

import RegistrationModal from "@/components/Common/RegistrationModal";
import { createClient } from "@/lib/supabase/client";
import { Conference } from "@/types/conference";
import Image from "next/image";
import { useEffect, useState } from "react";
import SectionTitle from "../Common/SectionTitle";

const fallbackConferences: Conference[] = [
  {
    id: "1",
    title: "National Symposium on AI Applications in Civil & Geospatial Infrastructure 2026",
    description:
      "A flagship conference bringing together leading academicians, industry experts, and government stakeholders to discuss emerging AI paradigms in smart infrastructure.",
    venue: "Bhubaneswar / Hybrid",
    date: "November 14-15, 2026",
    category: "National Conference",
    image: "/images/about/innovation.svg",
    status: "upcoming",
    registration_link: "/contact",
    highlights: [
      "Keynotes by AI & Civil Engineering Pioneers",
      "Peer-Reviewed Paper Presentations",
      "Industry Tech Demonstrations & Networking",
      "Proceedings Published with ISBN / DOI Indexing",
    ],
  },
  {
    id: "2",
    title: "International Workshop on Remote Sensing for Water Resource Resilience",
    description:
      "An interactive symposium on climate adaptation, hydrological modeling, and satellite data analytics for water security.",
    venue: "Online Virtual Summit",
    date: "December 05, 2026",
    category: "International Workshop",
    image: "/images/about/geospatial.svg",
    status: "upcoming",
    registration_link: "/contact",
    highlights: [
      "Global Case Studies from 10+ Countries",
      "Hands-on Technical Demonstration",
      "Policy & Governance Panel Discussions",
    ],
  },
];

export default function ConferencesSection() {
  const [conferences, setConferences] = useState<Conference[]>(fallbackConferences);
  const [activeModalConference, setActiveModalConference] = useState<Conference | null>(null);

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("conferences")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setConferences(data as Conference[]);
        }
      } catch (err) {
        console.error("Error fetching conferences from Supabase:", err);
      }
    };

    fetchConferences();
  }, []);

  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="container">
        <SectionTitle
          title="Conferences & Technical Symposiums"
          paragraph="Discover our upcoming academic summits, research presentations, and engineering forums advancing sustainable infrastructure, geospatial intelligence, and AI."
          center
          mb="60px"
        />

        {conferences.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-sm text-body-color bg-gray-50/50">
            No conferences or symposiums scheduled currently. Check back soon for updates!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-stretch">
            {conferences.map((item) => {
              const isUpcoming = item.status === "upcoming";

              return (
                <div
                  key={item.id}
                  className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stroke/60 bg-white p-6 shadow-one transition hover:shadow-two sm:p-8"
                >
                  <div>
                    {/* Meta Badges */}
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {item.category}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isUpcoming ? "bg-yellow text-white" : "bg-green text-white"
                        }`}
                      >
                        {isUpcoming ? "Upcoming" : "Completed"}
                      </span>
                      {item.is_paid && item.price && (
                        <span className="rounded-full bg-dark px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                          {item.price}
                        </span>
                      )}
                    </div>

                    <div className="mb-4 flex items-start gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 p-2">
                        <Image
                          src={item.image || "/images/about/innovation.svg"}
                          alt={item.title}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-dark sm:text-2xl group-hover:text-primary transition line-clamp-2 min-h-[56px] leading-snug">
                          {item.title}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-body-color">
                          <span className="inline-flex items-center gap-1 font-medium text-dark">
                            📅 {item.date}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            📍 {item.venue}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mb-6 text-sm leading-relaxed text-body-color line-clamp-3 min-h-[60px]">
                      {item.description}
                    </p>

                    {item.highlights && item.highlights.length > 0 && (
                      <div className="mb-6 rounded-xl bg-gray-50 p-4">
                        <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-dark">
                          Session Highlights:
                        </h4>
                        <ul className="space-y-2 text-xs text-body-color">
                          {item.highlights.slice(0, 3).map((h, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2 text-primary font-bold">✓</span>
                              <span className="line-clamp-1">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <span className="text-xs text-body-color font-medium">
                      Paper Submissions & Delegates
                    </span>
                    <button
                      onClick={() => setActiveModalConference(item)}
                      className="inline-flex items-center justify-center rounded-lg bg-green px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-primary cursor-pointer shadow-sm"
                    >
                      Registration
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conference Registration Modal */}
      {activeModalConference && (
        <RegistrationModal
          isOpen={!!activeModalConference}
          onClose={() => setActiveModalConference(null)}
          defaultType="conference"
          targetTitle={activeModalConference.title}
          targetDate={activeModalConference.date}
          targetCategory={activeModalConference.category}
          targetMode={activeModalConference.venue}
          isPaid={activeModalConference.is_paid}
          price={activeModalConference.price}
          upiId={activeModalConference.upi_id}
          qrImage={activeModalConference.qr_image}
        />
      )}
    </section>
  );
}
