import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import {
  CssBaseline,
  Toolbar,
  Box,
} from "@mui/material";
import AccModels from "./pages/AccModels";
import Attributes from "./pages/Attributes";
import Components from "./pages/Components";
import Capabilities from "./pages/Capabilities";
import Ratings from "./pages/Ratings";
import Dashboard from "./pages/AggregateRatings";
import Users from "./pages/Users";
import RegistrationForm from "./pages/RegistrationForm";
import Login from "./pages/Login";
import HistoricalComparison from "./pages/HistoricalComparison";
import { apiRequest } from "./services/apiService";
import Home from "./pages/Home";
import "./App.css";
import AppBarComponent from "./AppBarComponent";
import DrawerComponent from "./DrawerComponent";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [openModels, setOpenModels] = useState(true);
  const [user, setUser] = useState(null); // Store user info
  const toggleModels = () => {
    setOpenModels(!openModels);
  };

  useEffect(() => {
    const handleAuthentication = async () => {
      const token = localStorage.getItem("authToken");
      const tokenExpiry = localStorage.getItem("tokenExpiry");
      const currentTime = Date.now();

      if (token && tokenExpiry) {
        if (currentTime < parseInt(tokenExpiry, 10)) {
          setIsAuthenticated(true);
        } else {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              const response = await apiRequest("/refresh-token", {
                method: "POST",
                data: { refresh_token: refreshToken },
              });
              const newAccessToken = response.newAccessToken;
              localStorage.setItem("authToken", newAccessToken);
              setIsAuthenticated(true);
            } catch (error) {
              localStorage.removeItem("authToken");
              localStorage.removeItem("refreshToken");
              setIsAuthenticated(false);
            }
          } else {
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
            setIsAuthenticated(false);
          }
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    handleAuthentication();
  }, []);

  // Fetch user details if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserDetails = async () => {
        try {
          const response = await apiRequest("/users/users/me/");
          setUser(response); // Set the user data
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      fetchUserDetails();
    } else {
      setUser(null); // Reset user if not authenticated
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUser(null);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Router>
  <CssBaseline />
  <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
    <AppBarComponent
      isAuthenticated={isAuthenticated}
      user={user}
      toggleDrawer={toggleDrawer}
      handleLogout={handleLogout}
    />
    <Toolbar />
    <Box sx={{ display: "flex", flex: 1 }}>
      <DrawerComponent
        isAuthenticated={isAuthenticated}
        drawerOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
        toggleModels={toggleModels}
        openModels={openModels}
      />

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated}/>} />
          <Route path="/token" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/registration" element={<RegistrationForm />} />
          
          {isAuthenticated ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/historical-comparison" element={<HistoricalComparison />} />
              <Route path="/acc-models" element={<AccModels />} />
              <Route path="/attributes" element={<Attributes />} />
              <Route path="/components" element={<Components />} />
              <Route path="/capabilities" element={<Capabilities />} />
              <Route path="/users" element={<Users />} />
              <Route path="/ratings" element={<Ratings />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/token" />} />
          )}
        </Routes>
      </Box>
    </Box>
  </Box>
</Router>
  );
}

export default App;
