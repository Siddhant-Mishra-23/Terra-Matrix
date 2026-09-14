"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import SectionTitle from "../Common/SectionTitle";
import { TeamData } from "./TeamData";
import { Team as TeamType } from "@/types/team";

const CARD_SCROLL = 310; // card + gap

/* ----------------------------------
   Component
----------------------------------- */
const Team = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [shuffledTeam, setShuffledTeam] = useState<TeamType[]>([]);

  const startAutoScroll = () => {
    intervalRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: CARD_SCROLL, behavior: "smooth" });
      }
    }, 4000);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

  useEffect(() => {
    const fetchAndShuffle = async () => {
      let dataList: TeamType[] = TeamData;

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .order("order_index", { ascending: true });

        if (!error && data && data.length > 0) {
          dataList = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            role: d.designation || d.role,
            bio: d.summary || d.bio,
            image: d.image || "/images/favicon.png",
          }));
        }
      } catch (err) {
        console.error("Error fetching teams from Supabase:", err);
      }

      // Separate top 3 and others
      const partners = dataList.slice(0, 3);
      const others = dataList.slice(3);

      // Fisher-Yates shuffle
      const shuffleArray = (array: TeamType[]) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      };

      setShuffledTeam([...shuffleArray(partners), ...shuffleArray(others)]);
    };

    fetchAndShuffle();
  }, []);

  return (
    <section className="relative z-10 bg-[#F9FAFB] py-16 md:py-20 lg:py-24">
      <div className="container relative">
        <SectionTitle
          title="Meet Our Team"
          paragraph="A multidisciplinary team delivering precision-driven geospatial and engineering solutions."
          center
        />

        {/* Left Arrow */}
        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: -CARD_SCROLL, behavior: "smooth" })
          }
          aria-label="Scroll Left"
          className="absolute -left-2 sm:left-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-dark shadow-md border border-gray-200 transition hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
        >
          <span className="text-xl font-bold">‹</span>
        </button>

        {/* Right Arrow */}
        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: CARD_SCROLL, behavior: "smooth" })
          }
          aria-label="Scroll Right"
          className="absolute -right-2 sm:right-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-dark shadow-md border border-gray-200 transition hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
        >
          <span className="text-xl font-bold">›</span>
        </button>

        {/* Scrollable Compact Stylish Cards */}
        <div
          ref={scrollRef}
          onMouseEnter={stopAutoScroll}
          onMouseLeave={startAutoScroll}
          className="flex gap-5 overflow-hidden py-4 px-2"
        >
          {shuffledTeam.map((member, index) => (
            <motion.div
              key={member.id}
              className="w-[270px] sm:w-[285px] flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{
                y: -6,
                transition: { duration: 0.2 }
              }}
            >
              <Link
                href="/teams"
                className="group flex h-[350px] flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-lg relative overflow-hidden"
              >
                {/* Top Subtle Accent Stripe */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Avatar with Circular Ring */}
                  <div className="mb-4 flex justify-center">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-gray-100 group-hover:ring-primary/20 transition-all duration-300 shadow-sm">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </div>

                  {/* Member Name */}
                  <h3 className="mb-1 text-center text-base font-bold text-dark line-clamp-1 group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>

                  {/* Member Role */}
                  <p className="mb-3 text-center text-xs font-semibold text-primary line-clamp-1">
                    {member.role}
                  </p>

                  {/* Clamped Clean Bio */}
                  <p className="text-center text-xs leading-relaxed text-body-color line-clamp-3 px-1 border-t border-gray-100 pt-3">
                    {member.bio}
                  </p>
                </div>

                {/* Bottom CTA Link */}
                <div className="pt-3 border-t border-gray-100 text-center">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-dark group-hover:text-primary transition-colors">
                    <span>View Profile</span>
                    <span className="text-xs transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
