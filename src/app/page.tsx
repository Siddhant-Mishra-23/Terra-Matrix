import Teams from "@/components/Team/TeamsScroll"
import Project from "@/components/Project";
import ScrollUp from "@/components/Common/ScrollUp";
import Forms from "@/components/Forms";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Video from "@/components/Video";
import WhyTerraMatrix from "@/components/WhyTerraMatrix";

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <Video />
      <WhyTerraMatrix />
      <Teams />
      <Project />
      <Forms />
    </>
  );
}

