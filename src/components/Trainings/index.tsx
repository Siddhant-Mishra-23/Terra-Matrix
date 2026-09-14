"use client";

import RegistrationModal from "@/components/Common/RegistrationModal";
import { createClient } from "@/lib/supabase/client";
import { Training } from "@/types/training";
import { useEffect, useState } from "react";
import SectionTitle from "../Common/SectionTitle";
import SingleTrainingCard from "./SingleTrainingCard";
import {
  completedTrainings as fallbackCompleted,
  upcomingTrainings as fallbackUpcoming,
} from "./trainingsData";

const TrainingsSection = () => {
  const [upcoming, setUpcoming] = useState<Training[]>(fallbackUpcoming);
  const [completed, setCompleted] = useState<Training[]>(fallbackCompleted);
  const [loading, setLoading] = useState(true);
  const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("trainings")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const up = data.filter((t: any) => t.status === "upcoming");
          const comp = data.filter((t: any) => t.status === "completed");

          setUpcoming(up as Training[]);
          setCompleted(comp as Training[]);
        }
      } catch (err) {
        console.error("Error fetching live trainings from Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  return (
    <div className="py-16 md:py-20 lg:py-24">
      {/* 1. UPCOMING TRAININGS SECTION */}
      <section id="upcoming-trainings" className="pb-16 md:pb-20">
        <div className="container">
          <SectionTitle
            title="Upcoming Trainings & Workshops"
            paragraph="Join our upcoming expert-led training sessions designed to provide practical, hands-on experience with modern GIS, AI modeling, and civil infrastructure tools."
            center
            mb="50px"
          />

          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-sm text-body-color">
              No upcoming training batches scheduled right now. Check back soon or contact us for custom workshops.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {upcoming.map((training) => (
                <div key={training.id} className="w-full flex h-full">
                  <SingleTrainingCard training={training} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CUSTOM / CORPORATE TRAINING BANNER */}
      <div className="container my-8">
        <div className="relative overflow-hidden rounded-2xl bg-green p-8 text-white sm:p-12 shadow-two">
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="max-w-2xl text-center md:text-left">
              <h3 className="mb-2 text-2xl font-bold sm:text-3xl text-white">
                Looking for Custom Institutional or Corporate Training?
              </h3>
              <p className="text-sm text-gray-200 sm:text-base">
                We design tailored capacity-building modules and syllabus-aligned workshops for engineering colleges, government bodies, and corporate engineering teams.
              </p>
            </div>
            <button
              onClick={() => setIsCorporateModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-yellow px-6 py-3 text-sm font-semibold text-white transition hover:bg-yellow/90 cursor-pointer shadow-md"
            >
              Contact for Custom Training
            </button>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* 2. COMPLETED TRAININGS SECTION */}
      <section id="completed-trainings" className="pt-16 md:pt-20">
        <div className="container">
          <SectionTitle
            title="Completed Trainings & Past Programs"
            paragraph="A look back at our successfully delivered training programs and skill development initiatives for engineers, researchers, and students."
            center
            mb="50px"
          />

          {completed.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-sm text-body-color">
              Past training program logs will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {completed.map((training) => (
                <div key={training.id} className="w-full flex h-full">
                  <SingleTrainingCard training={training} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Corporate / Institutional Custom Training Modal */}
      <RegistrationModal
        isOpen={isCorporateModalOpen}
        onClose={() => setIsCorporateModalOpen(false)}
        defaultType="corporate_training"
        targetTitle="Custom Institutional / Corporate Capacity Building"
        targetCategory="Institutional / Corporate Training"
        targetMode="Hybrid"
      />
    </div>
  );
};

export default TrainingsSection;
