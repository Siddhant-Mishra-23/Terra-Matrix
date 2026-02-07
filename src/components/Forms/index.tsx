"use client";

import { useState } from "react";
import NewsLatterBox from "./NewsLatterBox";
import { WEB3FORMS_CONTACT_KEY } from "@/config/web3forms";

const Forms = () => {
    const [result, setResult] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setResult("Sending...");
        const form = event.currentTarget;
        const formData = new FormData(form);
        const accessKey = WEB3FORMS_CONTACT_KEY;
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
        <section id="contact-form" className="overflow-hidden py-16 md:py-20 lg:py-28">
            <div className="container">
                <div className="-mx-4 flex flex-wrap">
                    <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
                        <div
                            className="mb-12 rounded-xs bg-white px-8 py-11 shadow-three sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
                            data-wow-delay=".15s"
                        >
                            <h2 className="mb-3 text-2xl font-bold text-black sm:text-3xl lg:text-2xl xl:text-3xl">
                                Need Help? Open a Ticket
                            </h2>
                            <p className="mb-12 text-base font-medium text-body-color">
                                Our support team will get back to you ASAP via email.
                            </p>
                            <form onSubmit={onSubmit}>
                                <div className="-mx-4 flex flex-wrap">
                                    <div className="w-full px-4 md:w-1/2">
                                        <div className="mb-8">
                                            <label
                                                htmlFor="name"
                                                className="mb-3 block text-sm font-medium text-dark"
                                            >
                                                Your Name
                                            </label>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                placeholder="Enter your name"
                                                required
                                                autoComplete="name"
                                                className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full px-4 md:w-1/2">
                                        <div className="mb-8">
                                            <label
                                                htmlFor="email"
                                                className="mb-3 block text-sm font-medium text-dark"
                                            >
                                                Your Email
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                required
                                                autoComplete="email"
                                                className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full px-4 md:w-1/2">
                                        <div className="mb-8">
                                            <label
                                                htmlFor="profession"
                                                className="mb-3 block text-sm font-medium text-dark"
                                            >
                                                Profession
                                            </label>
                                            <input
                                                id="profession"
                                                name="profession"
                                                type="text"
                                                placeholder="Enter your profession"
                                                className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full px-4 md:w-1/2">
                                        <div className="mb-8">
                                            <label
                                                htmlFor="mobile"
                                                className="mb-3 block text-sm font-medium text-dark"
                                            >
                                                Mobile Number (Optional)
                                            </label>
                                            <input
                                                id="mobile"
                                                name="mobile"
                                                type="tel"
                                                placeholder="Enter your mobile number"
                                                className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full px-4 md:w-1/2">
                                        <div className="mb-8">
                                            <label
                                                htmlFor="designation"
                                                className="mb-3 block text-sm font-medium text-dark"
                                            >
                                                Designation
                                            </label>
                                            <input
                                                id="designation"
                                                name="designation"
                                                type="text"
                                                placeholder="Enter your designation"
                                                className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full px-4 md:w-1/2">
                                        <div className="mb-8">
                                            <label
                                                htmlFor="city"
                                                className="mb-3 block text-sm font-medium text-dark"
                                            >
                                                City
                                            </label>
                                            <input
                                                id="city"
                                                name="city"
                                                type="text"
                                                placeholder="Enter your city"
                                                className="border-stroke w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full px-4">
                                        <div className="mb-8">
                                            <label
                                                htmlFor="message"
                                                className="mb-3 block text-sm font-medium text-dark"
                                            >
                                                Your Message
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={5}
                                                placeholder="Enter your Message"
                                                required
                                                className="border-stroke w-full resize-none rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="w-full px-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="rounded-xs bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            Submit Ticket
                                        </button>
                                        {result ? (
                                            <p className="mt-4 text-sm text-body-color">{result}</p>
                                        ) : null}
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
