#!/usr/bin/env python3
"""Build the hi-res East-Asia crop of NASA Blue Marble (public domain) used by src/xkga/SatMap.tsx.

Inputs: the two 21600x21600 tiles D1 (lon 90..180, lat 90..0) and D2 (lon 90..180, lat 0..-90) from
https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73751/world.topo.bathy.200407.3x21600x21600.D1.jpg (July 2004, little snow; world image: same record, 3x5400x2700 -> public/xkga/bluemarble.jpg) (and .D2.jpg)
Usage: python3 scripts/make_bluemarble_crop.py D1.jpg D2.jpg public/xkga/bluemarble-asia.jpg
Crop window and output scale must match DETAIL in src/xkga/SatMap.tsx.
"""
import sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
LON0, LON1, LAT0, LAT1 = 95.0, 140.0, 45.0, -15.0  # west, east, north, south
PPD_IN, PPD_OUT = 240, 100


def main(d1, d2, out):
    a = Image.open(d1)
    b = Image.open(d2)
    x0 = int((LON0 - 90) * PPD_IN)
    x1 = int((LON1 - 90) * PPD_IN)
    top = a.crop((x0, int((90 - LAT0) * PPD_IN), x1, 21600))
    bot = b.crop((x0, 0, x1, int(-LAT1 * PPD_IN)))
    full = Image.new("RGB", (x1 - x0, top.height + bot.height))
    full.paste(top, (0, 0))
    full.paste(bot, (0, top.height))
    w = int((LON1 - LON0) * PPD_OUT)
    h = int((LAT0 - LAT1) * PPD_OUT)
    full.resize((w, h), Image.LANCZOS).save(out, quality=85)
    print("wrote", out, w, h)


if __name__ == "__main__":
    main(*sys.argv[1:4])
