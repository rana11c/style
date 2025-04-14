import { Request, Response } from "express";
import { storage } from "../storage";
import { insertClothingItemSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fs from "fs";
import path from "path";
import { promisify } from "util";

// Helper function to save image to disk
const saveImageToDisk = async (imageBuffer: Buffer, filename: string): Promise<string> => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const filePath = path.join(uploadsDir, filename);
  const writeFile = promisify(fs.writeFile);
  await writeFile(filePath, imageBuffer);
  
  // Return the path that will be stored in the database
  return `/uploads/${filename}`;
};

export const getClothingItems = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const clothingItems = await storage.getClothingItemsByUserId(userId);
    res.status(200).json(clothingItems);
  } catch (error) {
    console.error("Error fetching clothing items:", error);
    res.status(500).json({ message: "Failed to fetch clothing items" });
  }
};

export const addClothingItem = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    // Process form data
    const { name, category } = req.body;
    const colors = Array.isArray(req.body.colors) ? req.body.colors : [req.body.colors];
    const seasons = Array.isArray(req.body.seasons) ? req.body.seasons : [req.body.seasons];
    
    // Handle image upload if present
    let imageUrl: string | undefined;
    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      imageUrl = await saveImageToDisk(req.file.buffer, filename);
    }
    
    // Prepare data for validation
    const clothingItemData = {
      userId,
      name,
      category,
      colors,
      seasons,
      imageUrl
    };
    
    // Validate data
    const validatedData = insertClothingItemSchema.parse(clothingItemData);
    
    // Store in database
    const newClothingItem = await storage.createClothingItem(validatedData);
    
    res.status(201).json(newClothingItem);
  } catch (error) {
    console.error("Error adding clothing item:", error);
    
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    res.status(500).json({ message: "Failed to add clothing item" });
  }
};

export const updateClothingItem = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const itemId = parseInt(req.params.id);
    
    // Verify item exists and belongs to user
    const existingItem = await storage.getClothingItemById(itemId);
    if (!existingItem) {
      return res.status(404).json({ message: "Clothing item not found" });
    }
    
    if (existingItem.userId !== userId) {
      return res.status(403).json({ message: "You don't have permission to update this item" });
    }
    
    // Process form data
    const { name, category } = req.body;
    const colors = Array.isArray(req.body.colors) ? req.body.colors : [req.body.colors];
    const seasons = Array.isArray(req.body.seasons) ? req.body.seasons : [req.body.seasons];
    
    // Handle image upload if present
    let imageUrl = existingItem.imageUrl;
    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      imageUrl = await saveImageToDisk(req.file.buffer, filename);
      
      // Delete old image if it exists
      if (existingItem.imageUrl) {
        try {
          const oldImagePath = path.join(process.cwd(), existingItem.imageUrl.replace("/uploads/", "uploads/"));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
    }
    
    // Prepare data for validation
    const clothingItemData = {
      userId,
      name,
      category,
      colors,
      seasons,
      imageUrl
    };
    
    // Validate data
    const validatedData = insertClothingItemSchema.parse(clothingItemData);
    
    // Update in database
    const updatedItem = await storage.updateClothingItem(itemId, validatedData);
    
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating clothing item:", error);
    
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    res.status(500).json({ message: "Failed to update clothing item" });
  }
};

export const deleteClothingItem = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const itemId = parseInt(req.params.id);
    
    // Verify item exists and belongs to user
    const existingItem = await storage.getClothingItemById(itemId);
    if (!existingItem) {
      return res.status(404).json({ message: "Clothing item not found" });
    }
    
    if (existingItem.userId !== userId) {
      return res.status(403).json({ message: "You don't have permission to delete this item" });
    }
    
    // Delete image file if it exists
    if (existingItem.imageUrl) {
      try {
        const imagePath = path.join(process.cwd(), existingItem.imageUrl.replace("/uploads/", "uploads/"));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error("Error deleting image file:", err);
      }
    }
    
    // Delete from database
    await storage.deleteClothingItem(itemId);
    
    res.status(200).json({ message: "Clothing item deleted successfully" });
  } catch (error) {
    console.error("Error deleting clothing item:", error);
    res.status(500).json({ message: "Failed to delete clothing item" });
  }
};
