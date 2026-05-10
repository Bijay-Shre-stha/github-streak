import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  getClientIP,
  clearRateLimitStore,
  cleanupRateLimitStore,
} from "@/lib/rateLimit";

describe("rate limiting utilities", () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    clearRateLimitStore();
    vi.clearAllTimers();
  });

  describe("checkRateLimit", () => {
    it("should allow first request", () => {
      const result = checkRateLimit("192.168.1.1");
      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBeLessThan(60);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it("should increment count on subsequent requests", () => {
      const identifier = "192.168.1.1";

      // First request
      const result1 = checkRateLimit(identifier);
      expect(result1.remaining).toBe(59);

      // Second request
      const result2 = checkRateLimit(identifier);
      expect(result2.remaining).toBe(58);

      // Third request
      const result3 = checkRateLimit(identifier);
      expect(result3.remaining).toBe(57);
    });

    it("should not limit requests under threshold", () => {
      const identifier = "192.168.1.1";

      for (let i = 0; i < 50; i++) {
        const result = checkRateLimit(identifier);
        expect(result.isLimited).toBe(false);
      }
    });

    it("should limit requests when threshold exceeded", () => {
      const identifier = "192.168.1.1";

      // Make 60 allowed requests
      for (let i = 0; i < 60; i++) {
        checkRateLimit(identifier);
      }

      // 61st request should be limited
      const result = checkRateLimit(identifier);
      expect(result.isLimited).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it("should isolate limits per identifier", () => {
      const ip1 = "192.168.1.1";
      const ip2 = "192.168.1.2";

      // Make requests from ip1
      for (let i = 0; i < 30; i++) {
        checkRateLimit(ip1);
      }

      // ip2 should not be affected
      const result = checkRateLimit(ip2);
      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(59);
    });

    it("should return correct resetTime", () => {
      const identifier = "192.168.1.1";
      const beforeTime = Date.now();
      const result = checkRateLimit(identifier);
      const afterTime = Date.now();

      // resetTime should be approximately 60 seconds from now (with tolerance)
      const expectedMinTime = beforeTime + 60000 - 100; // 100ms tolerance before
      const expectedMaxTime = afterTime + 60000 + 100; // 100ms tolerance after

      expect(result.resetTime).toBeGreaterThanOrEqual(expectedMinTime);
      expect(result.resetTime).toBeLessThanOrEqual(expectedMaxTime);
    });
  });

  describe("getClientIP", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "203.0.113.1, 198.51.100.1",
        },
      });

      const ip = getClientIP(request);
      expect(ip).toBe("203.0.113.1");
    });

    it("should extract IP from x-real-ip header", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-real-ip": "203.0.113.1",
        },
      });

      const ip = getClientIP(request);
      expect(ip).toBe("203.0.113.1");
    });

    it("should extract IP from cf-connecting-ip header (CloudFlare)", () => {
      const request = new Request("http://localhost", {
        headers: {
          "cf-connecting-ip": "203.0.113.1",
        },
      });

      const ip = getClientIP(request);
      expect(ip).toBe("203.0.113.1");
    });

    it("should prioritize x-forwarded-for over others", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "203.0.113.1",
          "x-real-ip": "198.51.100.1",
          "cf-connecting-ip": "192.0.2.1",
        },
      });

      const ip = getClientIP(request);
      expect(ip).toBe("203.0.113.1");
    });

    it("should return unknown when no proxy headers present", () => {
      const request = new Request("http://localhost", {
        headers: {},
      });

      const ip = getClientIP(request);
      expect(ip).toBe("unknown");
    });

    it("should handle x-forwarded-for with leading/trailing spaces", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "  203.0.113.1  , 198.51.100.1",
        },
      });

      const ip = getClientIP(request);
      expect(ip).toBe("203.0.113.1");
    });
  });

  describe("cleanupRateLimitStore", () => {
    it("should not throw errors", () => {
      expect(() => cleanupRateLimitStore()).not.toThrow();
    });

    it("should complete without side effects on empty store", () => {
      cleanupRateLimitStore();
      // Should not throw and not affect subsequent rate limiting
      const result = checkRateLimit("192.168.1.1");
      expect(result.isLimited).toBe(false);
    });
  });
});
