"use client";

import { checkUser } from "@/lib/checkUser";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import React from "react";

const HeaderComponent = () => {
  // const user = await checkUser();
  // console.log("header user: ", user);
  return (
    <div className="w-full h-24 bg-gray-900 shadow-2xl px-4 flex items-center">
      <Link href={"/"} className="w-1/2 text-white text-lg pl-4 cursor-pointer">
        FitnessAi
      </Link>
      <div className="w-1/2 flex justify-end">
        <SignedOut>
          <div className="flex space-x-4">
            <SignInButton mode="modal">
              <button className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-950">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded hover:bg-blue-950 hover:text-white">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="pr-5">
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Profile"
                  labelIcon={<CircleUserRound className="w-4 h-4" />}
                  href="/profile"
                />
                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default HeaderComponent;
