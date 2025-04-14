import { Request, Response } from "express";
import { storage } from "../storage";
import passport from "passport";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export const login = (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(user);
      });
    })(req, res);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = insertUserSchema.parse(req.body);

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Create new user
    const newUser = await storage.createUser(validatedData);

    // Log in the new user
    req.logIn(newUser, (err) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(201).json(newUser);
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out successfully" });
  });
};

export const getCurrentUser = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    return res.status(200).json(req.user);
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
};
