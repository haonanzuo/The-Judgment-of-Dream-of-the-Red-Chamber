import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { z } from "zod";

dayjs.extend(customParseFormat);

const NAME_REGEX = /^[\p{Script=Han}A-Za-z·•\-\s]{1,12}$/u;
const CONTROL_CHAR_REGEX = /[\p{C}]/u;

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "出生日期格式必须为 YYYY-MM-DD")
  .refine((value) => dayjs(value, "YYYY-MM-DD", true).isValid(), "出生日期无效")
  .refine((value) => {
    const parsed = dayjs(value, "YYYY-MM-DD", true);
    return !parsed.isAfter(dayjs(), "day");
  }, "出生日期必须是过去日期")
  .refine((value) => {
    const parsed = dayjs(value, "YYYY-MM-DD", true);
    const age = dayjs().diff(parsed, "year");
    return age >= 0 && age <= 120;
  }, "年龄需在 0-120 岁区间");

export const fortuneRequestSchema = z.object({
  name: z
    .string()
    .min(1, "姓名不能为空")
    .max(12, "姓名最多 12 个字符")
    .regex(NAME_REGEX, "姓名仅支持中英文、空格、中点与短横线"),
  birthplace: z
    .string()
    .min(2, "出生地至少 2 个字符")
    .max(30, "出生地最多 30 个字符")
    .refine((value) => !CONTROL_CHAR_REGEX.test(value), "出生地包含非法字符"),
  birthDate: birthDateSchema
});

export const validateFortuneRequest = (input: unknown) => {
  return fortuneRequestSchema.safeParse(input);
};
