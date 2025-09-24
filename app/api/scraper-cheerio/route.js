import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data } = await axios.get(
      "https://wise.com/gb/currency-converter/eur-to-usd-rate?amount=1000"
    );

    const $ = cheerio.load(data);

    let results = $("#target-input").attr("value");

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
