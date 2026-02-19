"use client";

import { FormEvent, useMemo, useState } from "react";

import { Disclaimer } from "@/components/Disclaimer";
import type { FortuneRequest } from "@/lib/fortune/types";

type InputFormProps = {
  loading: boolean;
  onSubmit: (value: FortuneRequest) => Promise<void>;
};

const defaultValues: FortuneRequest = {
  name: "",
  birthplace: "",
  birthDate: ""
};

export function InputForm({ loading, onSubmit }: InputFormProps) {
  const [form, setForm] = useState<FortuneRequest>(defaultValues);
  const [localError, setLocalError] = useState<string>("");

  const maxBirthDate = useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError("");

    if (!form.name || !form.birthplace || !form.birthDate) {
      setLocalError("请完整填写姓名、出生地与出生日期。");
      return;
    }

    await onSubmit(form);
  };

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <h2>求签帖</h2>
      <p className="form-intro">三行小帖，借一纸宣纹，起一句判词。</p>

      <label className="form-field">
        <span>姓名</span>
        <input
          name="name"
          value={form.name}
          maxLength={12}
          placeholder="例如：林黛玉"
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
      </label>

      <label className="form-field">
        <span>出生地</span>
        <input
          name="birthplace"
          value={form.birthplace}
          maxLength={30}
          placeholder="例如：苏州"
          onChange={(event) => setForm((prev) => ({ ...prev, birthplace: event.target.value }))}
        />
      </label>

      <label className="form-field">
        <span>出生日期</span>
        <input
          type="date"
          name="birthDate"
          max={maxBirthDate}
          value={form.birthDate}
          onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
        />
      </label>

      {localError ? <p className="field-error">{localError}</p> : null}

      <button className="primary-btn" type="submit" disabled={loading}>
        {loading ? "起签中..." : "起签"}
      </button>

      <Disclaimer compact />
    </form>
  );
}
