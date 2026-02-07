"use client";

import { motion } from "framer-motion";
import { Feature } from "@/types/feature";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const SingleFeature = ({ feature }: { feature: Feature }) => {
  const { icon, title, paragraph } = feature;
  return (
    <motion.div
      className="w-full"
      variants={itemVariants}
    >
      <motion.div
        className="group"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-primary/10 text-primary mb-10 flex h-[70px] w-[70px] items-center justify-center rounded-md transition-all duration-300 group-hover:bg-primary group-hover:text-white"
          whileHover={{
            scale: 1.1,
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 0.4 }}
        >
          {icon}
        </motion.div>
        <h3 className="mb-5 text-xl font-bold text-green sm:text-2xl lg:text-xl xl:text-2xl transition-colors duration-300 group-hover:text-primary">
          {title}
        </h3>
        <p className="text-body-color pr-[10px] text-base leading-relaxed font-medium">
          {paragraph}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SingleFeature;
