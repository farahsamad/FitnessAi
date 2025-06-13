"use client";

import { getPlansFromDb } from "@/actions/getPlans";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { MessageCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// interface IPlans {
//   _id: string;
//   name: string;
//   isActive: boolean;
// }
export interface Plan {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  dietPlan: DietPlan[];
  workoutPlan: WorkoutPlan[];
}

export interface DietPlan {
  id: string;
  planId: string;
  dailyCalories: number;
  createdAt: Date;
  dietMealDays: DietMealDay[];
}

export interface DietMealDay {
  id: string;
  dietPlanId: string;
  day: string;
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  foods: string[];
  dietPlanId: string;
}

export interface WorkoutPlan {
  id: string;
  planId: string;
  schedule: string[];
  createdAt: Date;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  workoutPlanId: string;
  day: string;
  routines: Routine[];
}

export interface Routine {
  id: string;
  exercisesId: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  description?: string;
  routineExercises: string[];
}

const ProfilePage = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isWorkoutSelected, setIsWorkoutSelected] = useState<boolean>(true);
  const { user } = useUser();
  // const plans = [
  //   {
  //     _id: "324567",
  //     userId: "user_123",
  //     name: "John Doe",
  //     workoutPlan: {
  //       schedule: ["Monday", "Wednesday", "Friday"],
  //       exercises: [
  //         {
  //           day: "Monday",
  //           routines: [
  //             { name: "Bench Press", sets: 3, reps: 10, description: "hello" },
  //             { name: "Push Ups", sets: 3, reps: 15, description: "hello" },
  //           ],
  //         },
  //         {
  //           day: "Wednesday",
  //           routines: [
  //             { name: "Deadlift", sets: 4, reps: 8, description: "hello" },
  //             { name: "Pull Ups", sets: 3, reps: 12, description: "hello" },
  //           ],
  //         },
  //       ],
  //     },
  //     dietPlan: {
  //       dailyCalories: 2500,
  //       meals: [
  //         {
  //           name: "Breakfast",
  //           foods: ["Oatmeal", "Banana", "Eggs"],
  //         },
  //         {
  //           name: "Dinner",
  //           foods: ["Grilled Chicken", "Broccoli", "Rice"],
  //         },
  //       ],
  //     },
  //     isActive: true,
  //   },
  //   {
  //     _id: "324847",
  //     userId: "user_456",
  //     name: "Jane Smith",
  //     workoutPlan: {
  //       schedule: ["Tuesday", "Thursday"],
  //       exercises: [
  //         {
  //           day: "Tuesday",
  //           routines: [
  //             { name: "Squats", sets: 4, reps: 10, description: "hello" },
  //             { name: "Lunges", sets: 3, reps: 12, description: "hello" },
  //           ],
  //         },
  //         {
  //           day: "Thursday",
  //           routines: [
  //             { name: "Shoulder Press", sets: 3, reps: 10, description: "hello" },
  //             { name: "Tricep Dips", sets: 3, reps: 15, description: "hello" },
  //           ],
  //         },
  //       ],
  //     },
  //     dietPlan: {
  //       dailyCalories: 2200,
  //       meals: [
  //         {
  //           name: "Lunch",
  //           foods: ["Quinoa", "Salmon", "Spinach"],
  //         },
  //         {
  //           name: "Snack",
  //           foods: ["Greek Yogurt", "Almonds"],
  //         },
  //       ],
  //     },
  //     isActive: false,
  //   },
  // ];
  const getPlans = async () => {
    const plans = await getPlansFromDb();
    if (plans) {
      setPlans(plans);
    }
  };

  useEffect(() => {
    getPlans();
  }, []);

  const activePlan = plans?.find((plan) => plan.isActive);

  const currentSelectedPlan = selectedPlanId
    ? plans.find((plan) => plan.id === selectedPlanId)
    : activePlan;

  useEffect(() => {
    if (currentSelectedPlan?.id) {
      setSelectedPlanId(currentSelectedPlan.id);
    }
  }, [currentSelectedPlan, selectedPlanId]);

  return (
    <div className="w-full h-full min-h-screen py-3 px-4">
      <div className="flex justify-center w-full h-40 md:h-56 mt-4 shadow-inner">
        <div className="flex bg-gray-950 rounded-md shadow-lg w-[97%] md:w-3/4 h-full py-2 px-4">
          <div className="h-full flex items-center">
            <Image
              src={user ? user.imageUrl : "/public/file.svg"}
              alt="user image"
              width={176}
              height={176}
              className="md:h-44 md:w-44 w-20 h-20 rounded-full"
            />
          </div>
          <div className="pl-5 h-full flex grow flex-col justify-evenly">
            <p className="font-bold text-2xl md:text-4xl">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-lg md:text-2xl">{user?.emailAddresses[0].emailAddress}</p>
            <div>
              <p className="text-sm md:text-xl">
                {plans && plans.length > 0 ? plans.length : "0"} plans
              </p>
            </div>
          </div>
        </div>
      </div>
      {plans && plans.length > 0 ? (
        <div className="flex justify-center w-full min-h-fit h-fit  mt-4 shadow-inner">
          <div className="flex flex-col bg-gray-950 rounded-md shadow-lg w-[97%] md:w-3/4 h-full py-2 px-4">
            <div className="text-2xl font-bold">
              Your <span className="text-blue-900">fitness</span> plans
            </div>
            <div className="h-14 w-fit flex grow  space-x-3.5 my-4">
              {plans.map((plan) => (
                <Button
                  key={plan.id}
                  size="lg"
                  asChild
                  className={`rounded-md border-[1px] border-blue-500 py-2 px-8 h-fit cursor-pointer  text-white
${selectedPlanId === plan.id ? "bg-blue-400" : "bg-gray-950"}
`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div
                    className={`rounded-md border-[1px] border-blue-500 py-2 px-8 h-fit cursor-pointer  text-white ${
                      selectedPlanId === plan.id ? "bg-blue-400" : "bg-gray-950"
                    }`}
                  >
                    <div className="flex items-center font-mono py-1">{plan.name}</div>
                    {plan.isActive && (
                      <div className="px-2 py-1 bg-blue-500 rounded-xl">Active</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
            <div className="h-fit min-h-fit flex w-full  justify-evenly border-[1px] border-blue-500 rounded-md">
              <div className="w-1/2 h-fit">
                <Button
                  size="lg"
                  asChild
                  className={`w-full text-center   py-2 px-4  h-fit cursor-pointer ${
                    isWorkoutSelected ? "bg-blue-400 text-black" : "bg-gray-950 text-white"
                  }`}
                  onClick={() => setIsWorkoutSelected(true)}
                >
                  <div className="flex items-center "> Workout plan</div>
                </Button>
              </div>
              <div className="w-1/2 h-fit">
                <Button
                  size="lg"
                  asChild
                  className={`w-full text-center   py-2 px-4  h-fit cursor-pointer ${
                    !isWorkoutSelected ? "bg-blue-400 text-black" : "bg-gray-950 text-white"
                  }`}
                  onClick={() => setIsWorkoutSelected(false)}
                >
                  <div className="flex items-center "> Diet plan</div>
                </Button>
              </div>
            </div>
            {isWorkoutSelected ? (
              <div className="w-full h-fit ">
                <div className="text-blue-900 text-xl mt-4 font-bold">Schedule</div>
                <div>
                  <Accordion type="single" collapsible className="w-full">
                    {currentSelectedPlan &&
                      currentSelectedPlan.workoutPlan &&
                      currentSelectedPlan.workoutPlan.map((workoutPlan) =>
                        workoutPlan.exercises.map((exercise, index) => (
                          <AccordionItem
                            key={`workout-exercise-${index}`}
                            value={`exercise-${index}`}
                            className="my-4 rounded-md border-[1px] border-blue-500 py-2 px-4"
                          >
                            <AccordionTrigger className="text-xl">{exercise.day}</AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-4 text-balance">
                              {exercise.routines.map((routine, index, routinesArray) => (
                                <div
                                  key={`routine-${index}`}
                                  className={`py-3  flex justify-between ${
                                    routinesArray.length - 1 === index
                                      ? ""
                                      : "border-b-[1px] border-b-blue-500"
                                  }`}
                                >
                                  <div className="flex flex-col px-4">
                                    <div className="text-lg">{routine.name}</div>
                                    <div className="text-gray-500 text-xs py-1">
                                      {routine.description}
                                    </div>
                                    <div className="text-gray-500 text-xs py-1">
                                      x{" "}
                                      {routine.sets && routine.reps && routine.sets * routine.reps}
                                    </div>
                                  </div>
                                  <div className="flex h-fit">
                                    <div className="bg-blue-950 py-2 px-3 rounded-md">
                                      {routine.sets} Sets
                                    </div>
                                    <div className="ml-3 bg-gray-800 py-2 px-3 rounded-md">
                                      {routine.reps} Reps
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      )}
                  </Accordion>
                </div>
              </div>
            ) : (
              <div className="w-full h-fit">
                {currentSelectedPlan &&
                  currentSelectedPlan.dietPlan &&
                  currentSelectedPlan.dietPlan.map((dietPlan, index) => (
                    <div
                      key={`dietPlan-dailyCalories-${index}`}
                      className=" text-xl mt-4 font-bold flex justify-between"
                    >
                      <div>Daily calories</div>
                      <div className="text-blue-900">{dietPlan.dailyCalories}CAL</div>
                    </div>
                  ))}
                <div>
                  <Accordion type="single" collapsible className="w-full">
                    {currentSelectedPlan &&
                      currentSelectedPlan.dietPlan &&
                      currentSelectedPlan.dietPlan.map((dietPlan) =>
                        dietPlan.dietMealDays.map((dietMealDays, index) => (
                          <AccordionItem
                            key={`diet-plan-${index}`}
                            value={`diet-${index}`}
                            className="my-4 rounded-md border-[1px] border-blue-500 py-2 px-4"
                          >
                            <AccordionTrigger className="text-xl">
                              {dietMealDays.day}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-4 text-balance">
                              {dietMealDays.meals.map((meals, index, mealsArray) => (
                                <div
                                  key={`meals-${index}`}
                                  className={`py-3  flex justify-between ${
                                    mealsArray.length - 1 === index
                                      ? ""
                                      : "border-b-[1px] border-b-blue-500"
                                  }`}
                                >
                                  <div className="flex flex-col px-4">
                                    <div className="text-lg text-blue-600">{meals.name}</div>
                                    {meals.foods.map((food, index) => (
                                      <div key={`food-${index}`} className="text-blue-400 py-2">
                                        {food}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      )}
                  </Accordion>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>No plans created</div>
      )}
      <div className="fixed bottom-6 right-3 w-11 h-11 bg-black rounded-full shadow-lg grid place-content-center">
        <Link href={"/message"} className="cursor-pointer">
          <MessageCircleIcon />
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;
