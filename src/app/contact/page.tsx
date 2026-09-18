import type { Metadata } from "next";
import { About } from "@/components/site/about";
import { Visit } from "@/components/site/visit";
import { Contact } from "@/components/site/contact";

export const metadata: Metadata = {
  title: "About & Contact",
  description:
    "Get to know Baraka Kauppa — Kouvola's newest international grocery store — and reach us: Kouvolankatu 34 A31, +358 45 8652799, hossainsohid@gmail.com.",
};

export default function ContactPage() {
  return (
    <>
      <About />
      <Visit />
      <Contact />
    </>
  );
}
