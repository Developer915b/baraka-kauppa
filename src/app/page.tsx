"use client";

import { LanguageProvider } from "@/components/site/language-provider";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Features } from "@/components/site/features";
import { About } from "@/components/site/about";
import { Categories } from "@/components/site/categories";
import { Shop } from "@/components/site/shop";
import { CartSheet } from "@/components/site/cart-sheet";
import { Gallery } from "@/components/site/gallery";
import { Visit } from "@/components/site/visit";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
        <Header />
        <main className="flex-1">
          <Hero />
          <Features />
          <About />
          <Categories />
          <Shop />
          <Gallery />
          <Visit />
          <Contact />
        </main>
        <Footer />
        <CartSheet />

        {/*
          Netlify Forms: order notification form.
          On Netlify, submissions appear in the dashboard (Forms → orders) and
          can trigger email notifications. The cart drawer posts order details
          here via fetch after a successful checkout. Hidden on the page itself.
        */}
        <form name="orders" data-netlify="true" netlify-honeypot="bot-field" hidden>
          <input type="hidden" name="form-name" value="orders" />
          <input name="orderNo" />
          <input name="customerName" />
          <input name="phone" />
          <input name="email" />
          <input name="method" />
          <input name="address" />
          <input name="city" />
          <input name="postalCode" />
          <input name="notes" />
          <textarea name="items" />
          <input name="subtotal" />
          <input name="deliveryFee" />
          <input name="total" />
        </form>
      </div>
    </LanguageProvider>
  );
}
