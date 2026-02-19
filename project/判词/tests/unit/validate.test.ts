import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import { validateFortuneRequest } from "@/lib/fortune/validate";

describe("validateFortuneRequest", () => {
  it("合法输入通过", () => {
    const result = validateFortuneRequest({
      name: "薛宝钗",
      birthplace: "杭州",
      birthDate: "1997-10-12"
    });

    expect(result.success).toBe(true);
  });

  it("未来日期拒绝", () => {
    const futureDate = dayjs().add(1, "day").format("YYYY-MM-DD");
    const result = validateFortuneRequest({
      name: "史湘云",
      birthplace: "南京",
      birthDate: futureDate
    });

    expect(result.success).toBe(false);
  });

  it("超过年龄上限拒绝", () => {
    const tooOld = dayjs().subtract(121, "year").format("YYYY-MM-DD");
    const result = validateFortuneRequest({
      name: "妙玉",
      birthplace: "苏州",
      birthDate: tooOld
    });

    expect(result.success).toBe(false);
  });

  it("姓名非法字符拒绝", () => {
    const result = validateFortuneRequest({
      name: "<script>",
      birthplace: "广州",
      birthDate: "1999-09-09"
    });

    expect(result.success).toBe(false);
  });
});
