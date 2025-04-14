import { Request, Response } from "express";
import { storage } from "../storage";
import { AIOutfitResponse } from "../../client/src/types";
import { generateOutfitRecommendation, generateOutfitForSpecificOccasion, generateOutfitFromWardrobeItems } from "../util/openai";

export const generateOutfitForWeather = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { weatherCondition, temperature, date } = req.body;
    
    if (!weatherCondition || temperature === undefined || !date) {
      return res.status(400).json({ 
        success: false, 
        error: "Weather condition, temperature, and date are required" 
      });
    }
    
    // Get user clothing items to provide context (if available)
    const userClothingItems = await storage.getClothingItemsByUserId(userId);
    const hasClothingItems = userClothingItems.length > 0;
    
    // Generate outfit using OpenAI
    const outfit = await generateOutfitRecommendation(
      weatherCondition,
      temperature,
      date,
      hasClothingItems ? userClothingItems : undefined
    );
    
    res.status(200).json(outfit);
  } catch (error) {
    console.error("Error generating outfit for weather:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate outfit recommendation" 
    });
  }
};

export const generateOutfitForOccasion = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { occasion, preferences = [] } = req.body;
    
    if (!occasion) {
      return res.status(400).json({ 
        success: false, 
        error: "Occasion is required" 
      });
    }
    
    // Get user clothing items to provide context (if available)
    const userClothingItems = await storage.getClothingItemsByUserId(userId);
    const hasClothingItems = userClothingItems.length > 0;
    
    // Generate outfit using OpenAI
    const outfit = await generateOutfitForSpecificOccasion(
      occasion,
      preferences,
      hasClothingItems ? userClothingItems : undefined
    );
    
    res.status(200).json(outfit);
  } catch (error) {
    console.error("Error generating outfit for occasion:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate outfit for occasion" 
    });
  }
};

export const generateOutfitFromWardrobe = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { clothingItems, occasion, weather } = req.body;
    
    if (!clothingItems || !Array.isArray(clothingItems) || clothingItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "At least one clothing item is required" 
      });
    }
    
    // Get user's actual clothing items by IDs
    const userClothingItems = await storage.getClothingItemsByIds(clothingItems, userId);
    
    if (userClothingItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "No valid clothing items found in your wardrobe" 
      });
    }
    
    // Generate outfit using OpenAI
    const outfit = await generateOutfitFromWardrobeItems(
      userClothingItems,
      occasion,
      weather
    );
    
    res.status(200).json(outfit);
  } catch (error) {
    console.error("Error generating outfit from wardrobe:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate outfit from wardrobe items" 
    });
  }
};
