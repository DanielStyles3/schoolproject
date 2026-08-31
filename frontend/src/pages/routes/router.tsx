import { Navigate, createBrowserRouter } from "react-router";
import Architecture from "@/pages/Architecture";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import PrivateRoutes from "@/pages/routes/PrivateRoutes";
import Dashboard from "@/pages/Dashboard";
import AcademicYear from "@/pages/settings/academic-year";
import Profile from "@/pages/settings/Profile";
import UserManagementPage from "@/pages/users";
import Classes from "@/pages/academics/Classes";
import { Subjects } from "@/pages/academics/Subjects";
import CourseRegistration from "@/pages/academics/CourseRegistration";
import RegistrationApprovals from "@/pages/academics/RegistrationApprovals";
import Results from "@/pages/academics/Results";
import RoleGuard from "@/components/auth/RoleGuard";

export const router = createBrowserRouter([
  {
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "architecture", element: <Architecture /> },
      { path: "login", element: <Login /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      {
        element: <PrivateRoutes />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "settings/profile", element: <Profile /> },
          {
            element: <RoleGuard allowedRoles={["student"]} />,
            children: [
              { path: "course-registration", element: <CourseRegistration /> },
            ],
          },
          {
            element: <RoleGuard allowedRoles={["admin", "teacher", "student"]} />,
            children: [{ path: "results", element: <Results /> }],
          },
          {
            element: <RoleGuard allowedRoles={["admin", "teacher"]} />,
            children: [
              {
                path: "users/students",
                element: (
                  <UserManagementPage
                    role="student"
                    title="Students"
                    description="Manage student records and class allocation."
                  />
                ),
              },
              { path: "classes", element: <Classes /> },
              { path: "courses", element: <Subjects /> },
              { path: "subjects", element: <Subjects /> },
            ],
          },
          {
            element: <RoleGuard allowedRoles={["admin"]} />,
            children: [
              { path: "settings/academic-years", element: <AcademicYear /> },
              { path: "registrations", element: <RegistrationApprovals /> },
              {
                path: "users/teachers",
                element: (
                  <UserManagementPage
                    role="teacher"
                    title="Teachers"
                    description="Manage teaching staff."
                  />
                ),
              },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/login" replace /> },
    ],
  },
]);