import { expect, test } from "@playwright/test";

test("输入有效信息后会跳转到结果页并看到签文", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("姓名").fill("林黛玉");
  await page.getByLabel("出生地").fill("苏州");
  await page.getByLabel("出生日期").fill("1998-03-02");
  await page.getByRole("button", { name: "起签" }).click();

  await expect(page).toHaveURL(/\/result\?/);
  await expect(page.getByText("《判词·林黛玉》")).toBeVisible({ timeout: 3000 });
  await expect(page.getByText("文学化解读，仅供玩味").first()).toBeVisible();

  await page.getByRole("link", { name: "再起一签" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("缺失字段会提示本地错误", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "起签" }).click();

  await expect(page.getByText("请完整填写姓名、出生地与出生日期。")).toBeVisible();
});
