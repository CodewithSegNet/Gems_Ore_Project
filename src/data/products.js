import watches from "../assets/watches.avif";
import rings from "../assets/rings.avif";
import earringsImg from "../assets/earrings.avif";
import necklace from "../assets/neckless.avif";
import bracelet from "../assets/bracklet.avif";
import maleCol1 from "../assets/male_collection_1.png";
import maleCol2 from "../assets/male_collection_2.png";
import maleCol3 from "../assets/male_collection_3.png";
import maleCol4 from "../assets/male_collection_4.png";
import maleCol5 from "../assets/male_collection_5.png";
import maleCol6 from "../assets/male_collection_6.png";

export const newestProducts = [
  { id: 201, name: "Pearl & Diamond Pendant", rating: 5.0, price: 1300000, image: necklace, inStock: true, category: "necklaces", gender: "women", description: "Elevate your elegance with this timeless pearl & diamond pendant necklace, crafted to capture light and attention effortlessly. At its centre sits a stunning emerald-cut green gemstone, precisely faceted to enhance its depth, brilliance, and rich color saturation. The vibrant stone is securely held in a cathedral gold prong setting, allowing maximum light exposure for a subtle glow. Accentuating the gemstone is a delicate display of interlinking accent stones, adding a subtle touch of sparkle and sophistication. The pendant is suspended from a fine, professional gold chain designed for both durability and graceful draping along the neckline. Perfectly built for everyday luxury and special occasions, this extraordinary creation is bound to become your statement piece.", features: ["Emerald-cut green gemstone centrepiece", "Premium gold chain with secure clasp", "Sparkling accent stones detailing", "Elegant, minimalist design", "Ideal for formal events and everyday wear"] },
  { id: 202, name: "Sapphire & Gold Ring", rating: 5.0, price: 1000000, image: rings, inStock: false, category: "rings", gender: "women", description: "A captivating sapphire stone set in a luxurious gold band.", features: ["Natural sapphire centre stone", "18K gold band construction", "Precision-cut gemstone setting", "Comfortable fit design", "Comes with certificate of authenticity"] },
  { id: 203, name: "Emerald & Silver Bracelet", rating: 5.0, price: 850000, image: bracelet, inStock: true, category: "bracelets", gender: "women", description: "This stunning bracelet combines the rich green of emeralds with polished sterling silver.", features: ["Genuine emerald stones", "Sterling silver construction", "Adjustable clasp mechanism", "Hand-polished finish", "Gift box included"] },
  { id: 204, name: "Diamond-Crusted Leather Watch", rating: 5.0, price: 600000, image: watches, inStock: true, category: "watches", gender: "women", description: "Where luxury meets functionality. This exquisite timepiece features genuine diamond accents on a premium leather strap.", features: ["Genuine diamond accents", "Premium Italian leather strap", "Swiss movement mechanism", "Water-resistant to 50 metres", "Scratch-resistant sapphire crystal"] },
  { id: 205, name: "Silver Stud Earrings", rating: 5.0, price: 950000, image: earringsImg, inStock: true, category: "earrings", gender: "women", description: "Classic and versatile, these sterling silver stud earrings are perfect for everyday elegance.", features: ["925 Sterling silver", "Hypoallergenic posts", "Secure butterfly backs", "Mirror-polished finish", "Lightweight and comfortable"] },
  { id: 206, name: "Blue-Stoned Wedding Rings", rating: 5.0, price: 650000, image: rings, inStock: true, category: "rings", gender: "women", description: "Celebrate your union with these exquisite blue-stoned wedding rings.", features: ["Natural blue gemstones", "Matching his & hers design", "Engraving option available", "Comfort-fit band", "Lifetime warranty"] },
  { id: 207, name: "Rose Gold Tennis Bracelet", rating: 5.0, price: 2500000, image: bracelet, inStock: true, category: "bracelets", gender: "women", description: "A row of brilliant-cut diamonds set in warm rose gold.", features: ["Rose gold plating over sterling silver", "Brilliant-cut cubic zirconia stones", "Box clasp with safety latch", "Flexible articulated links", "Comes in luxury gift box"] },
  { id: 208, name: "Platinum Diamond Necklace", rating: 5.0, price: 3200000, image: necklace, inStock: true, category: "necklaces", gender: "women", description: "A breathtaking platinum diamond necklace that captures the essence of opulence.", features: ["Platinum-plated construction", "Multiple brilliant-cut diamonds", "Secure lobster clasp", "Adjustable chain length", "Certificate of authenticity included"] },
  { id: 209, name: "Vintage Gold Pocket Watch", rating: 5.0, price: 1800000, image: watches, inStock: false, category: "watches", gender: "women", description: "Step back in time with this magnificent vintage gold pocket watch.", features: ["Gold-plated brass case", "Manual wind movement", "Roman numeral dial", "Chain and fob included", "Presentation box included"] },
  // Men's products
  { id: 210, name: "Cuban Link Gold Chain", rating: 5.0, price: 1500000, image: maleCol1, inStock: true, category: "necklaces", gender: "men", description: "A bold Cuban link chain in solid gold, the ultimate statement piece for the modern man.", features: ["18K gold plating", "Cuban link design", "Secure lobster clasp", "Tarnish-resistant", "Multiple lengths available"] },
  { id: 211, name: "Gold Chronograph Watch", rating: 5.0, price: 2200000, image: maleCol2, inStock: true, category: "watches", gender: "men", description: "A premium gold chronograph watch with stopwatch function and date display.", features: ["Gold-plated stainless steel", "Chronograph movement", "Sapphire crystal", "Water-resistant to 100m", "Deployment clasp"] },
  { id: 212, name: "Gold Hoop Earrings for Men", rating: 5.0, price: 450000, image: maleCol3, inStock: true, category: "earrings", gender: "men", description: "Sleek gold hoop earrings designed for the stylish gentleman.", features: ["18K gold plating", "Hinged snap closure", "Lightweight design", "Hypoallergenic", "Comes in pair"] },
  { id: 213, name: "Gold Cross Pendant", rating: 5.0, price: 850000, image: maleCol4, inStock: true, category: "necklaces", gender: "men", description: "A stunning gold cross pendant on a thick rope chain, perfect for everyday wear.", features: ["24K gold plating", "Rope chain included", "Secure clasp", "Tarnish-resistant", "Gift box included"] },
  { id: 214, name: "Signet Ring Collection", rating: 5.0, price: 750000, image: maleCol5, inStock: true, category: "rings", gender: "men", description: "Bold signet rings with gemstone accents, crafted for the distinguished gentleman.", features: ["Solid brass with gold plating", "Various gemstone options", "Comfort-fit band", "Engraving available", "Presentation box"] },
  { id: 215, name: "Men's Gold Anklet Chain", rating: 5.0, price: 380000, image: maleCol6, inStock: true, category: "bracelets", gender: "men", description: "A sleek gold anklet chain that adds a subtle touch of luxury.", features: ["18K gold plating", "Adjustable length", "Cuban link design", "Secure clasp", "Tarnish-resistant"] },
  { id: 216, name: "Diamond Cuban Bracelet", rating: 5.0, price: 1800000, image: maleCol1, inStock: true, category: "bracelets", gender: "men", description: "An iced-out Cuban link bracelet with diamond accents for a premium look.", features: ["Gold-plated brass", "CZ diamond setting", "Box clasp with safety", "Heavy-weight design", "Gift box included"] },
  { id: 217, name: "Gold Rope Chain Necklace", rating: 5.0, price: 950000, image: maleCol4, inStock: true, category: "necklaces", gender: "men", description: "A classic gold rope chain necklace, thick and bold for maximum impact.", features: ["24K gold plating", "Rope twist design", "Lobster clasp", "Multiple lengths", "Tarnish-free guarantee"] },
  { id: 218, name: "Black Onyx Signet Ring", rating: 5.0, price: 620000, image: maleCol5, inStock: false, category: "rings", gender: "men", description: "A sophisticated black onyx signet ring set in polished gold.", features: ["Natural black onyx stone", "18K gold band", "Comfort-fit", "Classic signet design", "Certificate included"] },
];

