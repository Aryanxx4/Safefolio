import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Preview from "@/components/Preview";
import Testimonials from "@/components/Testimonials";
import SiteFooter from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Preview />
      <Testimonials />
      <SiteFooter />
    </main>
  );
}

