#!/usr/bin/env python3
"""
Generate per-client photography via the Pollinations (Flux) text-to-image API
(no auth) and save to public/img/<slug>/. Prompts for the gallery are derived
from each site's real captions so the image matches the caption shown over it.

Run from the `site/` directory:  python scripts/gen_images.py
"""

import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

CLIENTS = [
    {"slug": "flamengo", "copy": "content/copy.json", "vertical": "restaurant"},
    {"slug": "a1-auto", "copy": "content/clients/a1-auto/copy.json", "vertical": "auto"},
    {"slug": "university-city-barbershop", "copy": "content/clients/university-city-barbershop/copy.json", "vertical": "barber"},
    {"slug": "dekalb-mechanical", "copy": "content/clients/dekalb-mechanical/copy.json", "vertical": "hvac"},
    {"slug": "china-house", "copy": "content/clients/china-house/copy.json", "vertical": "chinese"},
    {"slug": "genoa-animal-hospital", "copy": "content/clients/genoa-animal-hospital/copy.json", "vertical": "vet"},
    {"slug": "realize-athletics", "copy": "content/clients/realize-athletics/copy.json", "vertical": "fitness"},
    {"slug": "leza-nail-spa", "copy": "content/clients/leza-nail-spa/copy.json", "vertical": "nails"},
    {"slug": "friedrichs-eye", "copy": "content/clients/friedrichs-eye/copy.json", "vertical": "optometry"},
    {"slug": "woodys-orchard", "copy": "content/clients/woodys-orchard/copy.json", "vertical": "farm"},
    {"slug": "todd-curtis-orthodontist", "copy": "content/clients/todd-curtis-orthodontist/copy.json", "vertical": "orthodontics"},
    {"slug": "pizza-villa", "copy": "content/clients/pizza-villa/copy.json", "vertical": "pizza"},
    {"slug": "the-montcler", "copy": "content/clients/the-montcler/copy.json", "vertical": "italian"},
    {"slug": "dearborn-cafe", "copy": "content/clients/dearborn-cafe/copy.json", "vertical": "breakfast"},
    {"slug": "lord-stanleys", "copy": "content/clients/lord-stanleys/copy.json", "vertical": "pub"},
    {"slug": "mvps-sports-bar", "copy": "content/clients/mvps-sports-bar/copy.json", "vertical": "sportsbar"},
    {"slug": "lovells-tire", "copy": "content/clients/lovells-tire/copy.json", "vertical": "tire"},
    {"slug": "beas-wok", "copy": "content/clients/beas-wok/copy.json", "vertical": "vietnamese"},
    {"slug": "wired-nutrition", "copy": "content/clients/wired-nutrition/copy.json", "vertical": "nutrition"},
    {"slug": "bowlrrito", "copy": "content/clients/bowlrrito/copy.json", "vertical": "fastcasual"},
    {"slug": "my1-hair", "copy": "content/clients/my1-hair/copy.json", "vertical": "hairsalon"},
    {"slug": "tails-humane", "copy": "content/clients/tails-humane/copy.json", "vertical": "shelter"},
    {"slug": "johnny-ks", "copy": "content/clients/johnny-ks/copy.json", "vertical": "burger"},
    {"slug": "exquisite-skillet", "copy": "content/clients/exquisite-skillet/copy.json", "vertical": "pancakes"},
    {"slug": "chicago-beauty", "copy": "content/clients/chicago-beauty/copy.json", "vertical": "beautybar"},
    {"slug": "tastee-bite", "copy": "content/clients/tastee-bite/copy.json", "vertical": "custard"},
    {"slug": "fattys-pub", "copy": "content/clients/fattys-pub/copy.json", "vertical": "pubgrill"},
    {"slug": "cortland-vet", "copy": "content/clients/cortland-vet/copy.json", "vertical": "vet"},
    {"slug": "inbodens-meats", "copy": "content/clients/inbodens-meats/copy.json", "vertical": "butcher"},
    {"slug": "cast-iron-coffee", "copy": "content/clients/cast-iron-coffee/copy.json", "vertical": "coffeeshop"},
    {"slug": "paw-lickin-good", "copy": "content/clients/paw-lickin-good/copy.json", "vertical": "petboutique"},
    {"slug": "pilates-plus", "copy": "content/clients/pilates-plus/copy.json", "vertical": "pilates"},
    {"slug": "mccoy-chiropractic", "copy": "content/clients/mccoy-chiropractic/copy.json", "vertical": "chiro"},
    {"slug": "cronauer-law", "copy": "content/clients/cronauer-law/copy.json", "vertical": "law"},
    {"slug": "pardridge-insurance", "copy": "content/clients/pardridge-insurance/copy.json", "vertical": "insurance"},
    {"slug": "white-oak-tax", "copy": "content/clients/white-oak-tax/copy.json", "vertical": "accounting"},
    {"slug": "south-moon-bbq", "copy": "content/clients/south-moon-bbq/copy.json", "vertical": "bbq"},
    {"slug": "prairie-path-cycles", "copy": "content/clients/prairie-path-cycles/copy.json", "vertical": "bikeshop"},
    {"slug": "kiss-the-sky", "copy": "content/clients/kiss-the-sky/copy.json", "vertical": "recordstore"},
    {"slug": "yellow-bird-books", "copy": "content/clients/yellow-bird-books/copy.json", "vertical": "bookstore"},
    {"slug": "mad-batter-bakery", "copy": "content/clients/mad-batter-bakery/copy.json", "vertical": "bakery"},
    {"slug": "geneva-winery", "copy": "content/clients/geneva-winery/copy.json", "vertical": "winery"},
    {"slug": "celidan-florist", "copy": "content/clients/celidan-florist/copy.json", "vertical": "florist"},
    {"slug": "noon-whistle-brewing", "copy": "content/clients/noon-whistle-brewing/copy.json", "vertical": "brewery"},
    {"slug": "suburban-music", "copy": "content/clients/suburban-music/copy.json", "vertical": "musicstore"},
    {"slug": "pottery-bayou", "copy": "content/clients/pottery-bayou/copy.json", "vertical": "pottery"},
    {"slug": "flavor-spice", "copy": "content/clients/flavor-spice/copy.json", "vertical": "spiceshop"},
    {"slug": "beidelman-furniture", "copy": "content/clients/beidelman-furniture/copy.json", "vertical": "furniture"},
    {"slug": "kramer-photography", "copy": "content/clients/kramer-photography/copy.json", "vertical": "photographer"},
    {"slug": "victory-mma", "copy": "content/clients/victory-mma/copy.json", "vertical": "mma"},
    {"slug": "schmaltz-deli", "copy": "content/clients/schmaltz-deli/copy.json", "vertical": "deli"},
    {"slug": "sapphire-tattoo", "copy": "content/clients/sapphire-tattoo/copy.json", "vertical": "tattoo"},
    {"slug": "envision-dance", "copy": "content/clients/envision-dance/copy.json", "vertical": "dance"},
    {"slug": "costello-jewelry", "copy": "content/clients/costello-jewelry/copy.json", "vertical": "jeweler"},
    {"slug": "all-chocolate-kitchen", "copy": "content/clients/all-chocolate-kitchen/copy.json", "vertical": "chocolatier"},
    {"slug": "andersons-toyshop", "copy": "content/clients/andersons-toyshop/copy.json", "vertical": "toystore"},
    {"slug": "arcada-theater", "copy": "content/clients/arcada-theater/copy.json", "vertical": "theater"},
    {"slug": "elite-boba", "copy": "content/clients/elite-boba/copy.json", "vertical": "boba"},
    {"slug": "nona-jos", "copy": "content/clients/nona-jos/copy.json", "vertical": "giftshop"},
    {"slug": "growing-place", "copy": "content/clients/growing-place/copy.json", "vertical": "garden"},
    {"slug": "naperville-running", "copy": "content/clients/naperville-running/copy.json", "vertical": "running"},
    {"slug": "riddlebox-escape", "copy": "content/clients/riddlebox-escape/copy.json", "vertical": "escaperoom"},
    {"slug": "astro-fun-world", "copy": "content/clients/astro-fun-world/copy.json", "vertical": "funcenter"},
    {"slug": "lindsays-cobbler", "copy": "content/clients/lindsays-cobbler/copy.json", "vertical": "cobbler"},
    {"slug": "lisle-lanes", "copy": "content/clients/lisle-lanes/copy.json", "vertical": "bowling"},
    # ── Batch 13 ──
    {"slug": "pub-west", "copy": "content/clients/pub-west/copy.json", "vertical": "pubgrill"},
    {"slug": "the-flame", "copy": "content/clients/the-flame/copy.json", "vertical": "greek"},
    {"slug": "tapa-la-luna", "copy": "content/clients/tapa-la-luna/copy.json", "vertical": "tapas"},
    {"slug": "anderson-auto-body", "copy": "content/clients/anderson-auto-body/copy.json", "vertical": "autobody"},
    {"slug": "la-michoacana", "copy": "content/clients/la-michoacana/copy.json", "vertical": "paleteria"},
    # ── Batch 14 ──
    {"slug": "hinks-bar-and-grill", "copy": "content/clients/hinks-bar-and-grill/copy.json", "vertical": "pubgrill"},
    {"slug": "star-34-cafe", "copy": "content/clients/star-34-cafe/copy.json", "vertical": "breakfast"},
]

