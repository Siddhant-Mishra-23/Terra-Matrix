"use client";

import { WEB3FORMS_NEWSLETTER_KEY } from "@/config/web3forms";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const NewsLatterBox = () => {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Subscribing...");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = (formData.get("name") as string) || "Subscriber";
    const email = (formData.get("email") as string) || "";

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const refId = `TM-NEWS-${new Date().getFullYear()}-${randomCode}`;

    // 1. Log into Supabase registrations table
    try {
      const supabase = createClient();
      await supabase.from("registrations").insert([
        {
          reference_id: refId,
          type: "newsletter",
          target_item_title: "Newsletter & Innovation Digest Subscription",
          full_name: name,
          email: email,
          phone: "N/A",
          organization: "Newsletter Subscriber",
          designation: "Subscriber",
          status: "enrolled",
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Newsletter Supabase logging error:", err);
    }

    // 2. Dispatch to Web3Forms if configured
    const accessKey = WEB3FORMS_NEWSLETTER_KEY;
    if (accessKey) {
      formData.append("access_key", accessKey);
      formData.append("Subscriber_Ref_ID", refId);

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
    setIsSubmitting(false);
    setResult("Subscribed successfully! Thank you for staying connected.");
  };

  return (
    <div className="shadow-three relative z-10 rounded-2xl bg-white p-8 sm:p-11 lg:p-8 xl:p-11 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
          ✉
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Stay Informed
        </span>
      </div>
      <h3 className="mb-2 text-xl leading-tight font-bold text-dark sm:text-2xl">
        Subscribe to receive future updates
      </h3>
      <p className="border-body-color/25 text-body-color mb-8 border-b pb-6 text-xs leading-relaxed">
        Subscribe to our newsletter to stay updated with the latest Innovations, Geospatial AI breakthroughs, and Projects.
      </p>

      {result && (
        <div className="mb-4 rounded-lg bg-green/10 p-3 text-xs font-semibold text-green">
          {result}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="mb-1 block text-xs font-semibold text-dark">Your Name</label>
          <input
            id="newsletter-name"
            type="text"
            name="name"
            placeholder="Enter your name"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-gray-200 bg-[#f8f8f8] px-4 py-2.5 text-xs text-dark focus:border-primary focus:bg-white focus:outline-none transition"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold text-dark">Your Email</label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-200 bg-[#f8f8f8] px-4 py-2.5 text-xs text-dark focus:border-primary focus:bg-white focus:outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-green shadow-submit mb-4 flex w-full items-center justify-center rounded-lg px-6 py-3 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting ? "Subscribing..." : "Subscribe to Digest"}
        </button>

        <p className="text-[11px] text-body-color text-center leading-relaxed">
          No spam guaranteed. We respect your privacy!
        </p>
      </form>
    </div>
  );
};

export default NewsLatterBox;
