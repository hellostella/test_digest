import { createSecureHeaders } from "next-secure-headers";

const securityHeaders = createSecureHeaders({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "connect-src": ["'self'"],
      "frame-ancestors": ["'self'"],
      "frame-src": ["'self'"]
    }
  },
  referrerPolicy: "no-referrer",
  xFrameOptions: "DENY",
  xContentTypeOptions: "nosniff",
  strictTransportSecurity: "max-age=63072000; includeSubDomains; preload"
});

const nextConfig = {
  experimental: {
    serverActions: true
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
