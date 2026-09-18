"use client";

import { LanguageProvider } from "@/components/site/language-provider";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Features } from "@/components/site/features";
import { About } from "@/components/site/about";
import { Categories } from "@/components/site/categories";
import { Gallery } from "@/components/site/gallery";
import { Visit } from "@/components/site/visit";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">
          <Hero />
          <Features />
          <About />
          <Categories />
          <Gallery />
          <Visit />
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