export const bestSellerProducts = [
  { id: 301, name: "Silver Stud Earrings", rating: 5.0, price: 650000, image: earringsImg, inStock: true, category: "earrings", gender: "women", description: "Classic and versatile, these sterling silver stud earrings are perfect for everyday elegance.", features: ["925 Sterling silver", "Hypoallergenic posts", "Secure butterfly backs", "Mirror-polished finish", "Lightweight and comfortable"] },
  { id: 302, name: "Silver Stud Earrings", rating: 5.0, price: 650000, image: earringsImg, inStock: true, category: "earrings", gender: "women", description: "Classic and versatile sterling silver stud earrings.", features: ["925 Sterling silver", "Hypoallergenic posts", "Secure butterfly backs", "Mirror-polished finish", "Lightweight and comfortable"] },
  { id: 303, name: "Silver Stud Earrings", rating: 5.0, price: 650000, image: earringsImg, inStock: true, category: "earrings", gender: "women", description: "Classic sterling silver stud earrings.", features: ["925 Sterling silver", "Hypoallergenic posts", "Secure butterfly backs", "Mirror-polished finish", "Lightweight and comfortable"] },
  { id: 304, name: "Silver Stud Earrings", rating: 5.0, price: 650000, image: earringsImg, inStock: true, category: "earrings", gender: "women", description: "Classic sterling silver stud earrings.", features: ["925 Sterling silver", "Hypoallergenic posts", "Secure butterfly backs", "Mirror-polished finish", "Lightweight and comfortable"] },
  { id: 305, name: "Silver Stud Earrings", rating: 5.0, price: 650000, image: earringsImg, inStock: true, category: "earrings", gender: "women", description: "Classic sterling silver stud earrings.", features: ["925 Sterling silver", "Hypoallergenic posts", "Secure butterfly backs", "Mirror-polished finish", "Lightweight and comfortable"] },
  { id: 306, name: "Silver Stud Earrings", rating: 5.0, price: 650000, image: earringsImg, inStock: true, category: "earrings", gender: "women", description: "Classic sterling silver stud earrings.", features: ["925 Sterling silver", "Hypoallergenic posts", "Secure butterfly backs", "Mirror-polished finish", "Lightweight and comfortable"] },
  { id: 307, name: "Gold Chain Bracelet", rating: 5.0, price: 750000, image: bracelet, inStock: true, category: "bracelets", gender: "women", description: "A sleek gold chain bracelet that adds instant polish.", features: ["Gold-plated brass", "Adjustable length", "Lobster clasp", "Tarnish-resistant coating", "Gift box included"] },
  { id: 308, name: "Classic Gold Watch", rating: 5.0, price: 900000, image: watches, inStock: true, category: "watches", gender: "women", description: "A timeless gold watch with clean dial.", features: ["Gold-plated case", "Japanese quartz movement", "Leather strap", "Water-resistant to 30m", "2-year warranty"] },
  { id: 309, name: "Diamond Ring", rating: 5.0, price: 1200000, image: rings, inStock: true, category: "rings", gender: "women", description: "A stunning diamond ring.", features: ["Genuine diamond centre", "18K white gold band", "Prong setting", "Comfort-fit", "Certificate included"] },
  { id: 310, name: "Pearl Necklace", rating: 5.0, price: 800000, image: necklace, inStock: true, category: "necklaces", gender: "women", description: "Elegant freshwater pearl necklace.", features: ["Freshwater pearls", "Sterling silver clasp", "18-inch length", "Hand-knotted string", "Velvet pouch included"] },
  // Men's best sellers
  { id: 311, name: "Cuban Link Chain", rating: 5.0, price: 1500000, image: maleCol1, inStock: true, category: "necklaces", gender: "men", description: "A bold Cuban link chain, the ultimate statement piece.", features: ["18K gold plating", "Cuban link design", "Secure lobster clasp", "Tarnish-resistant", "Multiple lengths"] },
  { id: 312, name: "Gold Chronograph", rating: 5.0, price: 2200000, image: maleCol2, inStock: true, category: "watches", gender: "men", description: "Premium gold chronograph watch.", features: ["Gold-plated steel", "Chronograph movement", "Sapphire crystal", "Water-resistant", "Deployment clasp"] },
  { id: 313, name: "Men's Hoop Earrings", rating: 5.0, price: 450000, image: maleCol3, inStock: true, category: "earrings", gender: "men", description: "Sleek gold hoop earrings for men.", features: ["18K gold plating", "Hinged closure", "Lightweight", "Hypoallergenic", "Comes in pair"] },
  { id: 314, name: "Gold Cross Pendant", rating: 5.0, price: 850000, image: maleCol4, inStock: true, category: "necklaces", gender: "men", description: "Stunning gold cross pendant on rope chain.", features: ["24K gold plating", "Rope chain", "Secure clasp", "Tarnish-resistant", "Gift box"] },
  { id: 315, name: "Onyx Signet Ring", rating: 5.0, price: 750000, image: maleCol5, inStock: true, category: "rings", gender: "men", description: "Bold onyx signet ring in polished gold.", features: ["Black onyx stone", "Gold band", "Comfort-fit", "Classic design", "Gift box"] },
  { id: 316, name: "Gold Anklet Chain", rating: 5.0, price: 380000, image: maleCol6, inStock: true, category: "bracelets", gender: "men", description: "Sleek gold anklet chain for men.", features: ["18K gold plating", "Adjustable", "Cuban link", "Secure clasp", "Tarnish-resistant"] },
];

