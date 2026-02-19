"use client";

import Link from "next/link";
import { useState } from "react";

import type { FortuneResponse } from "@/lib/fortune/types";

type ResultActionsProps = {
  result: FortuneResponse;
};

export function ResultActions({ result }: ResultActionsProps) {
  const [hint, setHint] = useState("");

  const handleCopy = async () => {
    const text = `【判词】\n${result.poem.join("\n")}\n\n【解签】\n${result.interpretation.disposition}\n${result.interpretation.turningPoint}\n${result.interpretation.advice}`;

    try {
      await navigator.clipboard.writeText(text);
      setHint("已抄录至剪贴板");
    } catch {
      setHint("抄录失败，请手动复制");
    }
  };

  return (
    <div className="lov-actions-wrap">
      <div className="lov-actions">
        <Link className="lov-action-btn" href="/">
          再起一签
        </Link>

        <button className="lov-action-btn" type="button" onClick={handleCopy}>
          抄录
        </button>
      </div>

      {hint ? (
        <p className="lov-action-hint" role="status">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
