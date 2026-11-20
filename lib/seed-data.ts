export type SeedCategory = {
  slug: string;
  name: string;
  emoji: string;
  blurb: string;
  tintFrom: string;
  tintTo: string;
};

export const CATEGORIES: SeedCategory[] = [
  {
    slug: "electronics",
    name: "Electronics & Computers",
    emoji: "🖥️",
    blurb: "Laptops, phones, audio and monitors",
    tintFrom: "#e7eef8",
    tintTo: "#b9cbe6",
  },
  {
    slug: "clothing",
    name: "Clothing & Apparel",
    emoji: "👕",
    blurb: "Everyday wear, outerwear and shoes",
    tintFrom: "#f7e9e6",
    tintTo: "#e6c3bb",
  },
  {
    slug: "home-living",
    name: "Home & Living",
    emoji: "🏠",
    blurb: "Furniture, decor and kitchenware",
    tintFrom: "#f4e6d1",
    tintTo: "#dcb692",
  },
  {
    slug: "fashion-accessories",
    name: "Fashion Accessories",
    emoji: "👜",
    blurb: "Bags, belts, scarves and shades",
    tintFrom: "#f6e7e1",
    tintTo: "#e0bfb2",
  },
  {
    slug: "beauty",
    name: "Beauty & Personal Care",
    emoji: "💄",
    blurb: "Skincare, makeup and fragrance",
    tintFrom: "#f9e8ef",
    tintTo: "#edc5d5",
  },
  {
    slug: "health",
    name: "Health & Wellness",
    emoji: "🩺",
    blurb: "Fitness, recovery and self-care",
    tintFrom: "#e6f2ea",
    tintTo: "#bfdccb",
  },
  {
    slug: "toys-games",
    name: "Toys & Games",
    emoji: "🧸",
    blurb: "Toys, puzzles and board games",
    tintFrom: "#fbead9",
    tintTo: "#f0c9a2",
  },
  {
    slug: "sports-outdoors",
    name: "Sports & Outdoors",
    emoji: "🚴",
    blurb: "Bikes, camping and training gear",
    tintFrom: "#e6f0e3",
    tintTo: "#bdd6b8",
  },
  {
    slug: "automotive",
    name: "Automotive Parts & Accessories",
    emoji: "🚗",
    blurb: "Parts, tools and car care",
    tintFrom: "#e9ebef",
    tintTo: "#c3c8d2",
  },
  {
    slug: "books-media",
    name: "Books & Media",
    emoji: "📚",
    blurb: "Books, music, films and prints",
    tintFrom: "#e5eefb",
    tintTo: "#bad0f2",
  },
  {
    slug: "pets",
    name: "Pets & Animal Supplies",
    emoji: "🐾",
    blurb: "Food, beds and supplies for pets",
    tintFrom: "#f3ecdf",
    tintTo: "#dccbaa",
  },
  {
    slug: "food-grocery",
    name: "Food & Grocery",
    emoji: "🥫",
    blurb: "Pantry staples and fresh finds",
    tintFrom: "#f8ecd8",
    tintTo: "#e6cfa2",
  },
  {
    slug: "industrial",
    name: "Industrial & Scientific",
    emoji: "🛠️",
    blurb: "Tools, equipment and supplies",
    tintFrom: "#e8e9e6",
    tintTo: "#c6c9c0",
  },
  {
    slug: "jewelry-watches",
    name: "Jewelry & Watches",
    emoji: "💎",
    blurb: "Fine jewelry and timepieces",
    tintFrom: "#fbefdb",
    tintTo: "#eac88d",
  },
  {
    slug: "baby-toddler",
    name: "Baby & Toddler Products",
    emoji: "🍼",
    blurb: "Gear, clothing and care for little ones",
    tintFrom: "#f7edf4",
    tintTo: "#e2c8dc",
  },
  {
    slug: "houses-rentals",
    name: "Houses & Rentals",
    emoji: "🏡",
    blurb: "Houses, rooms, apartments and short lets",
    tintFrom: "#e6f4ea",
    tintTo: "#b7e4cd",
  },
];
