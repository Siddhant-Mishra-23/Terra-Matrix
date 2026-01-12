"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";
import { TeamData } from "./TeamData";
const CARD_SCROLL = 392; // card + gap

/* ----------------------------------
   Component
----------------------------------- */
const Team = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
          className="flex gap-8 overflow-hidden"
        >
          {TeamData.map((member) => (
            <div key={member.id} className="w-[360px] flex-shrink-0">
              <div className="h-full rounded-xs bg-white p-8 shadow-two transition hover:shadow-one dark:bg-dark dark:shadow-three">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