STYLE = {
    "restaurant": "professional food photography, warm moody restaurant lighting, shallow depth of field, appetizing, editorial, ultra detailed, 50mm",
    "auto": "professional automotive photography, clean modern auto repair shop, crisp dramatic lighting, ultra detailed, no text",
    "barber": "professional photography, modern upscale barbershop, warm cinematic lighting, ultra detailed, no text",
    "hvac": "professional photography, residential HVAC heating and cooling service, clean bright reassuring lighting, ultra detailed, no text",
    "chinese": "professional Chinese food photography, warm appetizing restaurant lighting, shallow depth of field, editorial, ultra detailed",
    "vet": "professional veterinary clinic photography, bright clean caring atmosphere, happy pets, ultra detailed, no text",
    "fitness": "professional fitness photography, modern gym interior, dynamic energetic dramatic lighting, ultra detailed, no text",
    "nails": "professional beauty and nail-salon photography, clean elegant, soft flattering lighting, ultra detailed, no text",
    "optometry": "professional optometry and eyewear photography, clean bright modern clinic, ultra detailed, no text",
    "farm": "professional farm-market and orchard photography, rustic warm natural golden light, ultra detailed, no text",
    "orthodontics": "professional orthodontics and dental clinic photography, bright clean modern, friendly, ultra detailed, no text",
    "pizza": "professional pizzeria food photography, warm appetizing, melted cheese, ultra detailed",
    "italian": "professional upscale Italian fine-dining food photography, elegant candlelit, ultra detailed",
    "breakfast": "professional breakfast and brunch food photography, bright warm morning light, appetizing, ultra detailed",
    "pub": "professional pub and bar photography, warm cozy atmospheric lighting, ultra detailed, no text",
    "sportsbar": "professional sports-bar and grill photography, energetic, screen glow, ultra detailed, no text",
    "tire": "professional automotive tire-shop photography, clean garage, stacks of tires, crisp lighting, ultra detailed, no text",
    "vietnamese": "professional Vietnamese food photography, fresh vibrant, steam, herbs, ultra detailed",
    "nutrition": "professional smoothie and nutrition-shop photography, colorful fresh, bright clean, ultra detailed",
    "fastcasual": "professional fast-casual food photography, fresh build-your-own bowls and burritos, bright appetizing, ultra detailed",
    "hairsalon": "professional hair-salon photography, elegant modern interior, soft flattering lighting, ultra detailed, no text",
    "shelter": "professional animal-shelter photography, happy healthy adoptable dogs and cats, bright warm caring, ultra detailed, no text",
    "burger": "professional American burger and hot-dog photography, juicy appetizing, retro diner vibe, ultra detailed",
    "pancakes": "professional breakfast photography, fluffy pancakes and skillets, warm morning light, appetizing, ultra detailed",
    "beautybar": "professional beauty-salon photography, lash and brow studio, clean elegant soft lighting, ultra detailed, no text",
    "custard": "professional frozen-custard and ice-cream photography, creamy swirls, colorful, bright appetizing, ultra detailed",
    "pubgrill": "professional pub-and-grille food photography, wings burgers and beer, warm cozy, ultra detailed, no text",
    "butcher": "professional butcher-shop photography, premium hand-cut meats and a full-service counter, warm rich lighting, ultra detailed, no text",
    "coffeeshop": "professional specialty-coffee photography, espresso latte art and a cozy roastery cafe, warm inviting lighting, ultra detailed, no text",
    "petboutique": "professional pet-bakery and boutique photography, decorated dog treats and happy pets, bright cheerful lighting, ultra detailed, no text",
    "pilates": "professional pilates-studio photography, reformer machines in a calm bright airy studio, soft natural light, ultra detailed, no text",
    "chiro": "professional chiropractic-clinic photography, clean modern wellness treatment room, calm reassuring lighting, ultra detailed, no text",
    "law": "professional law-firm photography, elegant office with bookshelves and a conference table, warm authoritative lighting, ultra detailed, no text",
    "insurance": "professional insurance-agency photography, welcoming modern office and protected homes and families, bright reassuring lighting, ultra detailed, no text",
    "accounting": "professional accounting-firm photography, organized modern office desk with documents and a calculator, clean credible lighting, ultra detailed, no text",
    "bbq": "professional barbecue food photography, wood-smoked brisket ribs and sides, warm smoky moody lighting, appetizing, ultra detailed",
    "bikeshop": "professional bike-shop photography, bicycles and a repair stand in a bright modern shop, energetic clean lighting, ultra detailed, no text",
    "recordstore": "professional record-store photography, crates of vinyl records and turntables in a cool indie shop, moody warm lighting, ultra detailed, no text",
    "bookstore": "professional bookstore photography, cozy shelves of books and a warm reading nook, inviting golden lighting, ultra detailed, no text",
    "bakery": "professional bakery photography, pastries cakes and breads in a charming display case, warm appetizing lighting, ultra detailed",
    "winery": "professional winery and wine-bar photography, glasses of wine and a charcuterie board in a candlelit space, warm intimate lighting, ultra detailed",
    "florist": "professional florist photography, lush colorful fresh flower bouquets and arrangements, bright airy lighting, ultra detailed, no text",
    "brewery": "professional craft-brewery photography, glasses of beer and gleaming fermenters in an industrial taproom, warm moody lighting, ultra detailed, no text",
    "musicstore": "professional music-store photography, walls of guitars and instruments in a warm shop, inviting lighting, ultra detailed, no text",
    "pottery": "professional paint-your-own pottery studio photography, colorful painted ceramics and shelves of bisque, bright cheerful lighting, ultra detailed, no text",
    "spiceshop": "professional spice-shop photography, jars and scoops of colorful spices and blends, warm aromatic lighting, ultra detailed, no text",
    "furniture": "professional furniture-showroom photography, elegant living room vignettes and quality wood furniture, warm inviting lighting, ultra detailed, no text",
    "photographer": "professional photography-studio photography, framed portraits and a studio backdrop with lights, soft elegant lighting, ultra detailed, no text",
    "mma": "professional martial-arts gym photography, a clean MMA training floor with mats, bags and a cage, dynamic dramatic lighting, ultra detailed, no text",
    "deli": "professional Jewish-deli food photography, towering pastrami sandwiches and matzo ball soup, warm appetizing lighting, ultra detailed",
    "tattoo": "professional tattoo-studio photography, a clean modern tattoo station with art on the walls, moody cool lighting, ultra detailed, no text",
    "dance": "professional dance-studio photography, dancers and a bright studio with mirrors and a barre, energetic graceful lighting, ultra detailed, no text",
    "jeweler": "professional jewelry photography, sparkling diamond rings and fine jewelry on elegant display, crisp luxurious lighting, ultra detailed, no text",
    "chocolatier": "professional chocolatier photography, glossy artisan truffles and chocolates in a display case, warm rich lighting, ultra detailed, no text",
    "toystore": "professional toy-store photography, colorful shelves of toys games and plush, bright cheerful lighting, ultra detailed, no text",
    "theater": "professional historic-theater photography, an ornate vintage auditorium with red seats and a grand stage, dramatic warm lighting, ultra detailed, no text",
    "boba": "professional bubble-tea photography, colorful boba milk teas with tapioca pearls in clear cups, bright fun lighting, ultra detailed, no text",
    "giftshop": "professional gift-boutique photography, curated home decor candles and gifts on styled shelves, warm inviting lighting, ultra detailed, no text",
    "garden": "professional garden-center photography, lush colorful plants and flowers in a bright nursery, fresh natural lighting, ultra detailed, no text",
    "running": "professional running-store photography, running shoes and athletic gear on display, crisp energetic lighting, ultra detailed, no text",
    "escaperoom": "professional escape-room photography, an immersive themed adventure room with props, locks and dramatic lighting, ultra detailed, no text",
    "funcenter": "professional family-fun-center photography, colorful arcade games and go-karts under bright lights, fun energetic lighting, ultra detailed, no text",
    "cobbler": "professional cobbler-workshop photography, leather shoes, tools and a repair workbench, warm craftsman lighting, ultra detailed, no text",
    "bowling": "professional bowling-alley photography, glowing lanes with pins and bowling balls, retro fun lighting, ultra detailed, no text",
    "greek": "professional Greek food photography, gyros, saganaki and souvlaki, warm family-diner lighting, appetizing, ultra detailed",
    "tapas": "professional Spanish tapas photography, shared small plates and wine in a candlelit bistro, intimate moody lighting, ultra detailed",
    "autobody": "professional auto-body-shop photography, collision repair, paint booth and gleaming refinished panels, crisp workshop lighting, ultra detailed, no text",
    "paleteria": "professional Mexican paleteria photography, colorful fruit paletas, nieves and aguas frescas, bright cheerful lighting, ultra detailed, no text",
}

