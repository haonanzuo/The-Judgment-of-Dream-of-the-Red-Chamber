"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorNotice } from "@/components/ErrorNotice";
import type { FortuneRequest } from "@/lib/fortune/types";
import { validateFortuneRequest } from "@/lib/fortune/validate";

const pickFirstValidationError = (errors: Record<string, string[] | undefined>): string => {
  const order = ["name", "birthplace", "birthDate"];
  for (const key of order) {
    const message = errors[key]?.[0];
    if (message) {
      return message;
    }
  }

  return "输入不合法，请检查后重试。";
};

const InputCard = () => {
  const router = useRouter();
  const [form, setForm] = useState<FortuneRequest>({
    name: "",
    birthplace: "",
    birthDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxBirthDate = useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }, []);

  const canSubmit = Boolean(form.name.trim() && form.birthplace.trim() && form.birthDate);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const payload: FortuneRequest = {
      name: form.name.trim(),
      birthplace: form.birthplace.trim(),
      birthDate: form.birthDate
    };

    setError("");

    if (!payload.name || !payload.birthplace || !payload.birthDate) {
      setError("请完整填写姓名、出生地与出生日期。");
      return;
    }

    setLoading(true);

    try {
      const parsed = validateFortuneRequest(payload);
      if (!parsed.success) {
        setError(pickFirstValidationError(parsed.error.flatten().fieldErrors));
        return;
      }

      const query = new URLSearchParams({
        name: parsed.data.name,
        birthplace: parsed.data.birthplace,
        birthDate: parsed.data.birthDate
      });

      router.push(`/result?${query.toString()}`);
    } catch {
      setError("本地生成失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="lov-card-shell">
      <form className="lov-card" onSubmit={handleSubmit}>
        <h1 className="lov-title">《判词》</h1>
        <p className="lov-subtitle">起签 · 问前程</p>

        <div className="lov-form-fields">
          <label htmlFor="name" className="lov-field">
            <span className="lov-label">姓名</span>
            <input
              id="name"
              name="name"
              type="text"
              maxLength={12}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="请题名"
              className="lov-input"
            />
          </label>

          <label htmlFor="birthplace" className="lov-field">
            <span className="lov-label">出生地</span>
            <input
              id="birthplace"
              name="birthplace"
              type="text"
              maxLength={30}
              value={form.birthplace}
              onChange={(event) => setForm((prev) => ({ ...prev, birthplace: event.target.value }))}
              placeholder="如：杭州"
              className="lov-input"
            />
          </label>

          <label htmlFor="birthDate" className="lov-field">
            <span className="lov-label">出生日期</span>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              max={maxBirthDate}
              value={form.birthDate}
              onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
              className="lov-input lov-input-date"
            />
          </label>
        </div>

        <button className={`lov-submit${canSubmit ? "" : " lov-submit-muted"}`} type="submit" disabled={loading}>
          {loading ? "起签中…" : "起签"}
        </button>

        <p className="lov-note">
          文学化解读，仅供玩味
          <br />
          切勿作为人生决策之依据
        </p>
      </form>

      {error ? <ErrorNotice message={error} /> : null}
    </section>
  );
};

export default InputCard;
