import { Hero } from "@/components/site/hero";
import { Features } from "@/components/site/features";
import { Gallery } from "@/components/site/gallery";
import { HomeCta } from "@/components/site/home-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Gallery />
      <HomeCta />
    </>
  );
}
