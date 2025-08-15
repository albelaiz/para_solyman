# Overview

This is an ultra-premium Moroccan parafarmacia website called "PharmaCare Premium" built with luxury design and sophisticated features. The application includes a modern React frontend with premium animations, Express.js backend, and sophisticated DH currency integration. Customers can browse pharmaceutical products, search with live suggestions, and place orders with email notifications sent to admin. Features a hidden admin panel for product management and analytics.

## Key Features
- Ultra-premium luxury design with Moroccan aesthetic
- DH currency formatting throughout
- Hidden admin access at `/admin-secret-2024` (not visible to regular visitors)
- Email notification system for order processing (Gmail SMTP)
- Live search with product suggestions
- Advanced category filtering
- Smooth animations and micro-interactions
- Responsive design optimized for all devices

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with two main routes (public store and admin panel)
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API structure with dedicated routes for products, admin, and settings
- **File Handling**: Multer middleware for image upload processing with file type validation
- **Data Layer**: Abstracted storage interface (IStorage) with in-memory implementation for development
- **Request Logging**: Custom middleware for API request/response logging and performance monitoring
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

## Database Schema Design
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe query building
- **Tables**: 
  - Products (id, name, description, price, category, image, stock, rating)
  - Admins (id, username, password) 
  - Settings (id, whatsapp_number, currency, whatsapp_message)
- **Validation**: Zod schemas for runtime type checking and API validation
- **Migrations**: Drizzle Kit for database schema migrations and version control

## Authentication & Security
- **Admin Auth**: Simple username/password authentication with session management
- **File Security**: Image upload restrictions (5MB limit, image types only)
- **Input Validation**: Comprehensive validation on both client and server sides
- **CORS**: Configured for cross-origin requests in development

## UI/UX Design Patterns
- **Component Structure**: Atomic design with reusable UI components
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Loading States**: Skeleton loaders and loading indicators for better UX
- **Error Boundaries**: Toast notifications for user feedback
- **Accessibility**: Proper ARIA labels and keyboard navigation support

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for Neon cloud database
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and data fetching
- **express**: Web application framework for Node.js backend

## UI and Styling
- **@radix-ui/**: Complete set of accessible UI primitives (dialog, dropdown, etc.)
- **tailwindcss**: Utility-first CSS framework
- **framer-motion**: Animation library for React components
- **class-variance-authority**: Utility for creating variant-based component APIs

## Form Handling and Validation
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

## File Upload and Processing
- **multer**: Middleware for handling multipart/form-data for file uploads
- **@types/multer**: TypeScript definitions for Multer

## Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution engine for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit

## Utilities
- **date-fns**: Modern JavaScript date utility library
- **clsx**: Utility for constructing className strings conditionally
- **cmdk**: Command palette component for search functionality
- **nanoid**: URL-safe unique string ID generator

## Database and Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **pg**: PostgreSQL client for Node.js (implied by connect-pg-simple)