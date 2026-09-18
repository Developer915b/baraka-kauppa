"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/site/language-provider";

const GALLERY = [
  { src: "/images/gallery-spices.png", alt: "Colorful spice display at Baraka Kauppa" },
  { src: "/images/gallery-produce.png", alt: "Fresh exotic fruits and vegetables" },
  { src: "/images/gallery-shelves.png", alt: "Shelves full of international groceries" },
] as const;

export function Gallery() {
  const { t } = useLanguage();

  return (
    <section id="gallery" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
            {t.gallery.label}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            {t.gallery.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            {t.gallery.subtitle}
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {GALLERY.map((img, i) => (
            <motion.figure
              key={img.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative overflow-hidden rounded-2xl shadow-md"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 to-transparent p-5 pt-10 text-white">
                <span className="text-sm font-medium">{t.gallery.captions[i]}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
