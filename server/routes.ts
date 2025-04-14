import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage as dataStorage } from "./storage";
import multer from "multer";
import path from "path";
import session from "express-session";
import memorystore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

// Controllers
import { 
  login, 
  register, 
  logout, 
  getCurrentUser 
} from "./controllers/authController";
import { 
  getWeatherForecast 
} from "./controllers/weatherController";
import { 
  getClothingItems, 
  addClothingItem, 
  updateClothingItem, 
  deleteClothingItem 
} from "./controllers/wardrobeController";
import { 
  generateOutfitForWeather, 
  generateOutfitForOccasion, 
  generateOutfitFromWardrobe 
} from "./controllers/aiController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const multerStorage = multer.memoryStorage();
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: function (req, file, callback) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExtensions.includes(ext)) {
        callback(null, true);
      } else {
        callback(new Error('Only .jpg, .jpeg and .png files are allowed!'));
      }
    }
  });

  // Setup session store
  const MemoryStore = memorystore(session);
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new MemoryStore({
        checkPeriod: 86400000, // 24 hours
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "styler-app-secret",
    })
  );

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await dataStorage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        if (user.password !== password) { // In real app, use proper password hashing
          return done(null, false, { message: "Incorrect username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await dataStorage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // AUTH ROUTES
  app.post('/api/auth/login', login);
  app.post('/api/auth/register', register);
  app.post('/api/auth/logout', logout);
  app.get('/api/auth/me', getCurrentUser);

  // WEATHER ROUTES
  app.get('/api/weather', getWeatherForecast);

  // WARDROBE ROUTES
  app.get('/api/wardrobe/clothing', requireAuth, getClothingItems);
  app.post('/api/wardrobe/clothing', requireAuth, upload.single('image'), addClothingItem);
  app.put('/api/wardrobe/clothing/:id', requireAuth, upload.single('image'), updateClothingItem);
  app.delete('/api/wardrobe/clothing/:id', requireAuth, deleteClothingItem);

  // AI ROUTES
  app.post('/api/ai/outfit', requireAuth, generateOutfitForWeather);
  app.post('/api/ai/outfit/occasion', requireAuth, generateOutfitForOccasion);
  app.post('/api/ai/outfit/wardrobe', requireAuth, generateOutfitFromWardrobe);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
