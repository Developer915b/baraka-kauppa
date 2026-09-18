import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = {
  slug: string;
  nameEn: string;
  nameFi: string;
  descEn: string;
  descFi: string;
  price: number;
  oldPrice?: number;
  unit: string;
  category: string;
  image: string;
  badge?: string;
  bestSeller?: boolean;
};

const PRODUCTS: SeedProduct[] = [
  // Asian Pantry
  {
    slug: "basmati-rice-5kg",
    nameEn: "Premium Basmati Rice 5 kg",
    nameFi: "Premium basmatiriisi 5 kg",
    descEn:
      "Long-grain aged basmati with a rich aroma — perfect for biryani, pilaf and everyday rice dishes.",
    descFi:
      "Pitkäjyväinen, tuoksuva basmatiriisi — täydellinen biryaniin, pilaffiin ja jokapäiväisiin riisiruokiin.",
    price: 6.9,
    unit: "5 kg bag",
    category: "asian",
    image: "/images/prod-rice.png",
    badge: "popular",
    bestSeller: true,
  },
  {
    slug: "instant-ramen-5pack",
    nameEn: "Instant Ramen Noodles (5-pack)",
    nameFi: "Pikaruokanuudelit (5 kpl)",
    descEn:
      "Classic Asian instant noodles — quick lunch ready in 3 minutes. Several flavours available in store.",
    descFi:
      "Klassiset aasialaiset pikanuudelit — valmis lounas 3 minuutissa. Kaupassa useita makuja.",
    price: 2.5,
    unit: "5 × 85 g",
    category: "asian",
    image: "/images/prod-ramen.png",
    bestSeller: true,
  },
  {
    slug: "coconut-milk-400ml",
    nameEn: "Coconut Milk 400 ml",
    nameFi: "Kookosmaito 400 ml",
    descEn:
      "Rich, creamy coconut milk for curries, soups and desserts. No preservatives.",
    descFi:
      "Vahva ja kermainen kookosmaito curryihin, keittoihin ja jälkiruokiin. Ilman lisäaineita.",
    price: 1.8,
    unit: "400 ml can",
    category: "asian",
    image: "/images/prod-coconut.png",
    bestSeller: true,
  },
  {
    slug: "jasmine-green-tea-100g",
    nameEn: "Jasmine Green Tea 100 g",
    nameFi: "Jasmiinivihreä tee 100 g",
    descEn:
      "Fragrant green tea scented with fresh jasmine blossoms — a calming classic.",
    descFi:
      "Tuoksuva vihreä tee, maustettu tuoreilla jasmiinikukilla — rauhoittava klassikko.",
    price: 3.9,
    oldPrice: 4.9,
    unit: "100 g box",
    category: "asian",
    image: "/images/prod-tea.png",
  },
  // Thai
  {
    slug: "red-curry-paste-400g",
    nameEn: "Thai Red Curry Paste 400 g",
    nameFi: "Thaimaalainen punainen currytahna 400 g",
    descEn:
      "Authentically spicy red curry paste with lemongrass and galangal. Makes 4–5 hearty portions.",
    descFi:
      "Aito tulinen punainen currytahna sitrusgrattiisilla ja galangalilla. Riittää 4–5 annokseen.",
    price: 2.9,
    unit: "400 g tub",
    category: "thai",
    image: "/images/prod-curry.png",
    badge: "popular",
    bestSeller: true,
  },
  {
    slug: "green-curry-paste-400g",
    nameEn: "Thai Green Curry Paste 400 g",
    nameFi: "Thaimaalainen vihreä currytahna 400 g",
    descEn:
      "Fresh and fiery green curry paste — the heart of Thailand's most loved curry.",
    descFi:
      "Tuore ja tulinen vihreä currytahna — Thaimaan rakastetuimman curryn sydän.",
    price: 2.9,
    unit: "400 g tub",
    category: "thai",
    image: "/images/prod-green-curry.png",
  },
  // Arabic & Middle East
  {
    slug: "medjool-dates-500g",
    nameEn: "Premium Medjool Dates 500 g",
    nameFi: "Premium medjool-taatelit 500 g",
    descEn:
      "Large, soft and caramel-sweet Medjool dates — ideal for guests, Ramadan and healthy snacking.",
    descFi:
      "Suuret, pehmeät ja karamellimakeat medjool-taatelit — ihanteelliset vieraille, ramadaaniin ja välipalaksi.",
    price: 7.5,
    unit: "500 g box",
    category: "arabic",
    image: "/images/prod-dates.png",
    badge: "popular",
    bestSeller: true,
  },
  {
    slug: "olive-oil-1l",
    nameEn: "Extra Virgin Olive Oil 1 L",
    nameFi: "Neitsytoliiviöljy 1 l",
    descEn:
      "Cold-pressed extra virgin olive oil with a fruity aroma — for cooking, dipping and dressing.",
    descFi:
      "Kylmäpuristettu neitsytoliiviöljy, jonka tuoksu on hedelmäinen — ruoanlaittoon, dipattavaksi ja kastikkeisiin.",
    price: 9.9,
    oldPrice: 12.9,
    unit: "1 L bottle",
    category: "arabic",
    image: "/images/prod-oliveoil.png",
  },
  {
    slug: "tahini-400g",
    nameEn: "Tahini Sesame Paste 400 g",
    nameFi: "Tahini-sesamitahna 400 g",
    descEn:
      "Stone-ground sesame paste for hummus, baba ganoush and halva. 100% sesame, nothing else.",
    descFi:
      "Kivijauhettu sesamitahna hummukseen, baba ganoushiin ja halvaan. 100 % sesamia, ei muuta.",
    price: 3.5,
    unit: "400 g jar",
    category: "arabic",
    image: "/images/prod-tahini.png",
  },
  // African
  {
    slug: "fresh-plantains-1kg",
    nameEn: "Fresh Plantains 1 kg",
    nameFi: "Tuoreet keittobanaanit 1 kg",
    descEn:
      "Starchy cooking bananas for kelewele, mofongo, matoke and West African stews.",
    descFi:
      "Tärkkelyspitoiset keittobanaanit keleweleen, mofongoon, matokeen ja länsiafrikkalaisiin pataruokiin.",
    price: 2.9,
    oldPrice: 3.5,
    unit: "per kg",
    category: "african",
    image: "/images/prod-plantain.png",
    badge: "fresh",
  },
  {
    slug: "maize-flour-2kg",
    nameEn: "White Maize Flour 2 kg",
    nameFi: "Valkoinen maissijauho 2 kg",
    descEn:
      "Finely milled maize flour for ugali, nsima, sadza and porridge.",
    descFi:
      "Hienoksi jauhettu maissijauho ugaliin, nsimaan, sadzaan ja puuroon.",
    price: 3.2,
    unit: "2 kg bag",
    category: "african",
    image: "/images/prod-flour.png",
  },
  {
    slug: "cassava-flour-2kg",
    nameEn: "Cassava Flour 2 kg",
    nameFi: "Maniokkijauho 2 kg",
    descEn:
      "Gluten-free cassava flour — a staple for fufu, flatbreads and thickening stews.",
    descFi:
      "Gluteeniton maniokkijauho — perusraaka-aine fufuun, ohukaisiin ja pataruokien suurustamiseen.",
    price: 3.6,
    oldPrice: 4.2,
    unit: "2 kg bag",
    category: "african",
    image: "/images/prod-cassava.png",
  },
  // Halal meat
  {
    slug: "halal-whole-chicken",
    nameEn: "Whole Halal Chicken (~1.4 kg)",
    nameFi: "Kokonainen halal-kana (~1,4 kg)",
    descEn:
      "Fresh certified halal whole chicken, cleaned and ready to cook. Handled with care and respect.",
    descFi:
      "Tuore sertifioitu kokonainen halal-kana, puhdistettu ja valmis keitettäväksi. Hoidettu huolella.",
    price: 8.5,
    unit: "≈1.4 kg",
    category: "halal",
    image: "/images/prod-chicken.png",
    badge: "popular",
    bestSeller: true,
  },
  {
    slug: "halal-chicken-wings-1kg",
    nameEn: "Halal Chicken Wings 1 kg",
    nameFi: "Halal-kanansiivet 1 kg",
    descEn:
      "Fresh halal chicken wings — perfect for grilling, frying and marinades.",
    descFi:
      "Tuoreet halal-kanansiivet — täydelliset grillaamiseen, paistamiseen ja marinointiin.",
    price: 6.9,
    oldPrice: 7.9,
    unit: "per kg",
    category: "halal",
    image: "/images/prod-wings.png",
  },
  // Spices & pantry
  {
    slug: "ground-turmeric-200g",
    nameEn: "Ground Turmeric 200 g",
    nameFi: "Jauhettu kurkuma 200 g",
    descEn:
      "Vibrant golden turmeric powder — earthy warmth for curries, rice and golden milk.",
    descFi:
      "Kirkkaan kultainen kurkumajauhe — maanläheistä lämpöä curryihin, riisiin ja kultamaitoon.",
    price: 1.9,
    unit: "200 g",
    category: "spices",
    image: "/images/prod-turmeric.png",
  },
  {
    slug: "cumin-seeds-200g",
    nameEn: "Cumin Seeds 200 g",
    nameFi: "Kuminsiemenet 200 g",
    descEn:
      "Whole cumin seeds, toasted to release their nutty depth — essential in South Asian and Middle Eastern kitchens.",
    descFi:
      "Kokonaiset kuminsiemenet, paahdettuna pähkinäisen makuisia — välttämättömät Etelä-Aasian ja Lähi-idän keittiöissä.",
    price: 2.2,
    unit: "200 g",
    category: "spices",
    image: "/images/prod-cumin.png",
  },
  {
    slug: "ground-coriander-200g",
    nameEn: "Ground Coriander 200 g",
    nameFi: "Jauhettu korianteri 200 g",
    descEn:
      "Citrus-sweet ground coriander — the backbone of countless spice blends.",
    descFi:
      "Sitruksisen makea jauhettu korianteri — lukemattomien mausteseosten selkäranka.",
    price: 2.0,
    unit: "200 g",
    category: "spices",
    image: "/images/prod-coriander.png",
  },
  {
    slug: "somali-bariis-mix-500g",
    nameEn: "Somali Spiced Rice Mix (Bariis) 500 g",
    nameFi: "Somalialainen maustariisisekoitus (Bariis) 500 g",
    descEn:
      "Fragrant rice and spice blend for authentic Somali bariis iskukaris — just add meat or vegetables.",
    descFi:
      "Tuoksuva riisi- ja mausteseos aitoon somalialaiseen bariis iskukariin — lisää vain liha tai kasvikset.",
    price: 3.4,
    oldPrice: 3.9,
    unit: "500 g",
    category: "spices",
    image: "/images/prod-bariis.png",
    badge: "new",
  },
];

async function main() {
  console.log("Seeding products...");
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        nameEn: p.nameEn,
        nameFi: p.nameFi,
        descEn: p.descEn,
        descFi: p.descFi,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        unit: p.unit,
        category: p.category,
        image: p.image,
        badge: p.badge ?? null,
        bestSeller: p.bestSeller ?? false,
      },
      create: {
        ...p,
        oldPrice: p.oldPrice ?? null,
        badge: p.badge ?? null,
        bestSeller: p.bestSeller ?? false,
      },
    });
  }
  const count = await prisma.product.count();
  console.log(`Done. ${count} products in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