_LEFT = "wide cinematic composition with the main subject on the right and generous empty darker negative space on the left for text overlay"

HERO = {
    "restaurant": "cinematic hero photograph, abundant overhead spread of authentic mexican food, tacos, fresh salsas, lime, cilantro on a rustic dark wood table, warm ambient restaurant light",
    "auto": "cinematic wide photograph, a professional mechanic in clean uniform working on a car engine in a bright modern auto repair garage, dramatic side lighting, shallow depth of field",
    "barber": "cinematic wide interior photograph of a stylish modern barbershop, a barber giving a sharp skin fade haircut, warm vintage lighting, leather chairs, large mirrors",
    "hvac": "cinematic wide photograph, a friendly professional HVAC technician in uniform servicing a high efficiency furnace and air conditioning system in a clean comfortable home, bright trustworthy lighting",
    "chinese": f"cinematic hero photograph, an abundant spread of authentic Chinese dishes — dumplings, lo mein noodles, fried rice, glossy stir-fry — on a dark table with chopsticks, warm restaurant light, {_LEFT}",
    "vet": f"cinematic photograph, a friendly veterinarian in scrubs gently examining a happy golden retriever in a bright modern vet clinic, warm and caring, {_LEFT}",
    "fitness": f"cinematic photograph, an athlete training with dumbbells in a modern gym with moody dramatic lighting and energy, {_LEFT}",
    "nails": f"cinematic photograph, an elegant modern nail salon interior with a manicure in progress, soft blush and neutral tones, serene, {_LEFT}",
    "optometry": f"cinematic photograph, a modern optical boutique with a stylish wall of designer eyeglasses and a friendly optometrist, bright and clean, {_LEFT}",
    "farm": f"cinematic photograph, a rustic farm market overflowing with fresh apples, pumpkins, cider and baked goods, golden autumn light, {_LEFT}",
    "orthodontics": f"cinematic photograph, a smiling teenager with a confident healthy smile in a bright modern orthodontics office, friendly and clean, {_LEFT}",
    "pizza": f"cinematic photograph, a fresh hand-tossed pizza with bubbling cheese and basil, a slice being lifted with a cheese pull, warm pizzeria light, {_LEFT}",
    "italian": f"cinematic photograph, an elegant plate of house-made pasta beside a glass of red wine on a candlelit white-tablecloth table, {_LEFT}",
    "breakfast": f"cinematic photograph, a hearty breakfast spread of pancakes, eggs, bacon and coffee on a sunny cafe table, bright morning light, {_LEFT}",
    "pub": f"cinematic photograph, frosty pints of craft beer on a worn wooden bar in a warm cozy pub with brass and dark wood, {_LEFT}",
    "sportsbar": f"cinematic photograph, a platter of buffalo wings and cold beer on a sports-bar table with big-screen TVs glowing behind, energetic, {_LEFT}",
    "tire": f"cinematic photograph, a technician installing a new tire on a car in a clean modern tire shop with neat stacks of tires, dramatic lighting, {_LEFT}",
    "vietnamese": f"cinematic photograph, a steaming bowl of beef pho with fresh herbs and lime beside a crispy banh mi, vibrant, {_LEFT}",
    "nutrition": f"cinematic photograph, colorful protein shakes and a vibrant loaded tea on a clean counter with fresh fruit, bright and energetic, {_LEFT}",
    "fastcasual": f"cinematic photograph, a fresh build-your-own burrito bowl loaded with rice, grilled chicken, guacamole and salsa, bright appetizing, {_LEFT}",
    "hairsalon": f"cinematic photograph, a stylist finishing a beautiful glossy blowout on a happy client in a chic modern hair salon, soft warm lighting, {_LEFT}",
    "shelter": f"cinematic photograph, an adorable adoptable golden puppy and a kitten together in a bright warm animal shelter, heartwarming, {_LEFT}",
    "burger": f"cinematic photograph, a juicy double cheeseburger with crispy fries and a thick milkshake on a retro diner counter, {_LEFT}",
    "pancakes": f"cinematic photograph, a tall stack of fluffy buttermilk pancakes with melting butter and syrup beside a sizzling breakfast skillet, warm morning light, {_LEFT}",
    "beautybar": f"cinematic photograph, a lash artist applying lash extensions to a relaxed client in a chic modern beauty bar, soft pink lighting, {_LEFT}",
    "custard": f"cinematic photograph, a swirled frozen custard cone and a loaded hot-fudge sundae on a retro counter, bright and creamy, {_LEFT}",
    "pubgrill": f"cinematic photograph, a platter of saucy buffalo wings and a juicy burger with a cold beer on a pub table, warm cozy lighting, {_LEFT}",
    "butcher": f"cinematic photograph, a butcher's display case full of premium marbled steaks and house-made sausages with a wood counter, warm rich lighting, {_LEFT}",
    "coffeeshop": f"cinematic photograph, a barista pouring latte art into a ceramic cup on a cafe bar with espresso machine behind, warm inviting light, {_LEFT}",
    "petboutique": f"cinematic photograph, a display of colorfully frosted dog cupcakes and treats with a happy dog nearby in a bright pet boutique, {_LEFT}",
    "pilates": f"cinematic photograph, sleek pilates reformer machines lined up in a calm bright airy studio with plants and big windows, {_LEFT}",
    "chiro": f"cinematic photograph, a calm modern chiropractic treatment room with an adjustment table and soft natural light, {_LEFT}",
    "law": f"cinematic photograph, an elegant law office with floor-to-ceiling law books, a polished conference table, and warm light, {_LEFT}",
    "insurance": f"cinematic photograph, a warm welcoming insurance agency office with a friendly meeting area and big windows, {_LEFT}",
    "accounting": f"cinematic photograph, an organized modern accounting office desk with neat documents, a laptop and calculator, clean light, {_LEFT}",
    "bbq": f"cinematic photograph, a wooden board piled with sliced smoked brisket, glazed ribs and classic BBQ sides, warm smoky lighting, {_LEFT}",
    "bikeshop": f"cinematic photograph, a row of gleaming bicycles and a pro repair stand in a bright modern bike shop, energetic light, {_LEFT}",
    "recordstore": f"cinematic photograph, crates of colorful vinyl records and a turntable in a cool indie record store, moody warm light, {_LEFT}",
    "bookstore": f"cinematic photograph, warm wooden shelves full of books with a cozy reading nook and soft lamplight in an independent bookstore, {_LEFT}",
    "bakery": f"cinematic photograph, a glass case full of glossy pastries, cupcakes and artisan breads in a charming bakery, warm light, {_LEFT}",
    "winery": f"cinematic photograph, two glasses of red wine and a rustic charcuterie board on a candlelit wine-bar table, warm intimate light, {_LEFT}",
    "florist": f"cinematic photograph, a florist hand-arranging a lush colorful bouquet at a flower-filled work bench, bright airy light, {_LEFT}",
    "brewery": f"cinematic photograph, a flight of craft beers on a wooden taproom table with gleaming fermenters behind, warm moody light, {_LEFT}",
    "musicstore": f"cinematic photograph, a warm music shop with walls of guitars and a grand piano, inviting golden light, {_LEFT}",
    "pottery": f"cinematic photograph, a bright pottery studio table with brushes, paints and colorful hand-painted ceramic pieces, {_LEFT}",
    "spiceshop": f"cinematic photograph, rows of glass jars full of colorful spices and house blends with wooden scoops on a shop counter, warm light, {_LEFT}",
    "furniture": f"cinematic photograph, an elegant living-room vignette with a plush sofa and quality wood furniture in a warm showroom, inviting light, {_LEFT}",
    "photographer": f"cinematic photograph, a portrait photography studio with softbox lights, a backdrop and framed prints on the wall, soft elegant light, {_LEFT}",
    "mma": f"cinematic photograph, a clean martial-arts gym training floor with mats, heavy bags and a cage in dramatic light, {_LEFT}",
    "deli": f"cinematic photograph, a towering hand-cut pastrami sandwich on rye beside a bowl of matzo ball soup on a deli counter, warm light, {_LEFT}",
    "tattoo": f"cinematic photograph, a clean modern tattoo studio station with an artist's chair, lamp and framed art on the walls, moody cool light, {_LEFT}",
    "dance": f"cinematic photograph, dancers mid-movement in a bright dance studio with mirrors, a barre and wood floors, energetic graceful light, {_LEFT}",
    "jeweler": f"cinematic photograph, a sparkling diamond engagement ring and fine jewelry on a velvet display under elegant light, {_LEFT}",
    "chocolatier": f"cinematic photograph, rows of glossy artisan chocolate truffles and bonbons in a glass case, warm rich light, {_LEFT}",
    "toystore": f"cinematic photograph, colorful shelves packed with toys, board games and plush in a cheerful toy shop, bright light, {_LEFT}",
    "theater": f"cinematic photograph, an ornate restored 1920s theater auditorium with red velvet seats and a grand lit stage, dramatic warm light, {_LEFT}",
    "boba": f"cinematic photograph, colorful bubble teas with tapioca pearls in clear cups on a bright counter, fun playful light, {_LEFT}",
    "giftshop": f"cinematic photograph, a beautifully styled gift-boutique shelf with candles, decor and wrapped gifts, warm inviting light, {_LEFT}",
    "garden": f"cinematic photograph, rows of lush colorful potted plants and blooming flowers in a bright greenhouse nursery, fresh natural light, {_LEFT}",
    "running": f"cinematic photograph, a wall of running shoes and athletic apparel in a modern specialty running store, crisp bright light, {_LEFT}",
    "escaperoom": f"cinematic photograph, an immersive themed escape room with mysterious props, an old map, locks and dramatic moody light, {_LEFT}",
    "funcenter": f"cinematic photograph, a colorful family fun center with arcade games glowing and go-karts, bright energetic light, {_LEFT}",
    "cobbler": f"cinematic photograph, a craftsman cobbler workbench with leather shoes, hand tools and thread under warm focused light, {_LEFT}",
    "bowling": f"cinematic photograph, glowing bowling lanes with pins set and bowling balls in a lively retro bowling alley, neon light, {_LEFT}",
    "greek": f"cinematic photograph, a loaded gyros platter with warm pita, tzatziki and a flaming saganaki beside it on a family-diner table, warm appetizing light, {_LEFT}",
    "tapas": f"cinematic photograph, a candlelit table of shared Spanish tapas — patatas bravas, gambas al ajillo, olives — with glasses of red wine, intimate moody light, {_LEFT}",
    "autobody": f"cinematic photograph, a freshly refinished car panel gleaming under paint-booth lights in a clean collision repair shop, crisp dramatic light, {_LEFT}",
    "paleteria": f"cinematic photograph, rows of colorful hand-made fruit paletas in a bright display case with a mangonada drizzled in chamoy, cheerful vivid light, {_LEFT}",
}

