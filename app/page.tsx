import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";
import { CurrentlyBuilding } from "@/components/sections/currently-building";
import { DeepDives } from "@/components/sections/deep-dives";
import { SideProject } from "@/components/sections/side-project";
import { TechStack } from "@/components/sections/tech-stack";
import { Experience } from "@/components/sections/experience";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <CurrentlyBuilding />
        <DeepDives />
        <SideProject />
        <TechStack />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
