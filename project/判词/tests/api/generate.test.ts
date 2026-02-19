import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as engine from "@/lib/fortune/engine";
import { clearRateLimitStore } from "@/lib/fortune/rateLimit";
import { POST } from "@/app/api/fortune/generate/route";

afterEach(() => {
  clearRateLimitStore();
  vi.restoreAllMocks();
});

describe("POST /api/fortune/generate", () => {
  it("200: 返回判词结果", async () => {
    const request = new NextRequest("http://localhost/api/fortune/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "1.1.1.1"
      },
      body: JSON.stringify({
        name: "林黛玉",
        birthplace: "苏州",
        birthDate: "1998-03-02"
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.poem).toHaveLength(4);
    expect(json.interpretation).toHaveProperty("disposition");
  });

  it("400: 非法输入", async () => {
    const request = new NextRequest("http://localhost/api/fortune/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "2.2.2.2"
      },
      body: JSON.stringify({
        name: "",
        birthplace: "A",
        birthDate: "2999-01-01"
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("输入不合法。");
  });

  it("429: 超过限流", async () => {
    const requestFactory = () =>
      new NextRequest("http://localhost/api/fortune/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "3.3.3.3"
        },
        body: JSON.stringify({
          name: "贾宝玉",
          birthplace: "南京",
          birthDate: "2000-10-02"
        })
      });

    for (let i = 0; i < 20; i += 1) {
      const okRes = await POST(requestFactory());
      expect(okRes.status).toBe(200);
    }

    const blocked = await POST(requestFactory());
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
  });

  it("500: 未预期异常", async () => {
    vi.spyOn(engine, "generateFortuneSafe").mockImplementation(() => {
      throw new Error("boom");
    });

    const request = new NextRequest("http://localhost/api/fortune/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "4.4.4.4"
      },
      body: JSON.stringify({
        name: "探春",
        birthplace: "扬州",
        birthDate: "1996-02-11"
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toContain("系统繁忙");
  });
});