ABOUT = {
    "restaurant": "warm inviting interior of a family owned mexican restaurant, cozy ambiance, soft string lights, rustic decor, golden hour glow",
    "auto": "a friendly professional auto mechanic in a clean uniform smiling with arms crossed inside a bright modern repair shop, approachable and trustworthy",
    "barber": "atmospheric interior of a premium barbershop, vintage mirrors, neatly arranged barber tools on a wood counter, warm leather and brass details",
    "hvac": "a friendly uniformed HVAC technician shaking hands with a happy homeowner in a bright comfortable living room, warmth and trust",
    "chinese": "warm inviting interior of a family-owned Chinese restaurant, red lanterns, dark wood, cozy booths, soft golden light",
    "vet": "a warm friendly veterinary clinic reception, a smiling vet tech holding a happy cat, bright clean welcoming space",
    "fitness": "interior of a modern gym with racks of dumbbells, turf, and equipment, dramatic motivating lighting",
    "nails": "serene elegant nail salon interior, comfortable pedicure chairs, soft blush lighting, clean and modern",
    "optometry": "interior of a modern eyewear boutique with neatly displayed designer frames, bright and clean",
    "farm": "charming rustic farm market interior with wooden crates of apples, pumpkins, jars of honey and fresh baked pies, warm cozy",
    "orthodontics": "interior of a bright modern orthodontics office with a friendly clean reception area, welcoming",
    "pizza": "warm interior of a neighborhood pizzeria with a brick oven and cozy booths, inviting",
    "italian": "elegant interior of an upscale Italian restaurant, candlelight, white tablecloths, romantic ambiance",
    "breakfast": "cozy interior of a small-town breakfast cafe with sunny windows and comfortable booths",
    "pub": "warm atmospheric interior of a neighborhood pub with dark wood, brass, and rows of taps",
    "sportsbar": "lively interior of a sports bar with big-screen TVs, booths, and team memorabilia",
    "tire": "interior of a clean modern tire shop with neat rows of tires and a service bay",
    "vietnamese": "warm modern interior of a Vietnamese restaurant with bamboo and greenery accents, inviting",
    "nutrition": "bright modern interior of a smoothie and nutrition shop with a colorful menu board, fresh and energetic",
    "fastcasual": "bright modern interior of a fast-casual restaurant with a fresh ingredient line, clean and inviting",
    "hairsalon": "chic modern interior of a hair salon with styling stations, mirrors, and warm lighting",
    "shelter": "warm welcoming interior of an animal shelter adoption area with happy pets and caring volunteers",
    "burger": "retro American diner and drive-in interior with chrome and red booths, nostalgic",
    "pancakes": "cozy interior of a family pancake house with sunny windows and comfortable booths",
    "beautybar": "chic modern interior of a lash and brow beauty bar with soft pink and gold accents and treatment beds",
    "custard": "retro frozen-custard stand interior with a walk-up window and vintage signage, cheerful",
    "pubgrill": "warm interior of a neighborhood pub and grille with booths, TVs, and a wood bar, inviting",
    "butcher": "warm interior of an old-fashioned full-service butcher shop with a meat display case and specialty foods shelves",
    "coffeeshop": "cozy modern interior of a specialty coffee house with warm wood, plants, and comfortable seating near big windows",
    "petboutique": "bright cheerful interior of a pet bakery and boutique with treat displays, toys, and a self-wash station",
    "pilates": "calm bright airy pilates studio interior with reformer machines, light wood floors, plants, and big windows",
    "chiro": "clean modern chiropractic and wellness clinic interior with treatment tables and a calm reception area",
    "law": "elegant professional law-firm interior with dark wood, law books, and a welcoming reception area",
    "insurance": "welcoming modern insurance-agency office interior with comfortable seating and a friendly front desk",
    "accounting": "professional accounting-office interior with organized desks, shelving, and a tidy meeting area",
    "bbq": "rustic warm BBQ smokehouse interior with a counter, wood smoker, and casual seating",
    "bikeshop": "bright modern bike-shop interior with bicycles on display, a service area, and gear walls",
    "recordstore": "cool indie record-store interior with vinyl crates, posters, and a listening station",
    "bookstore": "cozy independent bookstore interior with tall wooden shelves, a reading nook, and warm lamplight",
    "bakery": "charming bakery interior with a glass pastry case, chalkboard menu, and a few cafe tables",
    "winery": "intimate urban winery and wine-bar interior with wine racks, candlelit tables, and a cozy bar",
    "florist": "bright airy florist shop interior full of fresh flowers, a work bench, and a cooler of bouquets",
    "brewery": "industrial craft-brewery taproom interior with a long bar, tap wall, fermenters, and communal tables",
    "musicstore": "warm family music-store interior with walls of guitars, keyboards, and a small lesson room",
    "pottery": "bright cheerful paint-your-own pottery studio interior with shelves of bisque, painting tables, and finished pieces",
    "spiceshop": "cozy specialty spice-shop interior with wooden shelves of glass spice jars and a tasting counter",
    "furniture": "elegant furniture-showroom interior with living room vignettes, sofas, and quality wood pieces",
    "photographer": "warm photography-studio interior with backdrops, studio lighting, and framed portrait prints",
    "mma": "clean martial-arts gym interior with training mats, heavy bags, a cage, and equipment",
    "deli": "classic Jewish-deli interior with a counter case, retro booths, and hanging salamis",
    "tattoo": "clean modern tattoo-studio interior with artist stations, framed flash art, and a waiting area",
    "dance": "bright dance-studio interior with mirrored walls, a ballet barre, and a sprung wood floor",
    "jeweler": "elegant fine-jewelry showroom interior with lit display cases and a consultation area",
    "chocolatier": "warm chocolatier and dessert-cafe interior with a glass case of chocolates and a few cafe tables",
    "toystore": "colorful independent toy-store interior with packed shelves and a play area",
    "theater": "ornate restored vintage theater lobby with chandeliers, a marquee, and a grand staircase",
    "boba": "bright fun bubble-tea shop interior with a drink counter, colorful menu, and casual seating",
    "giftshop": "warm curated gift-boutique interior with styled shelves of home decor and gifts",
    "garden": "bright garden-center greenhouse interior full of lush plants, flowers, and garden supplies",
    "running": "modern specialty running-store interior with shoe walls, apparel, and a fitting area",
    "escaperoom": "immersive escape-room venue interior with themed adventure rooms and a lobby",
    "funcenter": "colorful family fun center interior with arcade games, redemption counter, and attractions",
    "cobbler": "warm cobbler workshop interior with shoe-repair machines, leather goods, and a service counter",
    "bowling": "lively retro bowling alley interior with glowing lanes, ball returns, and a bar and grill",
    "greek": "warm interior of a family-owned Greek diner, cozy booths, checkered accents, welcoming golden light",
    "tapas": "intimate candlelit tapas bistro interior with a marble bar, wine shelves, and moonlit window seats",
    "autobody": "clean collision repair shop interior with a paint booth, frame rack, and a freshly repaired car",
    "paleteria": "bright cheerful paleteria interior with a colorful ice-cream case, papel picado accents, and counter seating",
}

