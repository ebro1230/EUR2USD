// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import User from "@/models/User";

// export async function GET() {
//   try {
//     await connectToDatabase();
//     let currentTime = new Date();
//     console.log(currentTime);
//     const users = await User.find({});
//     console.log("USERS:");
//     console.log(users);
//     if (users.length) {
//       for (const user of users) {
//         console.log("Interval Difference");
//         console.log(user.lastCheck - currentTime);
//         console.log("Interval:");
//         console.log(user.interval);
//         console.log(currentTime - user.lastCheck > user.interval);
//         if (currentTime - user.lastCheck > user.interval) {
//           const data = await fetch(
//             `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scraper`,
//             {
//               method: "GET",
//             }
//           ).then((response) => response.json());
//           if (data > user.thresholdValue) {
//             await fetch(
//               `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send-email`,
//               {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                   email: user.email,
//                   trend: "Exchange Rate Above Minimum Threshold",
//                   exchangeRate: data,
//                 }),
//               }
//             );
//             await User.findOneAndUpdate(
//               { email: user.email },
//               { $set: { lastCheck: currentTime } }
//             );
//           }
//         }
//       }
//       //   users.forEach((user) => {
//       //     console.log("Interval Difference");
//       //     console.log(user.lastCheck - currentTime);
//       //     console.log("Interval:");
//       //     console.log(user.interval);
//       //     console.log(user.lastCheck - currentTime > user.interval);
//       //     if (user.lastCheck - currentTime > user.interval) {
//       //       fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scraper`, {
//       //         method: "GET",
//       //       })
//       //         .then((response) => response.json())
//       //         .then((data) => {
//       //           console.log("DATA: ", data);
//       //           if (data > user.thresholdValue) {
//       //             fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send-email`, {
//       //               method: "POST",
//       //               headers: {
//       //                 "Content-Type": "application/json",
//       //               },
//       //               body: JSON.stringify({
//       //                 email: user.email,
//       //                 trend: "Exchange Rate Above Minimum Threshold",
//       //                 exchangeRate: data,
//       //               }),
//       //             })
//       //               .then((response) => response.json())
//       //               .then(async (data) => {
//       //                 console.log(data);
//       //                 await User.findOneAndUpdate(
//       //                   {
//       //                     email: user.email,
//       //                     thresholdValue: user.thresholdValue,
//       //                     interval: user.interval,
//       //                   },
//       //                   { $set: { lastCheck: currentTime } }
//       //                 );
//       //               })
//       //               .catch((error) => {
//       //                 console.error("Error:", error);
//       //               });
//       //           }
//       //         })
//       //         .catch((error) => {
//       //           console.error("Error:", error);
//       //         });
//       //     }
//       //   });

//       return NextResponse.json(
//         { success: true, message: "Rates Checked & Users Emailed as Needed" },
//         { status: 200 }
//       );
//     } else {
//       return NextResponse.json(
//         { success: true, skipped: true, message: "No users found" },
//         { status: 200 }
//       );
//     }
//   } catch (error) {
//     return NextResponse.json(
//       {
//         success: true,
//         skipped: true,
//         message: "some error in the overall try",
//       },
//       { status: 200 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import ExchangeRateTrendData from "@/models/ExchangeRateTrendData";

