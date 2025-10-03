import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import Login from "./screens/Login";
import RegisterTenant from "./screens/RegisterTenant";
import { AppLayout } from "./ui/AppLayout";
import EmployeesList from "./screens/employees/EmployeesList";
import EmployeeEdit from "./screens/employees/EmployeeEdit";
import LmsCoursesList from "./screens/lms/LmsCoursesList";
import LmsCourseDetail from "./screens/lms/LmsCourseDetail";
import LmsLesson from "./screens/lms/LmsLesson";
import Analytics from "./screens/analytics/Analytics";
import Integrations from "./screens/integrations/Integrations";
import Branding from "./screens/settings/Branding";
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
      { path: "/employees/:id", element: <EmployeeEdit /> },
      { path: "/lms", element: <LmsCoursesList /> },
      { path: "/lms/courses/:id", element: <LmsCourseDetail /> },
      { path: "/lms/lessons/:id", element: <LmsLesson /> },
      { path: "/analytics", element: <Analytics /> },
      { path: "/settings/integrations", element: <Integrations /> },
      // NEW
      { path: "/settings/branding", element: <Branding /> }
    ],
  },
]);
