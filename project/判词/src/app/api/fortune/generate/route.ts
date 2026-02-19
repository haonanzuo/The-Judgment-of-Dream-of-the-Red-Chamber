import { NextRequest, NextResponse } from "next/server";

import * as engine from "@/lib/fortune/engine";
import { checkRateLimit } from "@/lib/fortune/rateLimit";
import { validateFortuneRequest } from "@/lib/fortune/validate";

const getClientIp = (request: NextRequest): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip")?.trim() ?? "anonymous";
};

export async function POST(request: NextRequest) {
  try {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "请求体必须为 JSON。" }, { status: 400 });
    }

    const parsed = validateFortuneRequest(payload);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "输入不合法。",
          details: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试。" },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSec ?? 60)
          }
        }
      );
    }

    const result = engine.generateFortuneSafe(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "系统繁忙，请稍后再试。" }, { status: 500 });
  }
}
