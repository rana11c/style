import { AIOutfitResponse } from "../types";

// This is a client-side wrapper for OpenAI API calls that will be made on the server
export const generateOutfitForWeather = async (
  weatherCondition: string,
  temperature: number,
  date: string
): Promise<AIOutfitResponse> => {
  try {
    const response = await fetch("/api/ai/outfit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weatherCondition,
        temperature,
        date,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate outfit");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating outfit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

export const generateOutfitForOccasion = async (
  occasion: string,
  preferences: string[] = []
): Promise<AIOutfitResponse> => {
  try {
    const response = await fetch("/api/ai/outfit/occasion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        occasion,
        preferences,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate outfit");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating outfit for occasion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

export const generateOutfitFromWardrobe = async (
  clothingItems: string[],
  occasion?: string,
  weather?: { condition: string; temperature: number }
): Promise<AIOutfitResponse> => {
  try {
    const response = await fetch("/api/ai/outfit/wardrobe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clothingItems,
        occasion,
        weather,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate outfit from wardrobe");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating outfit from wardrobe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};
