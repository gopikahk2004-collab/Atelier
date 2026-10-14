// ==========================================
// ATELIER LUXE - Product & Fashion Catalog
// ==========================================

const PRODUCTS_DATA = [
  {
    id: "blazer-obsidian-01",
    name: "Obsidian Satin-Lapel Blazer",
    tagline: "Sharp Italian tailoring with double-faced silk satin lapels",
    category: "outerwear",
    dressingSlot: "outerwear",
    price: 680,
    originalPrice: 850,
    rating: 4.9,
    reviewsCount: 42,
    badge: "Trending",
    image: "assets/images/product_blazer.jpg",
    fabric: "85% Virgin Wool, 15% Silk Satin",
    season: "Autumn/Winter",
    colors: [
      { name: "Obsidian Black", hex: "#151517" },
      { name: "Midnight Navy", hex: "#1c2333" },
      { name: "Burgundy Velvet", hex: "#4a121e" }
    ],
    defaultColor: "#151517",
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "An architectural masterpiece engineered with sculpted shoulders, tapered waistline, and lustrous duchess satin peak lapels. Seamlessly transitions between black-tie soirées and progressive daytime tailoring.",
    svgGarmentId: "svg-outerwear-blazer"
  },
  {
    id: "dress-emerald-02",
    name: "Aurelia Draped Silk Gown",
    tagline: "Floor-sweeping emerald green silk charmeuse with asymmetrical slit",
    category: "dresses",
    dressingSlot: "dress", // overrides top & bottom
    price: 1150,
    originalPrice: 1380,
    rating: 5.0,
    reviewsCount: 68,
    badge: "Editor's Pick",
    image: "assets/images/product_dress.jpg",
    fabric: "100% Mulberry Silk Charmeuse",
    season: "High Summer / Resort",
    colors: [
      { name: "Emerald Glaze", hex: "#0c593f" },
      { name: "Champagne Gold", hex: "#c9a96e" },
      { name: "Crimson Noir", hex: "#630b1c" }
    ],
    defaultColor: "#0c593f",
    sizes: ["XS", "S", "M", "L"],
    description: "Crafted from liquid-weight mulberry silk that catches every glimmer of light. Features a Grecian pleated bodice, dramatic thigh-high contour slit, and an cascading draped train.",
    svgGarmentId: "svg-dress-emerald"
  },
  {
    id: "coat-caramel-03",
    name: "Sienna Oversized Leather Trench",
    tagline: "Supple caramel lambskin leather with horn hardware",
    category: "outerwear",
    dressingSlot: "outerwear",
    price: 980,
    originalPrice: 1200,
    rating: 4.8,
    reviewsCount: 35,
    badge: "Bestseller",
    image: "assets/images/product_trench.jpg",
    fabric: "100% Vegetable-Tanned Lambskin",
    season: "All-Season",
    colors: [
      { name: "Caramel Toffee", hex: "#9b5e34" },
      { name: "Matte Black", hex: "#181818" },
      { name: "Desert Sand", hex: "#c2ab87" }
    ],
    defaultColor: "#9b5e34",
    sizes: ["S", "M", "L", "XL"],
    description: "Generously cut for effortless layering, this modern interpretation of the military trench boasts storm flaps, adjustable storm-tab cuffs, and a wide-cinched tie belt.",
    svgGarmentId: "svg-outerwear-trench"
  },
  {
    id: "knit-cream-04",
    name: "Geneva Cashmere Mockneck",
    tagline: "Ultra-fine 4-ply Mongolian ribbed cashmere knitwear",
    category: "tops",
    dressingSlot: "top",
    price: 420,
    originalPrice: 490,
    rating: 4.9,
    reviewsCount: 51,
    badge: "Essentials",
    image: "assets/images/product_streetwear.jpg",
    fabric: "100% Grade-A Mongolian Cashmere",
    season: "Fall/Winter",
    colors: [
      { name: "Alabaster Cream", hex: "#f1eee7" },
      { name: "Oatmeal Melange", hex: "#d8cfc0" },
      { name: "Smoked Heather", hex: "#4b4b4e" }
    ],
    defaultColor: "#f1eee7",
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Unrivaled thermal softness meets timeless architectural ribbing. Designed with a structured funnel neck, dropped shoulder seams, and relaxed elongated cuffs.",
    svgGarmentId: "svg-top-cashmere"
  },
  {
    id: "trouser-pleated-05",
    name: "Vittorio Pleated Wool Trousers",
    tagline: "Wide-leg relaxed silhouette with double front inverted pleats",
    category: "bottoms",
    dressingSlot: "bottom",
    price: 360,
    originalPrice: 420,
    rating: 4.7,
    reviewsCount: 29,
    badge: "Iconic",
    image: "assets/images/product_streetwear.jpg",
    fabric: "100% Tropical Worsted Wool",
    season: "All-Season",
    colors: [
      { name: "Charcoal Slate", hex: "#35383d" },
      { name: "Warm Taupe", hex: "#7a6e65" },
      { name: "Onyx Black", hex: "#121214" }
    ],
    defaultColor: "#35383d",
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Impeccably draped tailored trousers that pool gracefully over sneakers or loafers. High-waisted contour waistband with internal horn-button closure.",
    svgGarmentId: "svg-bottom-trouser"
  },
  {
    id: "corset-leather-06",
    name: "Nocturne Sculpted Leather Bustier",
    tagline: "Hand-molded lambskin corset top with underwire architecture",
    category: "tops",
    dressingSlot: "top",
    price: 390,
    originalPrice: 450,
    rating: 4.8,
    reviewsCount: 19,
    badge: "Runway",
    image: "assets/images/product_blazer.jpg",
    fabric: "100% Semi-Gloss Nappa Leather",
    season: "Spring/Summer",
    colors: [
      { name: "Onyx Black", hex: "#161616" },
      { name: "Ivory Pearl", hex: "#f3ede3" },
      { name: "Deep Ruby", hex: "#630b1c" }
    ],
    defaultColor: "#161616",
    sizes: ["XS", "S", "M", "L"],
    description: "Form-fitting precision tailoring inspired by Parisian haute couture corsetry. Structured internal boning provides effortless posture support and silhouette contouring.",
    svgGarmentId: "svg-top-corset"
  },
  {
    id: "skirt-satin-07",
    name: "Calliope Bias-Cut Satin Midi Skirt",
    tagline: "Liquid shimmer heavy-weight silk skirt with fluted hem",
    category: "bottoms",
    dressingSlot: "bottom",
    price: 340,
    originalPrice: 390,
    rating: 4.9,
    reviewsCount: 47,
    badge: "Trending",
    image: "assets/images/product_dress.jpg",
    fabric: "92% Silk Satin, 8% Elastane",
    season: "All-Season",
    colors: [
      { name: "Emerald Glaze", hex: "#0c593f" },
      { name: "Golden Pearl", hex: "#d9bc82" },
      { name: "Silver Moonlight", hex: "#abb5be" }
    ],
    defaultColor: "#0c593f",
    sizes: ["XS", "S", "M", "L"],
    description: "Diagonal bias grain cut naturally hugs contours and creates dynamic movement. Concealed elasticized waistband for seamless, clean styling.",
    svgGarmentId: "svg-bottom-skirt"
  },
  {
    id: "boots-combat-08",
    name: "Titan Lug-Sole Monolith Boots",
    tagline: "Chunky platform tread boots with polished calfskin leather",
    category: "shoes",
    dressingSlot: "shoes",
    price: 520,
    originalPrice: 620,
    rating: 4.9,
    reviewsCount: 84,
    badge: "Bestseller",
    image: "assets/images/product_streetwear.jpg",
    fabric: "100% Box Calfskin, Vibram Rubber Sole",
    season: "All-Season",
    colors: [
      { name: "Jet Black", hex: "#111112" },
      { name: "Espresso", hex: "#2e211a" }
    ],
    defaultColor: "#111112",
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    description: "Defiant architectural proportion engineered with lightweight foam-injected lugged soles and padded ankle collars. Zippered medial entry for effortless wear.",
    svgGarmentId: "svg-shoes-boots"
  },
  {
    id: "heels-stiletto-09",
    name: "Sirena Minimalist Strap Heels",
    tagline: "Barely-there ankle wrap stilettos with 105mm architectural heel",
    category: "shoes",
    dressingSlot: "shoes",
    price: 480,
    originalPrice: 560,
    rating: 4.7,
    reviewsCount: 31,
    badge: "Evening",
    image: "assets/images/product_dress.jpg",
    fabric: "Metallic Kidskin Leather",
    season: "Spring/Summer",
    colors: [
      { name: "Gloss Gold", hex: "#c9a96e" },
      { name: "Midnight Black", hex: "#0f0f10" },
      { name: "Silver Chrome", hex: "#d1d5db" }
    ],
    defaultColor: "#c9a96e",
    sizes: ["36", "37", "38", "39", "40", "41"],
    description: "Ultra-slim delicate straps cradle the foot, grounded by a tapered counter heel engineered with balanced weight distribution for long evening comfort.",
    svgGarmentId: "svg-shoes-heels"
  },
  {
    id: "accessory-sunglasses-10",
    name: "Matrix Geometric Shield Eyewear",
    tagline: "Bold acetate cat-eye sunglasses with anti-reflective UV400 lenses",
    category: "accessories",
    dressingSlot: "accessories",
    price: 240,
    originalPrice: 290,
    rating: 4.9,
    reviewsCount: 22,
    badge: "New",
    image: "assets/images/product_blazer.jpg",
    fabric: "Mazzucchelli Italian Bio-Acetate",
    season: "All-Season",
    colors: [
      { name: "Black Smoke", hex: "#111111" },
      { name: "Tortoiseshell", hex: "#5a3a22" },
      { name: "Olive Green", hex: "#2b402e" }
    ],
    defaultColor: "#111111",
    sizes: ["One Size"],
    description: "Statement eyewear with bevel-cut edges and gold-inlaid core wires. Adds an instant razor-sharp edge to any casual or red-carpet styling.",
    svgGarmentId: "svg-acc-glasses"
  },
  {
    id: "bag-crossbody-11",
    name: "Palazzo Sculpted Flap Bag",
    tagline: "Trapezoid silhouette with gilded signature twist-lock clasp",
    category: "accessories",
    dressingSlot: "accessories",
    price: 760,
    originalPrice: 890,
    rating: 5.0,
    reviewsCount: 38,
    badge: "Exclusive",
    image: "assets/images/fitting_room_bg.jpg",
    fabric: "Full-Grain Italian Calfskin",
    season: "All-Season",
    colors: [
      { name: "Warm Caramel", hex: "#9b5e34" },
      { name: "Obsidian Black", hex: "#161618" },
      { name: "Forest Emerald", hex: "#0c593f" }
    ],
    defaultColor: "#9b5e34",
    sizes: ["One Size"],
    description: "Handcrafted in Florence using master saddlery stitching. The convertible sliding chain strap effortlessly transitions between crossbody and shoulder length.",
    svgGarmentId: "svg-acc-bag"
  }
];

