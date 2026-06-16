import dotenv from "dotenv";

dotenv.config({ path: "../../apps/web/.env" });

const { createDb } = await import("../index");
const { seedDromexCategories } = await import("./dromex-categories");
const { seedDromexProducts } = await import("./dromex-products");

const db = createDb();

const categories = await seedDromexCategories(db);
console.log("Seeded Dromex categories:", categories);

const products = await seedDromexProducts(db);
console.log("Seeded Dromex products:", products);