OUT = Path("public/img")
TIMEOUT = 150
HEADERS = {"User-Agent": "Mozilla/5.0 LBG-image-gen"}


def fetch(prompt, w, h, seed):
    url = (
        "https://image.pollinations.ai/prompt/"
        + urllib.parse.quote(prompt)
        + f"?width={w}&height={h}&nologo=true&model=flux&seed={seed}"
    )
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read()


def generate(task):
    """Sequential, rate-limit-friendly. Skips already-downloaded valid files."""
    slug, name, prompt, w, h, seed = task
    dest = OUT / slug / f"{name}.jpg"
    if dest.exists() and dest.stat().st_size > 8000:
        return (f"{slug}/{name}", dest.stat().st_size, "skip")
    dest.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(6):
        try:
            data = fetch(prompt, w, h, seed + attempt * 1000)
            if len(data) > 8000 and (data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n"):
                dest.write_bytes(data)
                time.sleep(6)  # be polite between successful generations
                return (f"{slug}/{name}", len(data), "ok")
            time.sleep(6)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(18 + attempt * 12)  # backoff on rate limit
            else:
                time.sleep(8)
        except Exception:  # noqa
            time.sleep(8)
    return (f"{slug}/{name}", 0, "FAILED")


def build_tasks():
    tasks = []
    seed = 100
    for c in CLIENTS:
        slug, vert = c["slug"], c["vertical"]
        data = json.loads(Path(c["copy"]).read_text(encoding="utf-8"))
        captions = data["en"]["gallery"]["captions"][:6]
        tasks.append((slug, "hero", f"{HERO[vert]}, {STYLE[vert]}", 1536, 960, seed)); seed += 1
        tasks.append((slug, "about", f"{ABOUT[vert]}, {STYLE[vert]}", 1000, 1000, seed)); seed += 1
        for i, cap in enumerate(captions, 1):
            tasks.append((slug, f"g{i}", f"{cap}, {STYLE[vert]}", 800, 800, seed)); seed += 1
    return tasks


def main():
    tasks = build_tasks()
    print(f"[img] generating {len(tasks)} images (sequential)...", file=sys.stderr)
    results = []
    for t in tasks:
        r = generate(t)
        results.append(r)
        print(f"  {r[2]:8s} {r[0]:40s} {r[1] // 1024}KB", file=sys.stderr)
    bad = [r for r in results if r[2] == "FAILED"]
    ok = [r for r in results if r[2] in ("ok", "skip")]
    print(f"\n[img] DONE: {len(ok)}/{len(tasks)} present", file=sys.stderr)
    if bad:
        print("[img] FAILED:", [b[0] for b in bad], file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
