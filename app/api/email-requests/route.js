import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();
    let body = await req.json(); // Parse JSON in App Router
    body.lastCheck = new Date();
    const existingUser = await User.findOne({
      email: body.email,
      thresholdValue: Number(
        (body.thresholdValue / body.conversionAmount).toFixed(5)
      ),
      interval: body.interval,
      from: body.from,
      to: body.to,
      conversionAmount: body.conversionAmount,
    });
    if (existingUser) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Email with that threshold value & interval request rate already exists",
        },
        { status: 200 }
      );
    } else {
      const newUser = await User.create({
        email: body.email,
        interval: body.interval,
        days: body.days,
        hours: body.hours,
        minutes: body.minutes,
        lastCheck: new Date(),
        thresholdValue: Number(
          (body.thresholdValue / body.conversionAmount).toFixed(5)
        ),
        trendNotifications: body.trendNotifications,
        from: body.from,
        to: body.to,
        conversionAmount: body.conversionAmount,
      });
      return NextResponse.json(
        {
          success: true,
          message: `Recurring Email Request created for ${newUser.email} when ${newUser.conversionAmount} ${newUser.from} is valued greater than or equal to the ${newUser.thresholdValue}, checking the exchange rate every ${newUser.days} day(s), ${newUser.hours} hour(s), and ${newUser.minutes} minute(s)`,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectToDatabase();
    let body = await req.json(); // Parse JSON in App Router
    const existingUsers = await User.deleteMany({
      email: body.email,
    });
    if (existingUsers.deletedCount === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "That email was not receiving recurring rate requests",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          message: `Recurring Email Requests for ${body.email} deleted`,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
