"use server";

import { db } from "@/config/db";
import { users } from "@/drizzle/schema";
import  argon2 from "argon2";
import { eq, or } from "drizzle-orm";

export const registerUserAction = async (data: {
  name: string;
  userName: string;
  email: string;
  password: string;
  role: "applicant" | "employer";
}) => {
  try {
  const { name, userName, email, password, role } = data;

  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.userName, userName)));

  if (user) {
    if (user.email === email) {
      return {
        status: "ERROR",
        message: "Email is already registered. Please use a different email.",
      };
    } else {
      return {
        status: "ERROR",
        message: "Username is already taken. Please choose a different username.",
      };
    }
  }

  const hashPassword = await argon2.hash(password);

  await db.insert(users).values({name,userName,email,password: hashPassword,role,});

  return { status: "SUCCESS", message: "Registration completed successfully" };

  } catch (error) {
    return { 
        status: "ERROR", 
        message: "Registration failed. Please try again."
    }
  }
};
