import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertAdminSchema, insertSettingsSchema, orderSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import twilio from "twilio";

// Extend Express Request type to include session
declare global {
  namespace Express {
    interface Request {
      session?: any;
    }
  }
}

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else if (category && category !== 'all') {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", upload.single('image'), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      if (req.file) {
        productData.image = `/uploads/${req.file.filename}`;
      }
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/products/:id", upload.single('image'), async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      
      if (req.file) {
        updates.image = `/uploads/${req.file.filename}`;
      }
      
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session (in production, use proper session management)
      req.session = req.session || {};
      req.session.adminId = admin.id;
      
      res.json({ message: "Login successful", admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session = null;
    res.json({ message: "Logout successful" });
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settingsData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Order submission endpoint with WhatsApp Business API
  app.post("/api/orders/submit", async (req, res) => {
    try {
      // Validate order data
      const orderData = orderSchema.parse(req.body);
      
      // Get WhatsApp settings
      const settings = await storage.getSettings();
      if (!settings) {
        return res.status(500).json({ message: "WhatsApp settings not configured" });
      }

      // Create order summary message
      const orderSummary = orderData.items.map(item => 
        `${item.product.name} x${item.quantity} - ${Number(item.product.price) * item.quantity} DH`
      ).join('\n');

      const message = `🛒 NOUVELLE COMMANDE PharmaCare Premium

👤 Client: ${orderData.customer.name}
📞 Téléphone: ${orderData.customer.phone}
📧 Email: ${orderData.customer.email}

📦 PRODUITS:
${orderSummary}

💰 TOTAL: ${orderData.total} DH

Merci de confirmer cette commande.`;

      // Send WhatsApp message using Twilio (if credentials are provided)
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && twilioPhoneNumber) {
        try {
          const client = twilio(accountSid, authToken);
          
          await client.messages.create({
            from: `whatsapp:${twilioPhoneNumber}`,
            to: `whatsapp:${settings.whatsappNumber}`,
            body: message
          });

          res.json({ 
            success: true, 
            message: "Commande envoyée avec succès via WhatsApp Business API",
            orderId: `ORDER-${Date.now()}`
          });
        } catch (twilioError) {
          console.error('Twilio error:', twilioError);
          // Fallback to regular WhatsApp web URL if Twilio fails
          const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
          res.json({ 
            success: true, 
            message: "Commande préparée. Redirection vers WhatsApp.",
            whatsappUrl,
            orderId: `ORDER-${Date.now()}`
          });
        }
      } else {
        // Fallback to WhatsApp web URL if no Twilio credentials
        const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
        res.json({ 
          success: true, 
          message: "Commande préparée. Redirection vers WhatsApp.",
          whatsappUrl,
          orderId: `ORDER-${Date.now()}`
        });
      }

    } catch (error) {
      console.error('Order submission error:', error);
      res.status(400).json({ 
        message: "Erreur lors de l'envoi de la commande", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Analytics endpoint
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const categories = Array.from(new Set(products.map(p => p.category)));
      
      const analytics = {
        totalProducts: products.length,
        totalCategories: categories.length,
        monthlyOrders: Math.floor(Math.random() * 100) + 50, // Mock data
        monthlyViews: Math.floor(Math.random() * 3000) + 1000, // Mock data
        categoryBreakdown: Array.from(categories).map(cat => ({
          category: cat,
          count: products.filter(p => p.category === cat).length
        }))
      };
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
