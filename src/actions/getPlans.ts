"use server";

import { getUserPlansById } from "@/data/plan";

export async function getPlansFromDb() {
  try {
    const saved_plans = await getUserPlansById();
    // console.log("saved_plans:", saved_plans);
    return saved_plans;
  } catch (error) {
    console.error("Error fetching products from database:", error);
    throw error;
  }
}
