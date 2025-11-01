import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const getUserPlansById = async () => {
  try {
    const user = await auth();
    const userId = user.userId;
    // console.log("userId: ", userId);
    if (userId) {
      const userData = await db.user.findUnique({
        where: {
          clerkId: userId,
        },
      });
      if (userData) {
        const userPlans = await db.plan.findMany({
          where: {
            userId: userData.id,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            dietPlan: {
              include: {
                dietMealDays: {
                  include: {
                    meals: true, // includes foods
                  },
                },
              },
            },
            workoutPlan: {
              include: {
                exercises: {
                  include: {
                    routines: true,
                  },
                },
              },
            },
          },
        });

        return userPlans;
      }
    }
    return;
  } catch (error) {
    console.log(
      "///////////////////////////////////////////////////////////////////////////////////////////////Error updating cart:",
      error
    );
    return null;
  }
};
