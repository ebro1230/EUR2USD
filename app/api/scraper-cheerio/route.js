import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data } = await axios.get(
      "https://wise.com/gb/currency-converter/eur-to-usd-rate"
    );
    // console.log("DATA");
    // console.log(data);
    const $ = cheerio.load(data);

    // let results = $("div._midMarketRateAmount_14arr_139")
    //   .map((i, el) => $(el).text())
    //   .get();

    let results2 = $("#target-input").attr("value");

    console.log("RESULTS 2: ", results2);

    return NextResponse.json(results2, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
