"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "../Common/SectionTitle";
import { whyUsData, sectorsData, howWeWorkSteps } from "./whyTerraMatrixData";

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

const WhyTerraMatrix = () => {
    const [expandedSector, setExpandedSector] = useState<number | null>(null);

    const toggleSector = (id: number) => {
        setExpandedSector(expandedSector === id ? null : id);
    };

    return (
        <>
            {/* Why Terra Matrix Section */}
            <section id="why-terra-matrix" className="py-16 md:py-20 lg:py-28 bg-gray-50">
                <div className="container">
                    <SectionTitle
                        title="Why Terra Matrix"
                        paragraph="What sets us apart in engineering excellence"
                        center
                        mb="60px"
                    />

                    <motion.div
                        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {whyUsData.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="group relative rounded-xl bg-white p-6 shadow-one transition-all duration-300 hover:shadow-two"
                            >
                                <motion.div
                                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white"
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    {item.icon}
                                </motion.div>
                                <h4 className="mb-2 text-lg font-bold text-green">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-body-color">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Sectors We Serve Section */}
            <section id="sectors-we-serve" className="py-16 md:py-20 lg:py-28">
                <div className="container">
                    <SectionTitle
                        title="Sectors We Serve"
                        paragraph="Delivering solutions across diverse domains"
                        center
                        mb="60px"
                    />

                    <motion.div
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {sectorsData.map((sector) => (
                            <motion.div
                                key={sector.id}
                                variants={itemVariants}
                                layout
                                className="group relative overflow-hidden rounded-lg border-2 border-primary/20 bg-white transition-all duration-300 hover:border-primary hover:shadow-lg cursor-pointer"
                                onClick={() => toggleSector(sector.id)}
                            >
                                <div className="p-6 text-center">
                                    <div className="relative z-10">
                                        <motion.div
                                            className="mb-3 flex justify-center"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${expandedSector === sector.id
                                                ? "bg-primary text-white"
                                                : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                                }`}>
                                                {sector.icon}
                                            </div>
                                        </motion.div>
                                        <h4 className="text-base font-semibold text-green transition-all duration-300">
                                            {sector.title}
                                        </h4>

                                        {/* Expand/Collapse Indicator */}
                                        <motion.div
                                            className="mt-3 flex justify-center"
                                            animate={{ rotate: expandedSector === sector.id ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <svg
                                                className="w-5 h-5 text-primary"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Expandable Content */}
                                <AnimatePresence>
                                    {expandedSector === sector.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden border-t border-primary/10"
                                        >
                                            <div className="p-4 bg-primary/5">
                                                <p className="text-sm text-body-color leading-relaxed">
                                                    {sector.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How We Work Section */}
            <section id="how-we-work" className="py-16 md:py-20 lg:py-28 bg-green">
                <div className="container">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-[45px]">
                            How We Work
                        </h2>
                        <p className="mx-auto max-w-[600px] text-base text-white/80 md:text-lg">
                            Our systematic approach to delivering excellence
                        </p>
                    </div>

                    {/* Workflow Steps */}
                    <motion.div
                        className="relative"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {/* Connection Line - Desktop */}
                        <div className="absolute left-0 right-0 top-12 hidden h-1 bg-white/30 lg:block" />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                            {howWeWorkSteps.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    className="relative text-center"
                                >
                                    {/* Step Icon Circle */}
                                    <motion.div
                                        className="relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-primary shadow-lg text-white"
                                        whileHover={{
                                            boxShadow: "0 0 20px rgba(255,255,255,0.5)",
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {item.icon}
                                    </motion.div>

                                    {/* Arrow for desktop */}
                                    {index < howWeWorkSteps.length - 1 && (
                                        <motion.div
                                            className="absolute right-0 top-10 hidden translate-x-1/2 text-white/50 lg:block"
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 5l7 7-7 7" />
                                            </svg>
                                        </motion.div>
                                    )}

                                    <h4 className="mb-2 text-xl font-bold text-white">
                                        {item.step}
                                    </h4>
                                    <p className="text-sm text-white/70">
                                        {item.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default WhyTerraMatrix;
