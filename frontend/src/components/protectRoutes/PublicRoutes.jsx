import { Navigate } from "react-router-dom";

const PublicRoutes = ({ children }) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoutes;