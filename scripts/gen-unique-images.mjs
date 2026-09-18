import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

const STYLE =
  "professional product photography, warm natural lighting, rustic wooden table background, grocery store product photo, appetizing, high quality, detailed";

const IMAGES = [
  {
    file: "public/images/prod-green-curry.png",
    prompt:
      "A small tub of Thai green curry paste, vibrant green paste visible, fresh green chilies, lemongrass stalks and kaffir lime leaves beside it, " + STYLE,
  },
  {
    file: "public/images/prod-cassava.png",
    prompt:
      "A paper bag of cassava flour with fresh cassava roots (yuca) next to it, one root cut open showing white flesh, " + STYLE,
  },
  {
    file: "public/images/prod-wings.png",
    prompt:
      "Fresh raw chicken wings on a black tray with parchment paper, sprinkled with herbs, butcher shop display style, " + STYLE,
  },
  {
    file: "public/images/prod-turmeric.png",
    prompt:
      "Ground turmeric powder in a small bowl, golden yellow vibrant powder with a small pile, fresh turmeric root beside it, " + STYLE,
  },
  {
    file: "public/images/prod-cumin.png",
    prompt:
      "Whole cumin seeds in a small wooden bowl and scattered on a spoon, brown oval seeds, warm tones, " + STYLE,
  },
  {
    file: "public/images/prod-coriander.png",
    prompt:
      "Ground coriander powder in a small ceramic bowl, light beige powder, fresh coriander leaves and dried coriander seeds beside it, " + STYLE,
  },
  {
    file: "public/images/prod-bariis.png",
    prompt:
      "Somali spiced rice mix (bariis), a bowl of fragrant seasoned basmati rice with visible whole spices — cardamom pods, cinnamon sticks, cumin seeds, star anise, " + STYLE,
  },
];

async function main() {
  const zai = await ZAI.create();
  let ok = 0;
  for (const { file, prompt } of IMAGES) {
    let done = false;
    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      try {
        const res = await zai.images.generations.create({
          prompt,
          size: "1024x1024",
        });
        const b64 = res?.data?.[0]?.base64;
        if (!b64) throw new Error("empty base64");
        fs.writeFileSync(file, Buffer.from(b64, "base64"));
        console.log(`OK  ${file}`);
        ok++;
        done = true;
      } catch (e) {
        console.error(`ERR ${file} (attempt ${attempt}): ${e.message}`);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }
  console.log(`\nDone: ${ok}/${IMAGES.length} images generated`);
  if (ok < IMAGES.length) process.exit(1);
}

main();
