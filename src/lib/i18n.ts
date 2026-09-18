export type Locale = "en" | "fi";

export const translations = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      products: "Products",
      gallery: "Gallery",
      visit: "Visit Us",
      contact: "Contact",
    },
    hero: {
      badge: "New international grocery store in Kouvola",
      title: "Taste the World,",
      titleHighlight: "Right Here in Kouvola",
      subtitle:
        "Baraka Kauppa brings you authentic Asian, Chinese, Thai, Arabic and African groceries — plus a full range of certified halal foods — all under one roof.",
      ctaPrimary: "Explore Our Products",
      ctaSecondary: "Visit the Store",
      stats: [
        { value: "6+", label: "Cuisine Regions" },
        { value: "1000+", label: "Products in Store" },
        { value: "7", label: "Days a Week" },
        { value: "100%", label: "Halal Selection" },
      ],
    },
    features: {
      halal: {
        title: "Certified Halal",
        description: "A dedicated halal meat and grocery selection you can trust.",
      },
      world: {
        title: "World Cuisines",
        description: "Ingredients from Asia, the Middle East, Africa and beyond.",
      },
      fresh: {
        title: "Fresh Daily",
        description: "Fresh produce, herbs and quality goods restocked regularly.",
      },
      local: {
        title: "Local & Friendly",
        description: "A neighbourhood shop proudly serving the Kouvola community.",
      },
    },
    about: {
      label: "About Us",
      title: "A Store Built on Blessing",
      paragraphs: [
        "\"Baraka\" means blessing — and that is exactly what we aim to share. Opened in 2026, Baraka Kauppa is a family-run international mini market in Kouvola, founded to bring the flavours of the world to our community.",
        "Our shelves are stocked with carefully sourced groceries from South Asia, East and Southeast Asia, the Middle East and Africa. From fragrant basmati rice and hand-picked spices to halal meats, fresh produce and pantry staples, we bring the ingredients that make home cooking authentic.",
        "We believe a lively city needs diverse local services. By shopping with us, you support a local entrepreneur — and you always get a warm welcome, in English, Finnish, Arabic or Somali.",
      ],
      quote:
        "\"If we want a lively city centre and diverse services in Kouvola, we need to use them. Support local entrepreneurs.\"",
      quoteSource: "— A message from our community, September 2026",
      facts: [
        { label: "Business ID", value: "3639588-4" },
        { label: "Founded", value: "2026" },
        { label: "Location", value: "Kouvola, Finland" },
        { label: "Company", value: "Baraka Kauppa Oy" },
      ],
    },
    categories: {
      label: "Our Selection",
      title: "Groceries from Around the World",
      subtitle:
        "Six cuisine regions, hundreds of authentic ingredients — sourced with care and priced fairly.",
      items: [
        {
          title: "Asian Pantry",
          description:
            "Jasmine and basmati rice, noodles, soy and fish sauces, coconut milk, curry pastes and snacks from across Asia.",
        },
        {
          title: "Chinese Kitchen",
          description:
            "Wonton and dumpling wrappers, dried mushrooms, oyster sauce, five-spice, teas and everything for authentic Chinese cooking.",
        },
        {
          title: "Thai Essentials",
          description:
            "Red, green and yellow curry pastes, lemongrass, fish sauce, rice paper, Thai basil and fresh chillies.",
        },
        {
          title: "Arabic & Middle East",
          description:
            "Premium dates, olive oil, tahini, za'atar, pita bread, bulgur, chickpeas, rose water and halal sweets.",
        },
        {
          title: "African Flavours",
          description:
            "Plantains, cassava and maize flour, yams, millet, groundnuts and ingredients for Somali and West African dishes.",
        },
        {
          title: "Halal Meat",
          description:
            "Fresh certified halal chicken, beef and lamb — handled with care and respect for tradition.",
        },
      ],
    },
    gallery: {
      label: "Inside Baraka",
      title: "Take a Look Around",
      subtitle:
        "Colourful spices, fresh produce and shelves full of world flavours — drop by and see for yourself.",
      captions: [
        "A world of spices",
        "Fresh produce weekly",
        "Shelves stocked with favourites",
      ],
    },
    visit: {
      label: "Visit Us",
      title: "Find Us in Kouvola",
      subtitle:
        "We are open every day of the week. Stop by for your weekly groceries or just to say hello — we would love to meet you.",
      addressTitle: "Address",
      address: "Mertakuja 4 A 3",
      city: "45160 Kouvola, Finland",
      hoursTitle: "Opening Hours",
      hours: [
        { day: "Monday – Friday", time: "10:00 – 22:00" },
        { day: "Saturday", time: "10:00 – 22:00" },
        { day: "Sunday", time: "12:00 – 18:00" },
      ],
      hoursNote: "Hours may vary on public holidays.",
      mapButton: "Open in Google Maps",
      fbButton: "Follow us on Facebook",
      fbDescription:
        "Fresh arrivals, offers and news are posted first on our Facebook page.",
      directions: "Get Directions",
    },
    contact: {
      label: "Get in Touch",
      title: "Questions or Special Requests?",
      subtitle:
        "Looking for a specific product from home? Send us a message or visit the store — if we do not have it on the shelf, we will do our best to order it for you.",
      facebook: "Message us on Facebook",
      emailLabel: "Email",
      phoneLabel: "Phone",
      storeLabel: "In Store",
      storeText: "Visit us during opening hours — our team speaks English, Finnish, Arabic and Somali.",
    },
    footer: {
      tagline: "Your international & halal grocery store in Kouvola.",
      quickLinks: "Quick Links",
      contactTitle: "Contact",
      rights: "All rights reserved.",
      madeIn: "Kouvola, Finland",
    },
    langName: "Suomi",
    langSwitchLabel: "Switch to Finnish",
  },
  fi: {
    nav: {
      home: "Etusivu",
      about: "Tietoja",
      products: "Valikoima",
      gallery: "Galleria",
      visit: "Sijainti",
      contact: "Yhteystiedot",
    },
    hero: {
      badge: "Uusi kansainvälinen ruokakauppa Kouvolassa",
      title: "Maailman maut,",
      titleHighlight: "täällä Kouvolassa",
      subtitle:
        "Baraka Kauppa tuo sinulle aitoja aasialaisia, kiinalaisia, thaimaalaisia, arabialaisia ja afrikkalaisia elintarvikkeita — sekä laajan valikoiman sertifioitua halal-ruokaa — kaikki saman katon alla.",
      ctaPrimary: "Tutustu valikoimaan",
      ctaSecondary: "Vieraile kaupassa",
      stats: [
        { value: "6+", label: "Ruokakulttuuria" },
        { value: "1000+", label: "Tuotetta kaupassa" },
        { value: "7", label: "Päivää viikossa" },
        { value: "100%", label: "Halal-valikoima" },
      ],
    },
    features: {
      halal: {
        title: "Sertifioitu halal",
        description: "Luotettava ja laadukas halal-liha ja elintarvikkeet.",
      },
      world: {
        title: "Maailman keittiöt",
        description: "Ainekset Aasiasta, Lähi-idästä, Afrikasta ja muualta.",
      },
      fresh: {
        title: "Tuoretta joka päivä",
        description: "Tuoreet vihannekset, yrtit ja laadukkaat tuotteet säännöllisesti.",
      },
      local: {
        title: "Paikallinen & ystävällinen",
        description: "Naapurikauppa, joka palvelee ylpeänä Kouvolan yhteisöä.",
      },
    },
    about: {
      label: "Tietoja meistä",
      title: "Siunaukseen perustuva kauppa",
      paragraphs: [
        "\"Baraka\" tarkoittaa siunausta — ja juuri sitä haluamme jakaa. Vuonna 2026 avattu Baraka Kauppa on Kouvolassa toimiva perheyritys, jonka tehtävä on tuoda maailman maut yhteisöllemme.",
        "Hyllyillemme on koottu huolella valittuja elintarvikkeita Etelä-Aasiasta, Itä- ja Kaakkois-Aasiasta, Lähi-idästä ja Afrikasta. Tuoksuva basmatiriisi, itse valitsemamme mausteet, halal-lihat, tuoreet vihannekset ja peruselintarvikkeet — kaikki ainekset autenttiseen kotiruokaan.",
        "Uskomme, että elävä kaupunki tarvitsee monipuolisia paikallisia palveluita. Ostamalla meiltä tuet paikallista yrittäjää — ja saat aina lämpimän vastaanoton, olipa kielesi suomi, englanti, arabia tai somali.",
      ],
      quote:
        "\"Jos haluamme Kouvolaan elävää keskustaa ja monipuolisia palveluita, meidän pitää myös käyttää niitä. Tue paikallisia yrittäjiä.\"",
      quoteSource: "— Viesti yhteisöltämme, syyskuu 2026",
      facts: [
        { label: "Y-tunnus", value: "3639588-4" },
        { label: "Perustettu", value: "2026" },
        { label: "Sijainti", value: "Kouvola, Suomi" },
        { label: "Yritys", value: "Baraka Kauppa Oy" },
      ],
    },
    categories: {
      label: "Valikoimamme",
      title: "Ruokaa ympäri maailman",
      subtitle:
        "Kuusi ruokakulttuuria, satoja aitoja aineksia — huolella valittuna ja kohtuuhintaan.",
      items: [
        {
          title: "Aasialainen hylly",
          description:
            "Jasmiini- ja basmatiriisi, nuudelit, soija- ja kalakastikkeet, kookosmaito, currytahnat ja napostelut ympäri Aasiaa.",
        },
        {
          title: "Kiinalainen keittiö",
          description:
            "Wonton- ja dumplingtaikinat, kuivatut sienet, ostereikastike, viiden mausteen sekoitus, teet ja kaikki aitoon kiinalaiseen ruoanlaittoon.",
        },
        {
          title: "Thaimaalaiset perusteet",
          description:
            "Punaiset, vihreät ja keltaiset currytahnat, sitrusgrattiisi, kalakastike, riisipaperi, thainkorianteri ja tuoreet chilit.",
        },
        {
          title: "Arabia & Lähi-itä",
          description:
            "Laadukkaat taatelit, oliiviöljy, tahini, za'atar, pitaleipä, bulguri, kikherneet, ruusuvesi ja halal-makeiset.",
        },
        {
          title: "Afrikkalaiset maut",
          description:
            "Banaanityypit, manioka- ja maissijauho, jamssit, hirssi, maapähkinät ja ainekset somalilaisiin ja länsiafrikkalaisiin ruokiin.",
        },
        {
          title: "Halal-liha",
          description:
            "Tuore sertifioitu halal-kana, naudanliha ja lampaanliha — hoidettuna huolella ja perinteitä kunnioittaen.",
        },
      ],
    },
    gallery: {
      label: "Barakassa",
      title: "Kurkka sisään",
      subtitle:
        "Värikkäät mausteet, tuoreet vihannekset ja hyllyt täynnä maailman makuja — tule katsomaan itse.",
      captions: [
        "Maailma täynnä mausteita",
        "Tuoreita vihanneksia viikoittain",
        "Hyllyt täynnä suosikkeja",
      ],
    },
    visit: {
      label: "Tule käymään",
      title: "Löydät meidät Kouvolasta",
      subtitle:
        "Olemme avoinna joka päivä viikossa. Vieraile luonamme viikoittaisissa ostoksissa tai vain moikkaamassa — olisi hieno tavata sinut.",
      addressTitle: "Osoite",
      address: "Mertakuja 4 A 3",
      city: "45160 Kouvola, Suomi",
      hoursTitle: "Aukioloajat",
      hours: [
        { day: "Maanantai – perjantai", time: "10:00 – 22:00" },
        { day: "Lauantai", time: "10:00 – 22:00" },
        { day: "Sunnuntai", time: "12:00 – 18:00" },
      ],
      hoursNote: "Aukioloajat voivat vaihdella juhlapäivinä.",
      mapButton: "Avaa Google Mapsissa",
      fbButton: "Seuraa meitä Facebookissa",
      fbDescription:
        "Uudet tuotteet, tarjoukset ja uutiset julkaistaan ensin Facebook-sivullamme.",
      directions: "Hae reitti",
    },
    contact: {
      label: "Ota yhteyttä",
      title: "Kysymyksiä tai erityistoiveita?",
      subtitle:
        "Etsitkö tiettyä tuotetta kotimaastasi? Lähetä meille viesti tai vieraile kaupassa — jos emme sitä hyllystä löydä, tilaamme sen mielellämme puolestasi.",
      facebook: "Viesti meille Facebookissa",
      emailLabel: "Sähköposti",
      phoneLabel: "Puhelin",
      storeLabel: "Kaupassa",
      storeText: "Vieraile luonamme aukioloaikoina — henkilökuntamme puhuu suomea, englantia, arabiaa ja somalia.",
    },
    footer: {
      tagline: "Kansainvälinen ja halal-ruokakauppasi Kouvolassa.",
      quickLinks: "Pikalinkit",
      contactTitle: "Yhteystiedot",
      rights: "Kaikki oikeudet pidätetään.",
      madeIn: "Kouvola, Suomi",
    },
    langName: "English",
    langSwitchLabel: "Switch to English",
  },
} as const;

export type Translations = (typeof translations)["en"];