// Product page catalog data
const watchNames = ["Classic Gold Watch", "Luxury Chronograph", "Dress Watch", "Smart Watch", "Diver Watch", "Aviator Watch", "Skeleton Watch", "Rose Gold Watch", "Minimalist Watch", "Sport Watch", "Diamond Watch", "Platinum Watch", "Vintage Watch", "Automatic Watch", "Moonphase Watch", "Tourbillon Watch", "Field Watch", "Racing Watch", "GMT Watch", "Pilot Watch"];
const ringNames = ["Diamond Ring", "Engagement Ring", "Signet Ring", "Wedding Band", "Eternity Ring", "Solitaire Ring", "Cocktail Ring", "Stackable Ring", "Promise Ring", "Birthstone Ring", "Sapphire Ring", "Ruby Ring", "Emerald Ring", "Pearl Ring", "Halo Ring", "Vintage Ring", "Celtic Ring", "Infinity Ring", "Cluster Ring", "Dome Ring"];
const necklaceNames = ["Pearl Necklace", "Layered Necklace", "Choker Necklace", "Pendant Necklace", "Chain Necklace", "Lariat Necklace", "Bar Necklace", "Statement Necklace", "Tennis Necklace", "Charm Necklace", "Beaded Necklace", "Diamond Necklace", "Gold Chain", "Silver Chain", "Rope Necklace", "Box Chain", "Figaro Necklace", "Cuban Link", "Collar Necklace", "Bib Necklace"];
const earringNames = ["Silver Stud Earrings", "Drop Earrings", "Hoop Earrings", "Stud Earrings Gold", "Chandelier Earrings", "Dangle Earrings", "Huggie Earrings", "Clip-On Earrings", "Pearl Earrings", "Diamond Studs", "Threader Earrings", "Crawler Earrings", "Tassel Earrings", "Geometric Earrings", "Cuff Earrings", "Statement Earrings", "Lever-Back Earrings", "Ball Earrings", "Crystal Earrings", "Chain Earrings"];
const braceletNames = ["Gold Bracelet", "Tennis Bracelet", "Charm Bracelet", "Cuff Bracelet", "Bangle Bracelet", "Link Bracelet", "Chain Bracelet", "Beaded Bracelet", "Wrap Bracelet", "Hinged Bracelet", "Pearl Bracelet", "Diamond Bracelet", "Leather Bracelet", "Rope Bracelet", "Slider Bracelet", "ID Bracelet", "Station Bracelet", "Bar Bracelet", "Mesh Bracelet", "Stretch Bracelet"];

