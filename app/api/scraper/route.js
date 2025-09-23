import { chromium } from "playwright";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto("https://wise.com/gb/currency-converter/eur-to-usd-rate", {
      waitUntil: "load",
    });

    const results2 = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("h2.np-text-title-section.m-t-1")
      ).map((q) => Number(q.innerText.substr(8, 6)));
    });

    await browser.close();
    return NextResponse.json(results2[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
