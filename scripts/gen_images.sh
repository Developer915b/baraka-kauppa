#!/bin/bash
# Generate high-quality images for Baraka Kauppa website
set -e
IMG_DIR="/home/z/my-project/public/images"
mkdir -p "$IMG_DIR"

echo "=== 1/9 Hero image ==="
z-ai image -p "Modern international grocery store interior, warm inviting atmosphere, shelves stocked with colorful Asian, Middle Eastern and African food products, fresh produce section, soft warm lighting, wide angle view, professional retail photography, photorealistic, high quality, detailed" -o "$IMG_DIR/hero.png" -s 1344x768

echo "=== 2/9 Store interior (about) ==="
z-ai image -p "Cozy small grocery shop aisle with international food products, halal certification signs, diverse world foods on wooden shelves, spice jars, sauces, warm golden light, professional interior photography, photorealistic, high quality" -o "$IMG_DIR/about-store.png" -s 1152x864

echo "=== 3/9 Asian products ==="
z-ai image -p "Asian food products arrangement: jasmine rice bags, soy sauce bottles, ramen noodles packs, rice paper, coconut milk cans, spring roll wrappers on rustic wooden table, top view flat lay, professional food photography, high quality, detailed" -o "$IMG_DIR/cat-asian.png" -s 1024x1024

echo "=== 4/9 Arabic & Middle Eastern ==="
z-ai image -p "Middle Eastern and Arabic food products: premium dates, olive oil bottles, tahini jars, pita bread, zaatar spices, bulgur, chickpeas, rose water, arranged on dark wooden surface, moody warm lighting, professional food photography, high quality" -o "$IMG_DIR/cat-arabic.png" -s 1024x1024

echo "=== 5/9 African products ==="
z-ai image -p "African food market products: plantains, cassava flour, yams, millet, groundnuts, palm oil, jollof rice ingredients, colorful fabric backdrop, vibrant warm colors, professional food photography, high quality, detailed" -o "$IMG_DIR/cat-african.png" -s 1024x1024

echo "=== 6/9 Thai products ==="
z-ai image -p "Thai cooking ingredients: curry pastes red green yellow, fish sauce bottles, lemongrass stalks, coconut milk cans, jasmine rice, Thai basil, lime, chili peppers, bamboo mat, vibrant fresh colors, professional food photography, high quality" -o "$IMG_DIR/cat-thai.png" -s 1024x1024

echo "=== 7/9 Chinese products ==="
z-ai image -p "Chinese grocery products: dried mushrooms, oyster sauce, noodles, dumplings wrappers, soy sauces, five spice powder, jasmine tea, wonton skins, red lantern decoration, professional food photography, warm lighting, high quality" -o "$IMG_DIR/cat-chinese.png" -s 1024x1024

echo "=== 8/9 Halal meat ==="
z-ai image -p "Fresh halal butcher counter display, premium cuts of meat and chicken on ice, clean modern grocery store, stainless steel display, professional butcher shop photography, bright clean lighting, high quality, photorealistic" -o "$IMG_DIR/cat-halal.png" -s 1024x1024

echo "=== 9/9 Fresh spices ==="
z-ai image -p "Colorful spice market display, mounds of turmeric, cumin, coriander, cardamom, cinnamon sticks, paprika, curry powder in wooden bowls, rich vibrant colors, dramatic side lighting, professional food photography, high quality, detailed" -o "$IMG_DIR/gallery-spices.png" -s 1344x768

echo "ALL IMAGES GENERATED"
ls -la "$IMG_DIR"
