import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export const checkUser = async () => {
  const user = await currentUser();
  console.log("checkUser user: ", user);

  if (!user) {
    console.log("checkUser no user");
    return null;
  }

  const loggedInUer = await db.user.findUnique({
    where: {
      clerkId: user.id,
    },
  });

  if (loggedInUer) {
    console.log("checkUser already loggedInUer: ", loggedInUer);
    return loggedInUer;
  }

  const newUser = await db.user.create({
    data: {
      clerkId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      image: user.imageUrl,
    },
  });
  console.log("checkUser newUser", newUser);

  return newUser;
};
