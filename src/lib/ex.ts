// "use client";

// import type { Todo } from "@/app/schema";
// import { neon } from "@neondatabase/serverless";
// import { useAuth } from "@clerk/nextjs";
// import { useEffect, useState } from "react";

// const getDb = (token: string) =>
//   neon(process.env.NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL!, {
//     authToken: token,
//   });

// export function TodoList() {
//   const { getToken } = useAuth();
//   const [todos, setTodos] = useState<Array<Todo>>();

//   useEffect(() => {
//     async function loadTodos() {
//       const authToken = await getToken();

//       if (!authToken) {
//         return;
//       }

//       const sql = getDb(authToken);

//       // WHERE filter is optional because of RLS.
//       // But we send it anyway for performance reasons.
//       const todosResponse = await sql("select * from todos where user_id = auth.user_id()");

//       setTodos(todosResponse as Array<Todo>);
//     }

//     loadTodos();
//   }, [getToken]);

//   return (
//     <ul>
//       {todos?.map((todo) => (
//         <li key={todo.id}>{todo.task}</li>
//       ))}
//     </ul>
//   );
// }

// "use server";

// import { neon } from "@neondatabase/serverless";
// import { auth } from "@clerk/nextjs/server";

// export async function TodoList() {
//   const sql = neon(process.env.DATABASE_AUTHENTICATED_URL!, {
//     authToken: async () => {
//       const token = await auth().getToken();
//       if (!token) {
//         throw new Error("No token");
//       }
//       return token;
//     },
//   });

//   // WHERE filter is optional because of RLS.
//   // But we send it anyway for performance reasons.
//   const todos = await sql("select * from todos where user_id = auth.user_id()");

//   return (
//     <ul>
//       {todos.map((todo) => (
//         <li key={todo.id}>{todo.task}</li>
//       ))}
//     </ul>
//   );
// }
