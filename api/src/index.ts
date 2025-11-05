import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
import authMiddleware from "./middleware/auth.middleware";
import lessonAccessMiddleware from "./middleware/lesson-access.middleware";
import { publicRoutes } from "./config/routes.config";
import type { User, FreeImageResponse } from "./types";
import corsOptions from "./config/cors.config";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
// Use 127.0.0.1 instead of localhost to avoid IPv6 issues
const POSTGREST_URL = process.env.POSTGREST_URL || "http://127.0.0.1:3001";

// Security middleware
app.use(helmet());
// CORS for localhost and zlearning.vercel.app
app.use(cors(corsOptions));
// Preflight requests
app.options("*", cors(corsOptions));
// Parse JSON for upload endpoint
app.use(express.json({ limit: "10mb" }));

// Health check endpoint (bypass auth)
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Learning Platform Auth Proxy" });
});

// Image upload endpoint (proxy to FreeImage.host to avoid CORS) - Admin only
app.post("/api/upload-image", async (req, res) => {
  try {
    // Check Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.substring(7);

    // Verify token - call PostgREST directly
    const verifyResponse = await fetch(`${POSTGREST_URL}/rpc/verify_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_token: token }),
    });

    if (!verifyResponse.ok) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    const users = (await verifyResponse.json()) as User[];
    const user = users?.[0];

    if (!user || user.user_role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Forbidden - Admin access required",
      });
    }

    const { base64Image } = req.body;

    if (!base64Image) {
      return res
        .status(400)
        .json({ success: false, error: "No image provided" });
    }

    const formData = new URLSearchParams();
    formData.append("key", "6d207e02198a847aa98d0a2a901485a5");
    formData.append("action", "upload");
    formData.append("source", base64Image);
    formData.append("format", "json");

    const response = await fetch("https://freeimage.host/api/1/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = (await response.json()) as FreeImageResponse;

    if (data.status_code === 200 && data.image) {
      res.json({
        success: true,
        url: data.image.url,
        display_url: data.image.display_url,
      });
    } else {
      res.status(400).json({
        success: false,
        error: data.error?.message || "Upload failed",
      });
    }
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Public endpoints - Handle directly instead of proxying to avoid ECONNRESET
app.post("/rpc/verify_login", async (req, res) => {
  try {
    const response = await fetch(`${POSTGREST_URL}/rpc/verify_login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("[PUBLIC] Error calling PostgREST:", error);
    res.status(502).json({
      error: "PostgREST connection error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/rpc/register_user", async (req, res) => {
  try {
    const response = await fetch(`${POSTGREST_URL}/rpc/register_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("[PUBLIC] Error calling PostgREST:", error);
    res.status(502).json({
      error: "PostgREST connection error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Other public routes still use proxy
publicRoutes
  .filter((route) => !route.startsWith("/rpc/"))
  .forEach((route) => {
    app.use(
      route,
      createProxyMiddleware({
        target: POSTGREST_URL,
        changeOrigin: true,
        logLevel: "debug",
        proxyTimeout: 30000,
        timeout: 30000,
      })
    );
  });

// Protected RPC endpoints - Handle directly instead of proxying
app.post("/rpc/get_lesson_with_content", authMiddleware, async (req, res) => {
  try {
    const response = await fetch(
      `${POSTGREST_URL}/rpc/get_lesson_with_content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("[PROTECTED] Error calling PostgREST:", error);
    res.status(502).json({
      error: "PostgREST connection error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post(
  "/rpc/get_all_lessons_with_content",
  authMiddleware,
  async (req, res) => {
    try {
      const response = await fetch(
        `${POSTGREST_URL}/rpc/get_all_lessons_with_content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        }
      );

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("[PROTECTED] Error calling PostgREST:", error);
      res.status(502).json({
        error: "PostgREST connection error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

app.post(
  "/rpc/create_lesson_with_content",
  authMiddleware,
  async (req, res) => {
    try {
      const response = await fetch(
        `${POSTGREST_URL}/rpc/create_lesson_with_content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        }
      );

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("[PROTECTED] Error calling PostgREST:", error);
      res.status(502).json({
        error: "PostgREST connection error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

app.post(
  "/rpc/update_lesson_with_content",
  authMiddleware,
  async (req, res) => {
    try {
      const response = await fetch(
        `${POSTGREST_URL}/rpc/update_lesson_with_content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        }
      );

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("[PROTECTED] Error calling PostgREST:", error);
      res.status(502).json({
        error: "PostgREST connection error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Protected endpoints (require authentication and RBAC)
app.use(
  "*",
  authMiddleware,
  lessonAccessMiddleware,
  createProxyMiddleware({
    target: POSTGREST_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req: express.Request) => {
      const user = req.user;
      console.log(
        `[PROTECTED] ${req.method} ${req.path} - User: ${user?.email} (${user?.role})`
      );

      // PostgREST requires special header for RPC calls
      if (req.path.startsWith("/rpc/")) {
        proxyReq.setHeader("Prefer", "params=single-object");
      }

      // Remove Authorization header - don't send tokens to PostgREST
      proxyReq.removeHeader("Authorization");

      // Add user context to headers for PostgREST instead
      if (user) {
        proxyReq.setHeader("X-User-Id", user.user_id);
        proxyReq.setHeader("X-User-Email", user.email);
        proxyReq.setHeader("X-User-Role", user.role);
      }
    },
    onError: (err, req, res) => {
      console.error("[PROTECTED] Proxy Error:", err.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: "PostgREST connection error",
          message:
            "Cannot connect to PostgREST. Make sure it is running on port 3001.",
        });
      }
    },
  })
);

app.listen(PORT, () => {
  console.log(`🚀 Auth Proxy Server running on port ${PORT}`);
  console.log(`📡 Proxying to PostgREST at ${POSTGREST_URL}`);
  console.log(`🔒 All requests require authentication except public routes`);
});
