#!/bin/bash
# Generate remaining gallery images
set -e
IMG_DIR="/home/z/my-project/public/images"
mkdir -p "$IMG_DIR"

echo "=== gallery-spices ==="
z-ai image -p "Colorful spice market display, mounds of turmeric, cumin, coriander, cardamom, cinnamon sticks, paprika, curry powder in wooden bowls, rich vibrant colors, dramatic side lighting, professional food photography, high quality, detailed" -o "$IMG_DIR/gallery-spices.png" -s 1344x768

echo "=== gallery-produce ==="
z-ai image -p "Fresh exotic fruits and vegetables in grocery store: mangoes, plantains, okra, bitter melon, taro root, fresh herbs, colorful display crates, bright clean grocery store lighting, professional photography, high quality" -o "$IMG_DIR/gallery-produce.png" -s 1344x768

echo "=== gallery-shelves ==="
z-ai image -p "Well stocked international grocery store shelves with diverse packaged world foods, colorful labels from Asia Middle East Africa, clean modern store aisle, bright inviting lighting, professional retail photography, high quality, photorealistic" -o "$IMG_DIR/gallery-shelves.png" -s 1344x768

echo "ALL DONE"
ls -la "$IMG_DIR"
