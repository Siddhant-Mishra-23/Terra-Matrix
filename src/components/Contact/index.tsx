"use client";

import { motion } from "framer-motion";
import SectionTitle from "../Common/SectionTitle";

const contactInfo = {
  companyName: "Terra Matrix Engineering Consultants",
  address: "123 Innovation Street, Tech Park, Bengaluru, Karnataka - 560001, India",
  gstin: "29XXXXX1234X1ZX",
  email: "business@terramatrix.in",
  phone: "+91 98765 43210",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5965!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE4LjAiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v1234567890",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const Contact = () => {
  return (
    <section id="contact-info" className="py-16 md:py-20 lg:py-28 bg-gray-50">
      <div className="container">
        <SectionTitle
          title="Contact Us"
          paragraph="Get in touch with Terra Matrix Engineering Consultants"
          center
          mb="60px"
        />

        <motion.div
          className="grid grid-cols-1 gap-8 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Contact Details */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-white p-8 shadow-one"
          >
            <h3 className="mb-8 text-2xl font-bold text-green">
              Our Details
            </h3>

            {/* Company Name */}
            <div className="mb-6 flex items-start">
              <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 text-lg font-semibold text-dark">Company Name</h4>
                <p className="text-body-color">{contactInfo.companyName}</p>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6 flex items-start">
              <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 text-lg font-semibold text-dark">Address</h4>
                <p className="text-body-color">{contactInfo.address}</p>
              </div>
            </div>

            {/* GSTIN */}
            <div className="mb-6 flex items-start">
              <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 text-lg font-semibold text-dark">GSTIN</h4>
                <p className="text-body-color font-mono">{contactInfo.gstin}</p>
              </div>
            </div>

            {/* Email */}
            <div className="mb-6 flex items-start">
              <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 text-lg font-semibold text-dark">Email</h4>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-primary hover:underline"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start">
              <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 text-lg font-semibold text-dark">Phone</h4>
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="text-primary hover:underline"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-white p-4 shadow-one overflow-hidden"
          >
            <div className="h-full min-h-[400px] rounded-lg overflow-hidden">
              <iframe
                src={contactInfo.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Terra Matrix Location"
                className="rounded-lg"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
