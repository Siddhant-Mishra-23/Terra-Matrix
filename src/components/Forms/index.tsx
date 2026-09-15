"use client";

import { WEB3FORMS_CONTACT_KEY } from "@/config/web3forms";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import NewsLatterBox from "./NewsLatterBox";

const Forms = () => {
  const [result, setResult] = useState("");
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Submitting ticket...");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = (formData.get("name") as string) || "";
    const email = (formData.get("email") as string) || "";
    const profession = (formData.get("profession") as string) || "";
    const mobile = (formData.get("mobile") as string) || "";
    const designation = (formData.get("designation") as string) || "";
    const city = (formData.get("city") as string) || "";
    const message = (formData.get("message") as string) || "";

    // Generate unique Ticket Tracking ID
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const refId = `TM-TCK-${new Date().getFullYear()}-${randomCode}`;

    // 1. Log directly into Supabase 'registrations' Table
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("registrations").insert([
        {
          reference_id: refId,
          type: "support_ticket",
          target_item_title: `Support Ticket: ${profession || "General Inquiry"} (${city || "Online"})`,
          full_name: name,
          email: email,
          phone: mobile || "N/A",
          organization: city ? `City: ${city}` : "Online Visitor",
          designation: [profession, designation].filter(Boolean).join(" • ") || "User / Client",
          message: message,
          status: "new",
          updated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message || "Failed to save support ticket to database.");
      }

      setTicketRef(refId);

      // 2. Dispatch to Web3Forms if configured
      const accessKey = WEB3FORMS_CONTACT_KEY;
      if (accessKey) {
        formData.append("access_key", accessKey);
        formData.append("Ticket_Ref_ID", refId);

        try {
          await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData,
          });
        } catch (err) {
          console.error("Web3Forms dispatch error:", err);
        }
      }

      form.reset();
      setResult(`Ticket submitted successfully! Your Ticket Ref ID is: ${refId}`);
    } catch (err: any) {
      console.error("Supabase ticket logging error:", err);
      setResult("Failed to submit support ticket. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-form" className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
            <div
              className="mb-12 rounded-2xl bg-white px-8 py-11 shadow-three sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px] border border-gray-100"
              data-wow-delay=".15s"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="text-2xl font-bold text-dark sm:text-3xl lg:text-2xl xl:text-3xl">
                  Need Help? Open a Ticket
                </h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Support & Consultation Desk
                </span>
              </div>
              <p className="mb-10 text-sm font-medium text-body-color">
                Our engineering and support team will get back to you ASAP via email or phone.
              </p>

              {result && (
                <div className="mb-6 rounded-xl bg-green/10 border border-green/30 p-4 text-xs font-semibold text-green flex items-start gap-2">
                  <svg className="h-4 w-4 shrink-0 text-green mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p>{result}</p>
                    {ticketRef && (
                      <p className="mt-1 text-[11px] text-dark">
                        Logged in Terra-Matrix Admin Portal. Our team has received your ticket.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={onSubmit}>
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-6">
                      <label
                        htmlFor="name"
                        className="mb-2 block text-xs font-semibold text-dark"
                      >
                        Your Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        required
                        autoComplete="name"
                        className="w-full rounded-lg border border-gray-200 bg-[#f8f8f8] px-4 py-3 text-xs text-dark focus:border-primary focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-6">
                      <label
                        htmlFor="email"
                        className="mb-2 block text-xs font-semibold text-dark"
                      >
                        Your Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        autoComplete="email"
                        className="w-full rounded-lg border border-gray-200 bg-[#f8f8f8] px-4 py-3 text-xs text-dark focus:border-primary focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-6">
                      <label
                        htmlFor="profession"
                        className="mb-2 block text-xs font-semibold text-dark"
                      >
                        Profession
                      </label>
                      <input
                        id="profession"
                        name="profession"
                        type="text"
                        placeholder="e.g. Civil Engineer / Researcher"
                        className="w-full rounded-lg border border-gray-200 bg-[#f8f8f8] px-4 py-3 text-xs text-dark focus:border-primary focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-6">
                      <label
                        htmlFor="mobile"
                        className="mb-2 block text-xs font-semibold text-dark"
                      >
                        Mobile Number (Optional)
                      </label>
                      <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        placeholder="+91-XXXXXXXXXX"
                        className="w-full rounded-lg border border-gray-200 bg-[#f8f8f8] px-4 py-3 text-xs text-dark focus:border-primary focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-6">
                      <label
                        htmlFor="designation"
                        className="mb-2 block text-xs font-semibold text-dark"
                      >
                        Designation / Organization
                      </label>
                      <input
                        id="designation"
                        name="designation"
                        type="text"
                        placeholder="e.g. Project Lead / Student"
                        className="w-full rounded-lg border border-gray-200 bg-[#f8f8f8] px-4 py-3 text-xs text-dark focus:border-primary focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-6">
                      <label
                        htmlFor="city"
                        className="mb-2 block text-xs font-semibold text-dark"
                      >
                        City / Location
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="Enter your city"
                        className="w-full rounded-lg border border-gray-200 bg-[#f8f8f8] px-4 py-3 text-xs text-dark focus:border-primary focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label
                        htmlFor="message"
                        className="mb-2 block text-xs font-semibold text-dark"
                      >
                        Your Message / Technical Scope *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        placeholder="Describe your inquiry, project scope, or assistance needed..."
                        required
                        className="w-full rounded-lg border border-gray-200 bg-[#f8f8f8] px-4 py-3 text-xs text-dark focus:border-primary focus:bg-white focus:outline-none transition resize-none"
                      ></textarea>
                    </div>
                  </div>
                  <div className="w-full px-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-green px-8 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                    >
                      {isSubmitting ? "Submitting Ticket..." : "Submit Support Ticket"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
            <NewsLatterBox />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Forms;
