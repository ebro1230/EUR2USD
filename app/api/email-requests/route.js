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
      thresholdValue: body.thresholdValue,
      interval: body.interval,
    });
    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Email with that threshold value & interval request rate already exists",
        },
        { status: 400 }
      );
    } else {
      const newUser = await User.create({
        email: body.email,
        interval: body.interval,
        days: body.days,
        hours: body.hours,
        minutes: body.minutes,
        lastCheck: new Date(),
        thresholdValue: body.thresholdValue,
      });
      return NextResponse.json(
        {
          success: true,
          message: `Recurring Email Request created for ${newUser.email} when the euro is valued greater than or equal to $${newUser.thresholdValue}, checking every ${newUser.days} days, ${newUser.hours} hours, and ${newUser.minutes} minutes`,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
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
          error: "That email was not receiving recurring rate requests",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          message: `Recurring Email Requests for ${body.email} deleted`,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