const categoryDescriptions = {
  watches: "A beautifully crafted timepiece that combines precision engineering with elegant design. Perfect for those who appreciate both form and function in their daily accessories.",
  rings: "An exquisite ring that embodies timeless elegance. Meticulously crafted with attention to every detail, this piece is designed to be cherished for generations.",
  necklaces: "A stunning necklace that drapes gracefully along the neckline. Crafted with premium materials and designed to complement both casual and formal attire.",
  earrings: "Elegant earrings that frame your face with sophistication. Lightweight yet impactful, these are designed for all-day comfort without compromising on style.",
  bracelets: "A refined bracelet that adds a touch of luxury to any wrist. Designed with a secure clasp and comfortable fit for everyday wear.",
};

const categoryFeatures = {
  watches: ["Premium movement mechanism", "Scratch-resistant crystal", "Water-resistant design", "Comfortable strap", "2-year warranty"],
  rings: ["Premium metal construction", "Precision-set stones", "Comfort-fit band", "Tarnish-resistant finish", "Gift box included"],
  necklaces: ["Secure clasp mechanism", "Adjustable chain length", "Premium metal chain", "Hypoallergenic materials", "Comes in gift box"],
  earrings: ["Hypoallergenic posts", "Secure butterfly backs", "Lightweight design", "Mirror-polished finish", "Velvet pouch included"],
  bracelets: ["Adjustable clasp", "Tarnish-resistant coating", "Comfortable fit", "Premium construction", "Gift box included"],
};

