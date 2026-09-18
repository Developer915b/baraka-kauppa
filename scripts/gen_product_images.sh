#!/bin/bash
# Generate 12 product images for the online store
set -e
IMG_DIR="/home/z/my-project/public/images"
mkdir -p "$IMG_DIR"

gen() {
  local name="$1"; local prompt="$2"; local size="${3:-1024x1024}"
  if [ -f "$IMG_DIR/$name.png" ]; then echo "skip $name"; return 0; fi
  echo "--- generating $name"
  z-ai image -p "$prompt" -o "$IMG_DIR/$name.png" -s "$size" && echo "OK $name" || echo "FAIL $name"
}

gen prod-rice "Premium basmati rice in open burlap sack with wooden scoop, grains spilling out, warm kitchen backdrop, professional product photography, high quality, detailed"
gen prod-ramen "Instant ramen noodle packages stacked, colorful packaging, chopsticks beside, clean white studio background, professional product photography, high quality"
gen prod-coconut "Cans of coconut milk with fresh coconut half, tropical leaves accent, bright studio lighting, professional product photography, high quality"
gen prod-tea "Jasmine green tea in elegant box with loose dried tea leaves and jasmine flowers scattered, wooden table, professional product photography, high quality"
gen prod-curry "Thai red and green curry paste tubs with fresh red chilies, lemongrass and lime leaves, dark slate background, professional product photography, high quality"
gen prod-dates "Premium medjool dates in luxury gift box, glossy plump dates, gold accents, dark elegant background, professional product photography, high quality"
gen prod-oliveoil "Extra virgin olive oil glass bottle with olive branch and small bowl of olives, Mediterranean style, warm light, professional product photography, high quality"
gen prod-tahini "Glass jar of creamy tahini sesame paste with sesame seeds scattered and drizzled tahini, rustic wooden board, professional product photography, high quality"
gen prod-plantain "Fresh green plantains bunch in market crate with one sliced piece, tropical market feel, bright natural light, professional food photography, high quality"
gen prod-flour "White maize flour paper bag with corn cobs and wooden scoop of flour, rustic kitchen setting, professional product photography, high quality"
gen prod-chicken "Fresh whole raw chicken in vacuum sealed tray with halal certification label, clean white butcher display, bright hygienic lighting, professional product photography, high quality"
gen prod-spices "Set of glass spice jars with turmeric cumin and coriander powder in small bowls, warm spices scattered, dark moody background, professional product photography, high quality"

echo "ALL PRODUCTS IMAGES DONE"
