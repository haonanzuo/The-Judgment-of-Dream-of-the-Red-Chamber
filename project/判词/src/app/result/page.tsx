"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ErrorNotice } from "@/components/ErrorNotice";
import { ResultActions } from "@/components/ResultActions";
import { ResultCard } from "@/components/ResultCard";
import { generateFortuneSafe } from "@/lib/fortune/engine";
import { validateFortuneRequest } from "@/lib/fortune/validate";

export default function ResultPage() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name")?.trim() ?? "";
  const birthplace = searchParams.get("birthplace")?.trim() ?? "";
  const birthDate = searchParams.get("birthDate") ?? searchParams.get("birthday") ?? "";

  const parsed = useMemo(() => {
    return validateFortuneRequest({ name, birthplace, birthDate });
  }, [birthDate, birthplace, name]);

  const missingInput = !name || !birthplace || !birthDate;

  if (missingInput) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <section className="lov-empty-card animate-fade-in-up">
          <p>未携带求签信息，请先回到首页录入。</p>
          <Link className="lov-back-link" href="/">
            返回求签页
          </Link>
        </section>
      </main>
    );
  }

  if (!parsed.success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <section className="lov-card-shell animate-fade-in-up">
          <ErrorNotice message="输入参数不完整或格式不正确，请返回首页重新求签。" />
          <Link className="lov-back-link" href="/">
            返回求签页
          </Link>
        </section>
      </main>
    );
  }

  const result = generateFortuneSafe(parsed.data);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="loveable-result-stack animate-fade-in-up">
        <ResultCard name={parsed.data.name} result={result} />
        <ResultActions result={result} />
      </div>
    </main>
  );
}
