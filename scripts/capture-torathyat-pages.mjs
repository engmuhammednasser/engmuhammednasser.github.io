import { captureSitePages } from "./capture-site-pages.mjs";

await captureSitePages({
  projectSlug: "torathyat",
  port: 9334,
  scope: "Arabic storefront, about page, shop pages, category pages, and product pages from Torathyat.",
  pages: [
    ["01-home", "https://torathyat.com/"],
    ["02-about-us", "https://torathyat.com/about-us/"],
    ["03-shop", "https://torathyat.com/shop/"],
    ["04-category-guns", "https://torathyat.com/product-category/guns/"],
    ["05-category-ateef", "https://torathyat.com/product-category/%d8%b9%d8%b7%d9%8a%d9%81/"],
    ["06-product-rifle", "https://torathyat.com/product/%d8%a8%d9%86%d8%af%d9%82%d9%8a%d9%87-%d9%85%d9%82%d9%85%d8%b9-%d8%b2%d9%8a%d9%86%d9%87/"],
    ["07-product-plate-set", "https://torathyat.com/product/%d8%b7%d9%82%d9%85-%d8%b5%d8%ad%d9%88%d9%86-%d9%88%d8%b9%d8%b7%d9%8a%d9%81/"]
  ],
  coverSource: "01-home"
});
