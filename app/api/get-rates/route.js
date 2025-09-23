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

export async function GET() {
  try {
    await connectToDatabase();
    const currentTime = new Date();

    // Fetch all users
    const users = await User.find({});

    if (!users.length) {
      console.log("No users found, skipping cron.");
      return NextResponse.json(
        { success: true, skipped: true, message: "No users found" },
        { status: 200 }
      );
    }

    // Loop over users sequentially to handle async calls safely
    for (const user of users) {
      const intervalDifference = currentTime - user.lastCheck;

      if (intervalDifference > user.interval) {
        try {
          // Fetch exchange rate
          const scraperResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scraper-cheerio`
          );
          const rateData = await scraperResponse.json();
          const exchangeRate = Number(rateData.replace(/,/g, "")) / 1000;

          console.log(`Fetched rate for ${user.email}:`, exchangeRate);

          if (exchangeRate > user.thresholdValue) {
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
              await User.findOneAndUpdate(
                { email: user.email },
                { $set: { lastCheck: currentTime } }
              );
            } catch (emailError) {
              console.error("Error sending email:", emailError);
            }
          }
        } catch (scraperError) {
          console.error("Error fetching rates:", scraperError);
        }
      }
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
