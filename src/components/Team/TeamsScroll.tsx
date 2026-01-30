"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import SectionTitle from "../Common/SectionTitle";
import { TeamData } from "./TeamData";
import { Team as TeamType } from "@/types/team";

const CARD_SCROLL = 392; // card + gap

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
    return stopAutoScroll;
  }, []);

  useEffect(() => {
    // Separate partners (top 3) and others
    const partners = TeamData.filter((member) => [1, 2, 3].includes(member.id));
    const others = TeamData.filter((member) => ![1, 2, 3].includes(member.id));

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
  }, []);

  return (
    <section className="relative z-10 bg-gray-light py-16 dark:bg-bg-color-dark md:py-20 lg:py-28">
      <div className="container relative">
        <SectionTitle
          title="Meet Our Team"
          paragraph="A multidisciplinary team delivering precision-driven geospatial solutions."
          center
        />

        {/* Left Arrow */}
        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: -CARD_SCROLL, behavior: "smooth" })
          }
          aria-label="Scroll Left"
          className="absolute left-2 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-two transition hover:bg-primary hover:text-white dark:bg-dark"
        >
          <span className="text-2xl font-semibold">‹</span>
        </button>

        {/* Right Arrow */}
        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: CARD_SCROLL, behavior: "smooth" })
          }
          aria-label="Scroll Right"
          className="absolute right-2 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-two transition hover:bg-primary hover:text-white dark:bg-dark"
        >
          <span className="text-2xl font-semibold">›</span>
        </button>

        {/* Scrollable Cards */}
        <div
          ref={scrollRef}
          onMouseEnter={stopAutoScroll}
          onMouseLeave={startAutoScroll}
          className="flex gap-8 overflow-hidden py-4"
        >
          {shuffledTeam.map((member, index) => (
            <motion.div
              key={member.id}
              className="w-[360px] flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
                transition: { duration: 0.2 }
              }}
            >
              <Link
                href="/teams"
                className="block h-full rounded-xs bg-white p-8 shadow-two transition duration-300 hover:shadow-one dark:bg-dark dark:shadow-three"
              >
                <div className="mb-6 flex justify-center">
                  <div className="relative h-[96px] w-[96px] overflow-hidden rounded-full">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="96px"
                    />
                  </div>
                </div>

                <h3 className="mb-1 text-center text-lg font-semibold text-dark dark:text-white">
                  {member.name}
                </h3>

                <p className="mb-4 text-center text-sm font-medium text-primary">
                  {member.role}
                </p>

                <p className="text-center text-sm leading-relaxed text-body-color dark:text-white/80">
                  {member.bio}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
