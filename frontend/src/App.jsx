import { Route, Routes } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/TaskDashboard/Dashboard";
import CreateTask from "./pages/TaskDashboard/CreateTask";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoutes from "./components/protectRoutes/ProtectedRoutes";
import PublicRoutes from "./components/protectRoutes/PublicRoutes";
import UpdateTask from "./pages/TaskDashboard/UpdateTask";
import AssignToOthers from "./pages/TaskDashboard/AssignToOthers";
import { ToastContainer } from "react-toastify";

import ChatPage from "./pages/Chat/ChatPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationPage from "./pages/NotificationPage";
import ProfilePage from "./pages/ProfilePage";
import Forget from "./pages/Auth/Forget";
import ForgetPassword from "./pages/Auth/ForgetPassword";
import OtpVerification from "./pages/Auth/OtpVerification";

const App = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoutes>
              <Login />
            </PublicRoutes>
          }
        />

        <Route
          path="/forget-password/"
          element={
            <PublicRoutes>
              <ForgetPassword />
            </PublicRoutes>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <PublicRoutes>
              <Forget />
            </PublicRoutes>
          }
        />
        

        <Route
          path="/register"
          element={
            <PublicRoutes>
              <Register />
            </PublicRoutes>
          }
        />

        <Route
        path="/otp-verify/:otpToken"
        element={
          <PublicRoutes>
            <OtpVerification />
          </PublicRoutes>
        }
        />

        <Route
          element={
            <ProtectedRoutes>
              <DashboardLayout />
            </ProtectedRoutes>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/create-task" element={<CreateTask />} />
          <Route path="/dashboard/update-task/:id" element={<UpdateTask />} />
          <Route
            path="/dashboard/assign-to-others"
            element={<AssignToOthers />}
          />
          <Route path="/dashboard/notifications" element={<NotificationPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/chat" element={<ChatPage />} />
        </Route>
         <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
};

export default App;