export async function GET() {
  const handleTrendCalculation = (exchangeRateTrendData) => {
    let average = 0;
    exchangeRateTrendData.forEach((dataPoint) => {
      average = average + dataPoint;
    });
    average = average / (exchangeRateTrendData.length - 1);
    if (exchangeRateTrendData.length >= 16) {
      if (
        exchangeRateTrendData[exchangeRateTrendData.length - 1] <
          exchangeRateTrendData[exchangeRateTrendData.length - 16] &&
        exchangeRateTrendData[exchangeRateTrendData.length - 16] <
          exchangeRateTrendData[exchangeRateTrendData.length - 8]
      ) {
        return {
          trend: "negative",
          message: "Exchange Rate is Trending Negatively",
        };
      }
    }

    if (
      exchangeRateTrendData[exchangeRateTrendData.length - 1] >
      average + 0.03
    ) {
      return {
        trend: "positive",
        message: "Exchange Rate is Trending Positively",
      };
    }
    if (exchangeRateTrendData.length >= 6) {
      if (
        (exchangeRateTrendData[exchangeRateTrendData.length - 1] -
          exchangeRateTrendData[exchangeRateTrendData.length - 2]) /
          15 >
          (exchangeRateTrendData[exchangeRateTrendData.length - 2] -
            exchangeRateTrendData[exchangeRateTrendData.length - 3]) /
            15 &&
        (exchangeRateTrendData[exchangeRateTrendData.length - 2] -
          exchangeRateTrendData[exchangeRateTrendData.length - 3]) /
          15 >
          (exchangeRateTrendData[exchangeRateTrendData.length - 3] -
            exchangeRateTrendData[exchangeRateTrendData.length - 4]) /
            15 &&
        (exchangeRateTrendData[exchangeRateTrendData.length - 3] -
          exchangeRateTrendData[exchangeRateTrendData.length - 4]) /
          15 >
          (exchangeRateTrendData[exchangeRateTrendData.length - 4] -
            exchangeRateTrendData[exchangeRateTrendData.length - 5]) /
            15 &&
        (exchangeRateTrendData[exchangeRateTrendData.length - 4] -
          exchangeRateTrendData[exchangeRateTrendData.length - 5]) /
          15 >
          (exchangeRateTrendData[exchangeRateTrendData.length - 5] -
            exchangeRateTrendData[exchangeRateTrendData.length - 6]) /
            15
      ) {
        return {
          trend: "positive",
          message:
            "The Rate at Which the Exchange Rate is Increasing Has Been Going Up Over The Past Hour",
        };
      }
    }
    return {
      trend: "neutral",
      message: "No Trend Identified",
    };
  };

  try {
    await connectToDatabase();
    const currentTime = new Date();

    // Fetch all users
    const users = await User.find({});
    let exchangeRateTrendData = await ExchangeRateTrendData.find({});

    try {
      // Fetch exchange rate
      const scraperResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scraper-cheerio`
      );
      const rateData = await scraperResponse.json();
      const exchangeRate = Number(
        Number(Number(rateData.replace(/,/g, "")) / 1000).toFixed(5)
      );

      if (!exchangeRateTrendData.length) {
        exchangeRateTrendData = [exchangeRate];
      } else if (
        exchangeRateTrendData.length <= 192 &&
        exchangeRateTrendData > 0
      ) {
        exchangeRateTrendData.push(exchangeRate);
      } else {
        exchangeRateTrendData = exchangeRateTrendData.slice(1);
        exchangeRateTrendData.push(exchangeRate);
      }

      await ExchangeRateTrendData.findOneAndUpdate(
        {},
        { $set: { storedExchangeRates: exchangeRateTrendData } }
      );

      if (!users.length) {
        console.log("No users found, skipping cron.");
        return NextResponse.json(
          { success: true, skipped: true, message: "No users found" },
          { status: 200 }
        );
      }
      const trend = handleTrendCalculation(exchangeRateTrendData);
      // Loop over users sequentially to handle async calls safely
      for (const user of users) {
        const intervalDifference = currentTime - user.lastCheck;

        if (
          (exchangeRate >= user.thresholdValue && trend.trend === "neutral") ||
          (exchangeRate >= user.thresholdValue && !user.trendNotifications)
        ) {
          if (intervalDifference >= user.interval) {
            await User.findOneAndUpdate(
              { email: user.email },
              { $set: { lastCheck: currentTime } }
            );
            try {
              // Send email
              const emailResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send-email`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: user.email,
                    trend: "Exchange Rate Above Minimum Threshold",
                    exchangeRate: exchangeRate,
                  }),
                }
              );

              const emailResult = await emailResponse.json();
              console.log("Email sent:", emailResult);

              // Update lastCheck
            } catch (emailError) {
              console.error("Error sending email:", emailError);
            }
          }
        } else if (
          exchangeRate >= user.thresholdValue &&
          trend.trend !== "neutral" &&
          user.trendNotifications
        ) {
          try {
            // Send email
            const emailResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send-email`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: user.email,
                  trend: `Exchange Rate Above Minimum Threshold & ${trend.message}`,
                  exchangeRate: exchangeRate,
                }),
              }
            );

            const emailResult = await emailResponse.json();
            console.log("Email sent:", emailResult);

            // Update lastCheck
          } catch (emailError) {
            console.error("Error sending email:", emailError);
          }
        } else if (
          exchangeRate < user.thresholdValue &&
          trend.trend !== "neutral" &&
          user.trendNotifications
        ) {
          try {
            // Send email
            const emailResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send-email`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: user.email,
                  trend: trend.message,
                  exchangeRate: exchangeRate,
                }),
              }
            );

            const emailResult = await emailResponse.json();
            console.log("Email sent:", emailResult);

            // Update lastCheck
          } catch (emailError) {
            console.error("Error sending email:", emailError);
          }
        }
      }
    } catch (scraperError) {
      console.error("Error fetching rates:", scraperError);
    }

    return NextResponse.json(
      { success: true, message: "Rates checked & users emailed as needed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in /api/get-rates:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
