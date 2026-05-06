#!/bin/bash
# Run this from your REGULAR terminal (Terminal.app / iTerm), not from the IDE sandbox.
# It copies the AI-generated room images into the project assets folder.

BRAIN="$HOME/.gemini/antigravity/brain/a9c35cac-573d-4407-92e1-7e7acacd6f94"
DEST="$(cd "$(dirname "$0")" && pwd)"

echo "Source: $BRAIN"
echo "Dest:   $DEST"
echo ""

cp "$BRAIN/living_room_1778002468328.png"   "$DEST/living.png"   && echo "✓ living.png"
cp "$BRAIN/bedroom_room_1778002482499.png"  "$DEST/bedroom.png"  && echo "✓ bedroom.png"
cp "$BRAIN/kitchen_room_1778002495510.png"  "$DEST/kitchen.png"  && echo "✓ kitchen.png"
cp "$BRAIN/bathroom_room_1778002509207.png" "$DEST/bathroom.png" && echo "✓ bathroom.png"
cp "$BRAIN/walls_floors_1778002526164.png"  "$DEST/walls.png"    && echo "✓ walls.png"
cp "$BRAIN/ac_utility_1778002542096.png"    "$DEST/ac.png"       && echo "✓ ac.png"
cp "$BRAIN/outdoor_space_1778002555055.png" "$DEST/outdoor.png"  && echo "✓ outdoor.png"

echo ""
echo "File sizes (should be 200KB+ each):"
ls -lhS "$DEST"/*.png | grep -v '_'
echo ""
echo "Done. Refresh the browser to see the images."
