import { Disclaimer } from "@/components/Disclaimer";
import type { FortuneResponse } from "@/lib/fortune/types";

type ResultCardProps = {
  name?: string;
  result: FortuneResponse;
};

const DEFAULT_ADVICE = "保持长期主义，把手上的小事做扎实，结果会朝更好的方向发展。";

export function ResultCard({ name, result }: ResultCardProps) {
  const titleName = name?.trim() ? name.trim() : "有缘人";
  const adviceText = result.interpretation.advice || result.commentary.advice || DEFAULT_ADVICE;

  return (
    <section id="fortune-card" className="lov-result-card" aria-live="polite">
      <div className="lov-edge-line" />

      <div className="lov-result-inner">
        <h2 className="lov-result-title">《判词·{titleName}》</h2>

        <div className="lov-poem">
          {result.poem.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className="lov-poem-line animate-fade-in-up"
              style={{ animationDelay: `${150 + index * 120}ms` }}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="lov-divider">
          <span>解签</span>
        </div>

        <div className="lov-interpret-list animate-fade-in animation-delay-500">
          <article className="lov-interpret-item">
            <h3>签意</h3>
            <p>{result.interpretation.disposition}</p>
          </article>
          <article className="lov-interpret-item">
            <h3>机缘</h3>
            <p>{result.interpretation.turningPoint}</p>
          </article>
          <article className="lov-interpret-item">
            <h3>箴言</h3>
            <p>{adviceText}</p>
          </article>
        </div>

        <Disclaimer />
      </div>

      <div className="lov-edge-line" />
    </section>
  );
}
