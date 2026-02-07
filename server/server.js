import "dotenv/config";
import express from "express";
import cors from "cors";

// Import configurations
import connectDB from "./config/db.js";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import upvoteRoutes from "./routes/upvoteRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import geocodeRoutes from "./routes/geocodeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import satelliteRoutes from "./routes/satellite.js";
import satelliteAuditRoutes from "./routes/satelliteAudit.js";

// Import error handlers
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        // Local development
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        // Production URLs - add both spelling variants
        "https://nagar-sathi.vercel.app",
        "https://nagar-saathi.vercel.app",
        // Environment variable for custom domain
        process.env.CLIENT_URL,
      ].filter(Boolean);

      // Log origin for debugging CORS issues in production
      if (process.env.NODE_ENV !== "development") {
        console.log("[CORS] Request from origin:", origin, "| Allowed:", allowedOrigins.includes(origin));
      }

      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (
        // Allow localhost with any port in development
        origin.startsWith("http://localhost:") ||
        origin.startsWith("https://localhost:")
      ) {
        callback(null, true);
      } else if (
        // Allow Vercel preview deployments (*.vercel.app)
        origin.endsWith(".vercel.app") &&
        (origin.includes("nagar-sathi") || origin.includes("nagar-saathi"))
      ) {
        console.log("[CORS] Allowing Vercel preview deployment:", origin);
        callback(null, true);
      } else {
        console.error("[CORS] Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    // Explicitly allow these methods for preflight
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    // Allow these headers in requests
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    // Expose these headers to the client
    exposedHeaders: ["Content-Length", "X-Request-Id"],
    // Cache preflight response for 24 hours
    maxAge: 86400,
  })
);

// Explicit OPTIONS handler for preflight requests (required for Vercel serverless)
app.options("*", (req, res) => {
  res.sendStatus(204);
});

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NagarSathi API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api", commentRoutes); // Comments and upvotes are nested under /api/issues/:issueId
app.use("/api/issues", upvoteRoutes);
app.use("/api/issues", reportRoutes); // Reports are nested under /api/issues/:issueId/report
app.use("/api/reports", reportRoutes); // Also mount at /api/reports for /my-reports
app.use("/api/admin", adminRoutes);
app.use("/api/geocode", geocodeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/satellite", satelliteRoutes);
app.use("/api/satellite-audit", satelliteAuditRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏛️  NagarSathi API Server                                ║
║                                                            ║
║   Environment: ${process.env.NODE_ENV?.padEnd(42)}║
║   Port: ${PORT.toString().padEnd(50)}║
║   API URL: http://localhost:${PORT}/api                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("[Unhandled Rejection]", {
    message: err.message,
    name: err.name,
    httpCode: err.http_code,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  // Only crash on critical errors, not on operational errors like image uploads
  if (!err.http_code && !err.storageErrors) {
    // Close server & exit process for truly unrecoverable errors
    server.close(() => process.exit(1));
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("[Uncaught Exception]", {
    message: err.message,
    name: err.name,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

export default app;
