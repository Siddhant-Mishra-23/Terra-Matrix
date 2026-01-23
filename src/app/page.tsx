import MasterAboutSection from "@/components/About/MasterAboutSection";
import Teams from "@/components/Team/TeamsScroll"
import Project from "@/components/Project";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Video from "@/components/Video";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terra Matrix - Innovative Digital Solutions",
  description: "We design and develop scalable, high-performance digital products that help businesses grow and stand out",
  // other metadata
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <Video />
      <MasterAboutSection/>
      <Teams/>
      <Project />
      <Contact />
    </>
  );
}
