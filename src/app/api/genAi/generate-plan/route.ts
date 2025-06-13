// app/api/user-data/route.ts

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// validate and fix workout plan to ensure it has proper numeric types
function validateWorkoutPlan(plan: any) {
  const validatedPlan = {
    schedule: plan.schedule,
    exercises: plan.exercises.map((exercise: any) => ({
      day: exercise.day,
      routines: exercise.routines.map((routine: any) => ({
        name: routine.name,
        sets: typeof routine.sets === "number" ? routine.sets : parseInt(routine.sets) || 1,
        reps: typeof routine.reps === "number" ? routine.reps : parseInt(routine.reps) || 10,
      })),
    })),
  };
  return validatedPlan;
}

// validate diet plan to ensure it strictly follows schema
function validateDietPlan(plan: any) {
  // only keep the fields we want
  const validatedPlan = {
    dailyCalories: plan.dailyCalories,
    dietMealDays: plan.dietMealDays.map((dayMeal: any) => ({
      day: dayMeal.day,
      meals: dayMeal.meals.map((meal: any) => ({
        name: meal.name,
        foods: meal.foods,
      })),
    })),
  };
  return validatedPlan;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("body: ", body);
    const {
      age,
      gender,
      height,
      weight,
      injuries,
      fitness_goal,
      workout_days,
      fitness_level,
      dietary_preferences,
      userId,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // return NextResponse.json(user);

    console.log("Body is here:", body);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: {
        temperature: 0.4, // lower temperature for more predictable outputs
        topP: 0.9,
        responseMimeType: "application/json",
      },
    });

    const workoutPrompt = `You are an experienced fitness coach creating a personalized workout plan based on:
        Age: ${age}
        Gender: ${gender}
        Height: ${height}
        Weight: ${weight}
        Injuries or limitations: ${injuries}
        Available days for workout: ${workout_days}
        Fitness goal: ${fitness_goal}
        Fitness level: ${fitness_level}
        
        As a professional coach:
        - Consider muscle group splits to avoid overtraining the same muscles on consecutive days
        - Design exercises that match the fitness level and account for any injuries
        - Structure the workouts to specifically target the user's fitness goal
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
        - "sets" and "reps" MUST ALWAYS be NUMBERS, never strings
        - For example: "sets": 3, "reps": 10
        - Do NOT use text like "reps": "As many as possible" or "reps": "To failure"
        - Instead use specific numbers like "reps": 12 or "reps": 15
        - For cardio, use "sets": 1, "reps": 1 or another appropriate number
        - NEVER include strings for numerical fields
        - NEVER add extra fields not shown in the example below
        
        Return a JSON object with this EXACT structure:
        {
          "schedule": ["Monday", "Wednesday", "Friday"],
          "exercises": [
            {
              "day": "Monday",
              "routines": [
                {
                  "name": "Exercise Name",
                  "sets": 3,
                  "reps": 10
                }
              ]
            }
          ]
        }
        
        DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

    const workoutResult = await model.generateContent(workoutPrompt);
    const workoutPlanText = await workoutResult.response.text();

    // VALIDATE THE INPUT COMING FROM AI
    let workoutPlan = JSON.parse(workoutPlanText);
    workoutPlan = validateWorkoutPlan(workoutPlan);

    const dietPrompt = `You are an experienced nutrition coach creating a personalized diet plan based on:
          Age: ${age}
          Gender: ${gender}
          Height: ${height}
          Weight: ${weight}
          Fitness goal: ${fitness_goal}
          Dietary restrictions: ${dietary_preferences}
          
          As a professional nutrition coach:
          - Calculate appropriate daily calorie intake based on the person's stats and goals
          - Create a balanced meal plan with proper macronutrient distribution
          - Include a variety of nutrient-dense foods while respecting dietary restrictions
          - Consider meal timing around workouts for optimal performance and recovery
          
          CRITICAL SCHEMA INSTRUCTIONS:
          - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
          - "dailyCalories" MUST be a NUMBER, not a string
          - DO NOT add fields like "supplements", "macros", "notes", or ANYTHING else
          - ONLY include the EXACT fields shown in the example below
          - Create meals for each day of the week.
          - Each meal should include ONLY a "name" and "foods" array
  
          Return a JSON object with this EXACT structure and no other fields:
          {
            "dailyCalories": 2000,
            "dietMealDays": [
              { 
                "day": Monday,
                "meals": [
                  {
                    "name": "Breakfast",
                    "foods": ["Oatmeal with berries", "Greek yogurt", "Black coffee"]
                  },
                  {
                    "name": "Lunch",
                    "foods": ["Grilled chicken salad", "Whole grain bread", "Water"]
                  }
                ]
              }
            ]
          }
          
          DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

    const dietResult = await model.generateContent(dietPrompt);
    const dietPlanText = dietResult.response.text();

    // VALIDATE THE INPUT COMING FROM AI

    let dietPlan = JSON.parse(dietPlanText);
    dietPlan = validateDietPlan(dietPlan);

    //Set all active user plans to false
    const updatePlansIsActive = await db.plan.updateMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
    console.log(`name: ${fitness_goal} Plan - ${new Date().toLocaleDateString()}`);
    // console.log("dietPlan: ", dietPlan);
    console.log("typeof dietPlan.dailyCalories: ", typeof dietPlan.dailyCalories);
    console.log("dietPlan.dailyCalories: ", dietPlan.dailyCalories);
    console.log(
      "//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////dietPlan.DietMealDays: ",
      dietPlan.DietMealDays
    );
    // console.log("workoutPlan: ", workoutPlan);
    // save to neon
    // const planId = await db.plan.create({
    //   data: {
    //     name: `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`,
    //     userId: user.id,
    //     dietPlan,
    //     workoutPlan,
    //     isActive: true,
    //   },
    // });

    const planId = await db.plan.create({
      data: {
        name: `${fitness_goal}-${new Date().toLocaleDateString()}`,
        userId: user.id,
        isActive: true,
        workoutPlan: {
          create: {
            schedule: workoutPlan.schedule,
            exercises: {
              create: workoutPlan.exercises.map((exercise: any) => ({
                day: exercise.day,
                routines: {
                  create: exercise.routines.map((routine: any) => ({
                    name: routine.name,
                    sets: routine.sets,
                    reps: routine.reps,
                  })),
                },
              })),
            },
          },
        },
        dietPlan: {
          create: {
            dailyCalories: dietPlan.dailyCalories,
            dietMealDays: {
              create: dietPlan.dietMealDays.map((day: any) => ({
                day: day.day,
                meals: {
                  create: day.meals.map((meal: any) => ({
                    name: meal.name,
                    foods: meal.foods,
                  })),
                },
              })),
            },
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          planId,
          workoutPlan,
          dietPlan,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating fitness plan:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
