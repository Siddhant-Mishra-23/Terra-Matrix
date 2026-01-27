import MasterAboutSection from "@/components/About/MasterAboutSection";
import Teams from "@/components/Team/TeamsScroll"
import Project from "@/components/Project";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Video from "@/components/Video";

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
