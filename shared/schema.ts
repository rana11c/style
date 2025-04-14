import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clothingItems = pgTable("clothing_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  colors: text("colors").array().notNull(),
  seasons: text("seasons").array().notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const outfits = pgTable("outfits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  items: integer("items").array().notNull(),
  occasion: text("occasion"),
  weather: text("weather"),
  createdAt: timestamp("created_at").defaultNow(),
  isFavorite: boolean("is_favorite").default(false),
});

export const shoppingItems = pgTable("shopping_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  colors: text("colors").array().notNull(),
  compatibleWith: integer("compatible_with").array(), // Clothing items this matches with
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

export const insertClothingItemSchema = createInsertSchema(clothingItems).pick({
  userId: true,
  name: true,
  category: true,
  colors: true,
  seasons: true,
  imageUrl: true,
});

export const insertOutfitSchema = createInsertSchema(outfits).pick({
  userId: true,
  name: true,
  items: true,
  occasion: true,
  weather: true,
  isFavorite: true,
});

export const insertShoppingItemSchema = createInsertSchema(shoppingItems).pick({
  name: true,
  price: true,
  brand: true,
  category: true,
  imageUrl: true,
  colors: true,
  compatibleWith: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ClothingItem = typeof clothingItems.$inferSelect;
export type InsertClothingItem = z.infer<typeof insertClothingItemSchema>;

export type Outfit = typeof outfits.$inferSelect;
export type InsertOutfit = z.infer<typeof insertOutfitSchema>;

export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type InsertShoppingItem = z.infer<typeof insertShoppingItemSchema>;

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export const weatherSchema = z.object({
  temp: z.number(),
  condition: z.string(),
  icon: z.string(),
});

export type WeatherInfo = z.infer<typeof weatherSchema>;

export const clothingCategorySchema = z.enum([
  "shirts",
  "pants",
  "shoes",
  "jackets",
  "accessories",
  "dresses",
  "skirts",
  "suits",
  "other"
]);

export type ClothingCategory = z.infer<typeof clothingCategorySchema>;

export const seasonSchema = z.enum(["summer", "winter", "fall", "spring"]);
export type Season = z.infer<typeof seasonSchema>;

export const colorSchema = z.enum([
  "black",
  "white",
  "blue",
  "red",
  "green",
  "yellow",
  "brown",
  "gray",
  "purple",
  "orange",
  "pink",
  "other"
]);
export type Color = z.infer<typeof colorSchema>;