// Curated Outfit Bundles for "AI Stylist"
const CURATED_STYLES = [
  {
    name: "Met Gala Red Carpet Glamour",
    vibe: "Opulent & Dramatic",
    description: "Emerald silk gown paired with Sirena gold stiletto heels and Palazzo clutch.",
    items: ["dress-emerald-02", "heels-stiletto-09", "bag-crossbody-11"],
    lighting: "runway"
  },
  {
    name: "Parisian Power Tailoring",
    vibe: "Sharp & Confident",
    description: "Obsidian satin lapel blazer with Vittorio wide-leg trousers and Matrix shield sunglasses.",
    items: ["blazer-obsidian-01", "knit-cream-04", "trouser-pleated-05", "boots-combat-08", "accessory-sunglasses-10"],
    lighting: "studio"
  },
  {
    name: "Milano Street Luxury",
    vibe: "Effortless & Contemporary",
    description: "Sienna leather trench layered over Geneva cashmere knit with monolith boots.",
    items: ["coat-caramel-03", "knit-cream-04", "trouser-pleated-05", "boots-combat-08", "bag-crossbody-11"],
    lighting: "golden"
  },
  {
    name: "Neo-Goth Nightfall",
    vibe: "Avant-Garde & Moody",
    description: "Sculpted leather bustier, satin bias midi skirt, and platform combat boots in neon glow.",
    items: ["corset-leather-06", "skirt-satin-07", "boots-combat-08", "accessory-sunglasses-10"],
    lighting: "neon"
  }
];
