import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import Login from "./screens/Login";
import RegisterTenant from "./screens/RegisterTenant";
import { AppLayout } from "./ui/AppLayout";
import EmployeesList from "./screens/employees/EmployeesList";
import EmployeeEdit from "./screens/employees/EmployeeEdit";
import { isAuthed } from "./lib/auth";

function guard() {
  if (!isAuthed()) throw redirect("/login");
  return null;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register-tenant", element: <RegisterTenant /> },
  {
    path: "/",
    element: <AppLayout />,
    loader: guard,
    children: [
      { path: "/", loader: () => redirect("/employees") },
      { path: "/employees", element: <EmployeesList /> },
      { path: "/employees/:id", element: <EmployeeEdit /> }
    ],
  },
]);
