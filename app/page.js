import FinalCTASection from "./components/sections/FinalCTASection";
import HeroSection from "./components/sections/HeroSection";
import HowItWorksSection from "./components/sections/HowItWorksSection";
import ProblemSection from "./components/sections/ProblemSection";
import SocialProofSection from "./components/sections/SocialProofSection";
import SolutionSection from "./components/sections/SolutionSection";
import TrustSecuritySection from "./components/sections/TrustSecuritySection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <TrustSecuritySection />
      <SocialProofSection />
      <FinalCTASection />
    </div>
  );
}
