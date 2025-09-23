import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    let currentTime = new Date();
    console.log(currentTime);
    const users = await User.find({});
    console.log("USERS:");
    console.log(users);
    if (users.length) {
      users.forEach((user) => {
        console.log("Interval Difference");
        console.log(user.lastCheck - currentTime);
        console.log("Interval:");
        console.log(user.interval);
        console.log(user.lastCheck - currentTime > user.interval);
        if (user.lastCheck - currentTime > user.interval) {
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scraper`, {
            method: "GET",
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("DATA: ", data);
              if (data > user.thresholdValue) {
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send-email`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: user.email,
                    trend: "Exchange Rate Above Minimum Threshold",
                    exchangeRate: data,
                  }),
                })
                  .then((response) => response.json())
                  .then(async (data) => {
                    console.log(data);
                    await User.findOneAndUpdate(
                      {
                        email: user.email,
                        thresholdValue: user.thresholdValue,
                        interval: user.interval,
                      },
                      { $set: { lastCheck: currentTime } }
                    );
                  })
                  .catch((error) => {
                    console.error("Error:", error);
                    alert("Failed to Send Email");
                  });
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              alert("Failed to Get Exchange Rates");
            });
        }
      });

      return NextResponse.json(
        { success: true, message: "Rates Checked & Users Emailed as Needed" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          error: "No Users Found to Check Rates For",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
