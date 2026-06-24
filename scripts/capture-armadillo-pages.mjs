import { captureSitePages } from "./capture-site-pages.mjs";

await captureSitePages({
  projectSlug: "armadillo-studio",
  port: 9335,
  scope: "Contact, clients, and selected portfolio case studies from Armadillo Studio.",
  pages: [
    ["01-contact", "https://armadillo.studio/contact/"],
    ["02-clients", "https://armadillo.studio/clients/"],
    ["03-dima-jewellery", "https://armadillo.studio/portfolio/dima-jewellery/"],
    ["04-one-point-hr", "https://armadillo.studio/portfolio/one-point-hr-solutions/"],
    ["05-delta-capital", "https://armadillo.studio/portfolio/delta-capital-development/"],
    ["06-asl-al-farroj", "https://armadillo.studio/portfolio/asl-al-farroj-restaurant-ksa/"],
    ["07-cozza-pos", "https://armadillo.studio/portfolio/cozza-pos-system/"]
  ],
  coverSource: "05-delta-capital"
});
