"use client";

import { useState } from "react";
import { WEB3FORMS_NEWSLETTER_KEY } from "@/config/web3forms";

const NewsLatterBox = () => {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Sending...");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const accessKey = WEB3FORMS_NEWSLETTER_KEY;
    if (!accessKey) {
      form.reset();
      setIsSubmitting(false);
      return;
    }
    formData.append("access_key", accessKey);
    form.reset();

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      const data = (() => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })();

      const successValue = data?.success;
      const normalizedSuccess =
        typeof successValue === "string"
          ? successValue.trim().toLowerCase()
          : successValue;
      const isSuccess =
        normalizedSuccess === true ||
        normalizedSuccess === 1 ||
        normalizedSuccess === "true" ||
        normalizedSuccess === "1";
      const isFailure =
        normalizedSuccess === false ||
        normalizedSuccess === 0 ||
        normalizedSuccess === "false" ||
        normalizedSuccess === "0";
      const isOkStatus = response.status >= 200 && response.status < 400;

      if (isSuccess || (isOkStatus && !isFailure)) {
        setResult("Message sent successfully");
      } else {
        setResult(data?.message || `Error (${response.status})`);
      }
    } catch (error) {
      setResult("Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shadow-three dark:bg-gray-dark relative z-10 rounded-xs bg-white p-8 sm:p-11 lg:p-8 xl:p-11">
      <h3 className="mb-4 text-2xl leading-tight font-bold text-black dark:text-white">
        Subscribe to receive future updates
      </h3>
      <p className="border-body-color/25 text-body-color mb-11 border-b pb-11 text-base leading-relaxed dark:border-white/25">
        Subscribe to our newsletter to stay updated with the latest Innovations and Projects.
      </p>
      <form onSubmit={onSubmit}>
        <input
          id="newsletter-name"
          type="text"
          name="name"
          placeholder="Enter your name"
          required
          autoComplete="name"
          className="border-stroke text-body-color focus:border-primary dark:text-body-color-dark dark:shadow-two dark:focus:border-primary mb-4 w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
        />
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          autoComplete="email"
          className="border-stroke text-body-color focus:border-primary dark:text-body-color-dark dark:shadow-two dark:focus:border-primary mb-4 w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary shadow-submit hover:bg-primary/90 dark:shadow-submit-dark mb-5 flex w-full items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Subscribe
        </button>
        {result ? (
          <p className="text-body-color dark:text-body-color-dark mb-3 text-center text-base leading-relaxed">
            {result}
          </p>
        ) : null}
        <p className="text-body-color dark:text-body-color-dark text-center text-base leading-relaxed">
          No spam guaranteed, We value and care for your privacy!
        </p>
      </form>

      <div />
    </div>
  );
};

export default NewsLatterBox;
