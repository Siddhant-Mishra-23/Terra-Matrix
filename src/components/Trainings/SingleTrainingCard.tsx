"use client";

import RegistrationModal from "@/components/Common/RegistrationModal";
import { Training } from "@/types/training";
import Image from "next/image";
import { useState } from "react";

const SingleTrainingCard = ({ training }: { training: Training }) => {
  const {
    title,
    description,
    category,
    date,
    duration,
    mode,
    status,
    image,
    highlights,
    attendees,
    is_paid,
    price,
    upi_id,
    qr_image,
  } = training;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const isUpcoming = status === "upcoming";

  return (
    <>
      <div className="group shadow-one hover:shadow-two relative flex h-full flex-col overflow-hidden rounded-xl border border-stroke/50 bg-white transition duration-300 hover:-translate-y-1">
        {/* Card Header Media */}
        <div className="relative block aspect-16/9 w-full overflow-hidden bg-gray-50">
          <span className="bg-primary absolute top-4 left-4 z-20 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold text-white">
            {category}
          </span>
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
            {is_paid && price && (
              <span className="rounded-full bg-dark/80 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-white shadow">
                {price}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isUpcoming ? "bg-yellow text-white" : "bg-green text-white"
              }`}
            >
              {isUpcoming ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Upcoming
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </>
              )}
            </span>
          </div>

          <div className="relative h-full w-full p-6 flex items-center justify-center">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Card Content */}
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          {/* Meta badges: Mode & Duration */}
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-body-color">
            <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2.5 py-1 font-medium text-dark">
              <svg className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date}
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2.5 py-1 font-medium text-dark">
              <svg className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {duration}
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 font-semibold text-primary">
              {mode}
            </span>
          </div>

          <h3 className="mb-3 text-lg font-bold text-dark sm:text-xl line-clamp-2">
            {title}
          </h3>

          <p className="mb-4 text-sm leading-relaxed text-body-color line-clamp-3">
            {description}
          </p>

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <div className="mb-6 rounded-lg bg-gray-50/70 p-3.5">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-dark">
                Key Highlights:
              </h4>
              <ul className="space-y-1.5 text-xs text-body-color">
                {highlights.slice(0, 3).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer / CTA Buttons */}
          <div className="mt-auto border-t border-stroke/60 pt-4 flex items-center justify-between">
            {isUpcoming ? (
              <>
                <span className="text-xs font-semibold text-yellow">
                  Enrollment Open
                </span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-lg bg-green px-5 py-2 text-xs font-semibold text-white transition hover:bg-primary cursor-pointer shadow-sm"
                >
                  Registration
                </button>
              </>
            ) : (
              <>
                <span className="text-xs font-semibold text-green">
                  {attendees || "Successfully Completed"}
                </span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-green/30 bg-white px-4 py-2 text-xs font-semibold text-green transition hover:bg-green hover:text-white cursor-pointer"
                >
                  Request Module
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated Registration / Module Request Modal */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={isUpcoming ? "public_training" : "module_request"}
        targetTitle={title}
        targetDate={date}
        targetCategory={category}
        targetMode={mode}
        isPaid={is_paid}
        price={price}
        upiId={upi_id}
        qrImage={qr_image}
      />
    </>
  );
};

export default SingleTrainingCard;