export const generateCatalogProducts = () => {
  const products = [];
  let id = 1;
  const cats = [
    { names: watchNames, image: watches, category: "watches", gender: "men" },
    { names: ringNames, image: rings, category: "rings", gender: "women" },
    { names: necklaceNames, image: necklace, category: "necklaces", gender: "women" },
    { names: earringNames, image: earringsImg, category: "earrings", gender: "women" },
    { names: braceletNames, image: bracelet, category: "bracelets", gender: "women" },
  ];
  cats.forEach(({ names, image, category, gender }) => {
    names.forEach((name, i) => {
      products.push({
        id: id++,
        name,
        rating: 5.0,
        price: 650000,
        image,
        category,
        gender: i % 3 === 0 ? "men" : "women",
        inStock: i < 17,
        description: categoryDescriptions[category],
        features: categoryFeatures[category],
      });
    });
  });
  return products;
};

export const allCatalogProducts = generateCatalogProducts();

export const allHomepageProducts = [...newestProducts, ...bestSellerProducts];

// Combined lookup for product detail page — includes everything
export const allProductsLookup = [...allCatalogProducts, ...newestProducts, ...bestSellerProducts];

export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-NG").format(price);
};

export const customerReviews = [
  { name: "Hannah", location: "Abuja, Nigeria", rating: 7.83, text: "I adore this necklace! The gold is radiant, and the emerald-cut gemstone is mesmerizing! It's exactly what I was looking for — elegant in every light, super-luxuriant!", date: "February 2025", color: "text-yellow-500" },
  { name: "Fred", location: "Lagos, Nigeria", rating: 7.82, text: "The necklace is absolutely stunning! The craftsmanship is top notch, and the gemstone catches the light beautifully and the overall look is absolutely sleek! We love it. Definitely worth his investment!", date: "February 2025", color: "text-blue-500" },
  { name: "Keame", location: "Port Harcourt, Nigeria", rating: 7.83, text: "I'm in love with this necklace! It's delicate, yet it makes a statement. The brilliant-cut green stone is gorgeous, and it pairs well with both casual & formal outfits. A must-have for a trendy person!", date: "February 2025", color: "text-red-500" },
  { name: "Aisha", location: "Lekki, Nigeria", rating: 8.10, text: "Absolutely breathtaking! The attention to detail is remarkable. I've received so many compliments since I started wearing it. The quality surpasses my expectations by far!", date: "January 2025", color: "text-purple-500" },
  { name: "Daniel", location: "Abuja, Nigeria", rating: 7.95, text: "Bought this as a gift for my wife and she was over the moon! The packaging was premium and the piece itself is even more beautiful in person. Will definitely be ordering again.", date: "January 2025", color: "text-green-500" },
  { name: "Chioma", location: "Ikeja, Nigeria", rating: 8.20, text: "This is hands down the best jewelry purchase I've ever made online. The craftsmanship is impeccable, and it arrived faster than expected. Five stars aren't enough!", date: "March 2025", color: "text-pink-500" },
  { name: "Emeka", location: "Victoria Island, Nigeria", rating: 7.90, text: "Great value for the price. The design is sleek and modern, yet it has a timeless feel. I wear it daily and it still looks brand new after months of use.", date: "December 2024", color: "text-orange-500" },
  { name: "Zara", location: "Garki, Nigeria", rating: 8.05, text: "The sparkle on this piece is unreal! Every angle catches light differently. It's become my go-to accessory for both work meetings and evening events. Truly versatile!", date: "March 2025", color: "text-teal-500" },
];
