import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import {
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Apps, People, ExitToApp } from "@mui/icons-material";
import AccModels from "./pages/AccModels";
import Attributes from "./pages/Attributes";
import Components from "./pages/Components";
import Capabilities from "./pages/Capabilities";
import Ratings from "./pages/Ratings";
import Dashboard from "./pages/AggregateRatings";
import Users from "./pages/Users";
import RegistrationForm from "./pages/RegistrationForm";
import Login from "./pages/Login";
import { apiRequest } from "./services/apiService";
import Home from "./pages/Home";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Router>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
          >
            ACC Model App
          </Typography>
          <Button color="inherit" component={Link} to="/dashboard">
            Dashboard
          </Button>

          {!isAuthenticated && (
            <>
              <Button color="inherit" component={Link} to="/registration">
                Register
              </Button>
              <Button color="inherit" component={Link} to="/token">
                Login
              </Button>
            </>
          )}

          {isAuthenticated && (
            <>
              <Button color="inherit" component={Link} to="/ratings">
                Submit Ratings
              </Button>
              <Tooltip title="Open Menu">
                <IconButton color="inherit" onClick={handleMenuClick}>
                  <Apps />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  component={Link}
                  to="/acc-models"
                  onClick={handleMenuClose}
                >
                  ACC Models
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/attributes"
                  onClick={handleMenuClose}
                >
                  Attributes
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/components"
                  onClick={handleMenuClose}
                >
                  Components
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/capabilities"
                  onClick={handleMenuClose}
                >
                  Capabilities
                </MenuItem>
              </Menu>

              <Tooltip title="Manage Users">
                <IconButton color="inherit" component={Link} to="/users">
                  <People />
                </IconButton>
              </Tooltip>

              <Tooltip title="Logout">
                <IconButton color="inherit" onClick={handleLogout}>
                  <ExitToApp />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          {/* Public routes: Always accessible */}
          <Route path="/" element={<Home />} />
          <Route path="/token" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/registration" element={<RegistrationForm />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Protected routes: Only accessible if authenticated */}
          {isAuthenticated ? (
            <>
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
      </Container>
    </Router>
  );
}

export default App;