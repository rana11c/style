import { 
  users, 
  clothingItems, 
  outfits, 
  shoppingItems, 
  type User, 
  type InsertUser,
  type ClothingItem,
  type InsertClothingItem,
  type Outfit,
  type InsertOutfit,
  type ShoppingItem,
  type InsertShoppingItem
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Clothing Item methods
  getClothingItemsByUserId(userId: number): Promise<ClothingItem[]>;
  getClothingItemById(id: number): Promise<ClothingItem | undefined>;
  getClothingItemsByIds(ids: number[], userId: number): Promise<ClothingItem[]>;
  createClothingItem(item: InsertClothingItem): Promise<ClothingItem>;
  updateClothingItem(id: number, item: InsertClothingItem): Promise<ClothingItem>;
  deleteClothingItem(id: number): Promise<void>;
  
  // Outfit methods
  getOutfitsByUserId(userId: number): Promise<Outfit[]>;
  getOutfitById(id: number): Promise<Outfit | undefined>;
  createOutfit(outfit: InsertOutfit): Promise<Outfit>;
  updateOutfit(id: number, outfit: InsertOutfit): Promise<Outfit>;
  deleteOutfit(id: number): Promise<void>;
  
  // Shopping Item methods
  getShoppingItems(): Promise<ShoppingItem[]>;
  getShoppingItemById(id: number): Promise<ShoppingItem | undefined>;
  getShoppingItemsCompatibleWith(clothingItemId: number): Promise<ShoppingItem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clothingItems: Map<number, ClothingItem>;
  private outfits: Map<number, Outfit>;
  private shoppingItems: Map<number, ShoppingItem>;
  currentUserId: number;
  currentClothingItemId: number;
  currentOutfitId: number;
  currentShoppingItemId: number;

  constructor() {
    this.users = new Map();
    this.clothingItems = new Map();
    this.outfits = new Map();
    this.shoppingItems = new Map();
    this.currentUserId = 1;
    this.currentClothingItemId = 1;
    this.currentOutfitId = 1;
    this.currentShoppingItemId = 1;
    
    // Add some sample shopping items
    this.addSampleShoppingItems();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Clothing Item methods
  async getClothingItemsByUserId(userId: number): Promise<ClothingItem[]> {
    return Array.from(this.clothingItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async getClothingItemById(id: number): Promise<ClothingItem | undefined> {
    return this.clothingItems.get(id);
  }
  
  async getClothingItemsByIds(ids: number[], userId: number): Promise<ClothingItem[]> {
    return Array.from(this.clothingItems.values()).filter(
      (item) => ids.includes(item.id) && item.userId === userId
    );
  }
  
  async createClothingItem(insertItem: InsertClothingItem): Promise<ClothingItem> {
    const id = this.currentClothingItemId++;
    const now = new Date();
    const item: ClothingItem = { ...insertItem, id, createdAt: now };
    this.clothingItems.set(id, item);
    return item;
  }
  
  async updateClothingItem(id: number, updateItem: InsertClothingItem): Promise<ClothingItem> {
    const existingItem = this.clothingItems.get(id);
    if (!existingItem) {
      throw new Error("Clothing item not found");
    }
    
    const updatedItem: ClothingItem = { 
      ...existingItem, 
      ...updateItem, 
      id
    };
    
    this.clothingItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteClothingItem(id: number): Promise<void> {
    if (!this.clothingItems.has(id)) {
      throw new Error("Clothing item not found");
    }
    
    this.clothingItems.delete(id);
    
    // Also remove this item from any outfits that reference it
    for (const outfit of this.outfits.values()) {
      if (outfit.items.includes(id)) {
        const updatedItems = outfit.items.filter(itemId => itemId !== id);
        this.outfits.set(outfit.id, { ...outfit, items: updatedItems });
      }
    }
  }
  
  // Outfit methods
  async getOutfitsByUserId(userId: number): Promise<Outfit[]> {
    return Array.from(this.outfits.values()).filter(
      (outfit) => outfit.userId === userId
    );
  }
  
  async getOutfitById(id: number): Promise<Outfit | undefined> {
    return this.outfits.get(id);
  }
  
  async createOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const id = this.currentOutfitId++;
    const now = new Date();
    const outfit: Outfit = { ...insertOutfit, id, createdAt: now };
    this.outfits.set(id, outfit);
    return outfit;
  }
  
  async updateOutfit(id: number, updateOutfit: InsertOutfit): Promise<Outfit> {
    const existingOutfit = this.outfits.get(id);
    if (!existingOutfit) {
      throw new Error("Outfit not found");
    }
    
    const updatedOutfit: Outfit = { 
      ...existingOutfit, 
      ...updateOutfit, 
      id
    };
    
    this.outfits.set(id, updatedOutfit);
    return updatedOutfit;
  }
  
  async deleteOutfit(id: number): Promise<void> {
    if (!this.outfits.has(id)) {
      throw new Error("Outfit not found");
    }
    
    this.outfits.delete(id);
  }
  
  // Shopping Item methods
  async getShoppingItems(): Promise<ShoppingItem[]> {
    return Array.from(this.shoppingItems.values());
  }
  
  async getShoppingItemById(id: number): Promise<ShoppingItem | undefined> {
    return this.shoppingItems.get(id);
  }
  
  async getShoppingItemsCompatibleWith(clothingItemId: number): Promise<ShoppingItem[]> {
    return Array.from(this.shoppingItems.values()).filter(item => 
      item.compatibleWith && item.compatibleWith.includes(clothingItemId)
    );
  }
  
  // Helper method to add sample shopping items
  private addSampleShoppingItems(): void {
    const shoppingItems: Omit<ShoppingItem, 'id'>[] = [
      {
        name: "قميص كلاسيكي أزرق",
        price: 299,
        brand: "ركة الأناقة",
        category: "shirts",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60",
        colors: ["blue"],
        compatibleWith: [1, 3, 5],
      },
      {
        name: "بنطال كلاسيكي بيج",
        price: 349,
        brand: "ركة ستايل",
        category: "pants",
        imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60",
        colors: ["beige"],
        compatibleWith: [2, 4],
      },
      {
        name: "جاكيت أنيق بني",
        price: 599,
        brand: "ركة لوكس",
        category: "jackets",
        imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&auto=format&fit=crop&q=60",
        colors: ["brown"],
        compatibleWith: [1, 2],
      },
      {
        name: "حزام جلد كلاسيكي",
        price: 149,
        brand: "ركة كلاسيك",
        category: "accessories",
        imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500&auto=format&fit=crop&q=60",
        colors: ["black"],
        compatibleWith: [1, 2, 3],
      },
    ];
    
    for (const item of shoppingItems) {
      const id = this.currentShoppingItemId++;
      this.shoppingItems.set(id, { ...item, id });
    }
  }
}

export const storage = new MemStorage();
