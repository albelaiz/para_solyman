import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertAdminSchema, insertSettingsSchema, orderSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";

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

  // Order submission endpoint with Gmail email notification
  app.post("/api/orders/submit", async (req, res) => {
    try {
      // Validate order data
      const orderData = orderSchema.parse(req.body);
      
      // Get admin email from environment variables
      const adminEmail = process.env.ADMIN_EMAIL || "admin@pharmacare.ma";
      const gmailUser = process.env.GMAIL_USER;
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

      // Create order summary for email
      const orderSummary = orderData.items.map(item => 
        `<tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.product.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${Number(item.product.price)} DH</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${Number(item.product.price) * item.quantity} DH</td>
        </tr>`
      ).join('');

      const orderId = `ORDER-${Date.now()}`;
      const orderDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Create HTML email template
      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🛒 Nouvelle Commande PharmaCare Premium</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Commande #${orderId}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
              <h2 style="color: #495057; margin-top: 0;">Informations Client</h2>
              <table style="width: 100%; background: white; border-radius: 4px; padding: 15px;">
                <tr><td style="padding: 5px 0;"><strong>Nom:</strong> ${orderData.customer.name}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Téléphone:</strong> ${orderData.customer.phone}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Email:</strong> ${orderData.customer.email}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Date:</strong> ${orderDate}</td></tr>
              </table>
            </div>

            <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-top: none;">
              <h2 style="color: #495057; margin-top: 0;">Détails de la Commande</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <thead>
                  <tr style="background: #e9ecef;">
                    <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Produit</th>
                    <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: center;">Qté</th>
                    <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: right;">Prix Unit.</th>
                    <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: right;">Sous-total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderSummary}
                </tbody>
              </table>
              
              <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #667eea;">
                <h3 style="margin: 0; color: #667eea; font-size: 24px;">Total: ${orderData.total} DH</h3>
              </div>
            </div>

            <div style="background: #e7f3ff; padding: 15px; border: 1px solid #bee5eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #0c5460; font-size: 14px;">
                <strong>Prochaines étapes:</strong> Contactez le client pour confirmer la commande et organiser la livraison.
              </p>
            </div>
          </body>
        </html>
      `;

      // Try to send email using Gmail SMTP
      if (gmailUser && gmailAppPassword) {
        try {
          // Create transporter using Gmail SMTP
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: gmailUser,
              pass: gmailAppPassword // App-specific password
            }
          });

          // Send email
          await transporter.sendMail({
            from: `"PharmaCare Premium" <${gmailUser}>`,
            to: adminEmail,
            subject: `📦 Nouvelle Commande #${orderId} - ${orderData.customer.name}`,
            html: emailHtml,
            text: `Nouvelle commande de ${orderData.customer.name} (${orderData.customer.phone}) - Total: ${orderData.total} DH`
          });

          console.log('Order email sent successfully to:', adminEmail);
          
          res.json({ 
            success: true, 
            message: "Votre commande a été envoyée avec succès. Nous vous contacterons bientôt pour confirmation.",
            orderId: orderId
          });
        } catch (emailError) {
          console.error('Gmail SMTP error:', emailError);
          
          res.status(500).json({ 
            success: false, 
            message: "Erreur technique lors de l'envoi. Veuillez réessayer ou nous contacter directement.",
            error: "Email service unavailable"
          });
        }
      } else {
        // If no Gmail credentials, log the order and return success (for demo purposes)
        console.log('Order received (no Gmail credentials configured):');
        console.log('Customer:', orderData.customer);
        console.log('Items:', orderData.items);
        console.log('Total:', orderData.total, 'DH');
        console.log('Email HTML that would be sent:');
        console.log(emailHtml);
        
        res.json({ 
          success: true, 
          message: "Votre commande a été reçue avec succès. Nous vous contacterons bientôt pour confirmation.",
          orderId: orderId,
          note: "Configure Gmail credentials for email notifications"
        });
      }

    } catch (error) {
      console.error('Order submission error:', error);
      res.status(400).json({ 
        success: false,
        message: "Erreur lors du traitement de votre commande. Veuillez vérifier vos informations et réessayer.", 
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
