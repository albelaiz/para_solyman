import { type Product, type InsertProduct, type Admin, type InsertAdmin, type Settings, type InsertSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  
  // Admins
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private admins: Map<string, Admin>;
  private settings: Settings | undefined;

  constructor() {
    this.products = new Map();
    this.admins = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Create default admin
    const adminId = randomUUID();
    const defaultAdmin: Admin = {
      id: adminId,
      username: "admin",
      password: "admin123", // In production, this should be hashed
    };
    this.admins.set(adminId, defaultAdmin);

    // Create default settings
    this.settings = {
      id: randomUUID(),
      whatsappNumber: "+212612345678",
      currency: "DH",
      whatsappMessage: "Bonjour, je souhaite commander [PRODUCT] pour [PRICE] DH",
    };

    // Create sample products
    const sampleProducts: Omit<Product, 'id'>[] = [
      {
        name: "Panadol Extra",
        description: "Antidouleur et anti-fièvre efficace, 500mg + 65mg caféine",
        price: "45.00",
        category: "medicaments",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: 1,
        rating: "4.8",
        reviewCount: 24,
      },
      {
        name: "Crème Anti-Âge Vichy",
        description: "Soin anti-âge hydratant, réduction des rides visibles",
        price: "320.00",
        category: "cosmetiques",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: 1,
        rating: "4.5",
        reviewCount: 18,
      },
      {
        name: "Vitamines Multi Bio",
        description: "Complexe vitaminique bio, 100% naturel et certifié",
        price: "180.00",
        category: "bio",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: 1,
        rating: "5.0",
        reviewCount: 32,
      },
      {
        name: "Thermomètre Digital",
        description: "Thermomètre digital précis, mesure rapide en 30 secondes",
        price: "85.00",
        category: "medicaments",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: 1,
        rating: "4.2",
        reviewCount: 12,
      },
      {
        name: "Crème Solaire SPF 50+",
        description: "Protection solaire très haute, résistante à l'eau",
        price: "125.00",
        category: "cosmetiques",
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: 1,
        rating: "4.9",
        reviewCount: 41,
      },
      {
        name: "Tisanes Détox Bio",
        description: "Mélange de plantes bio pour détox naturelle",
        price: "65.00",
        category: "bio",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        inStock: 1,
        rating: "4.3",
        reviewCount: 28,
      },
    ];

    sampleProducts.forEach(product => {
      const id = randomUUID();
      this.products.set(id, { ...product, id });
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id,
      inStock: insertProduct.inStock ?? 1,
      rating: insertProduct.rating ?? "5.0",
      reviewCount: insertProduct.reviewCount ?? 0
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    return products.filter(product => product.category === category);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(newSettings: InsertSettings): Promise<Settings> {
    if (this.settings) {
      this.settings = { ...this.settings, ...newSettings };
    } else {
      this.settings = { 
        ...newSettings, 
        id: randomUUID(),
        currency: newSettings.currency ?? "DH"
      };
    }
    return this.settings;
  }
}

export const storage = new MemStorage();
