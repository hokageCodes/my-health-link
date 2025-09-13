import HeroSection from "./components/sections/HeroSection";
import HowItWorksSection from "./components/sections/HowItWorksSection";
import ProblemSection from "./components/sections/ProblemSection";
import SolutionSection from "./components/sections/SolutionSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
    </div>
  );
}
