import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import {
  Apps,
  Dashboard as DashboardIcon,
  Compare as CompareIcon,
  RateReview,
  People,
  ExitToApp,
} from "@mui/icons-material";

import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { Link } from "react-router-dom";
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [openModels, setOpenModels] = useState(true);
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
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Router>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        {/* Drawer (Left Navigation) */}
        <Drawer
          variant="permanent"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            width: drawerOpen ? 240 : 60,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerOpen ? 240 : 60,
              boxSizing: "border-box",
              backgroundColor: "#2E5D53",
              color: "white",
              boxShadow: "2px 0px 5px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <Box
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 2,
              backgroundColor: "#2E5D53",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "white" }}
            >
              ACC Model App
            </Typography>
          </Box>

          <Divider />

          <List>
            <ListItem component={Link} to="/dashboard">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem component={Link} to="/historical-comparison">
              <ListItemIcon>
                <CompareIcon />
              </ListItemIcon>
              <ListItemText primary="Ratings Trends" />
            </ListItem>
            <Divider />

            <ListItem component={Link} to="/token">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>

            <ListItem component={Link} to="/registration">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>

            <Divider />

            {isAuthenticated && (
              <>
                <ListItem component={Link} to="/ratings">
                  <ListItemIcon>
                    <RateReview />
                  </ListItemIcon>
                  <ListItemText primary="Submit Ratings" />
                </ListItem>

                <Divider />

                <ListItem onClick={toggleModels}>
                  <ListItemIcon>
                    <Apps />
                  </ListItemIcon>
                  <ListItemText primary="Manage" />
                  {openModels ? <ExpandLess /> : <ExpandMore />}
                </ListItem>

                <Collapse in={openModels} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem component={Link} to="/acc-models" sx={{ pl: 4 }}>
                      <ListItemIcon>
                        <Apps />
                      </ListItemIcon>
                      <ListItemText primary="ACC Models" />
                    </ListItem>
                    <ListItem component={Link} to="/attributes" sx={{ pl: 4 }}>
                      <ListItemIcon>
                        <Apps />
                      </ListItemIcon>
                      <ListItemText primary="Attributes" />
                    </ListItem>
                    <ListItem component={Link} to="/components" sx={{ pl: 4 }}>
                      <ListItemIcon>
                        <Apps />
                      </ListItemIcon>
                      <ListItemText primary="Components" />
                    </ListItem>
                    <ListItem
                      component={Link}
                      to="/capabilities"
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon>
                        <Apps />
                      </ListItemIcon>
                      <ListItemText primary="Capabilities" />
                    </ListItem>
                  </List>
                </Collapse>
                <Divider />

                <ListItem component={Link} to="/users">
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText primary="Users" />
                </ListItem>
              </>
            )}
          </List>
          <Divider />
          {isAuthenticated && (
            <List>
              <ListItem onClick={handleLogout} sx={{ cursor: "pointer" }}>
                <ListItemIcon>
                  <ExitToApp />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          )}
        </Drawer>

        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <AppBar
            position="fixed"
            sx={{ backgroundColor: "#2E5D53", ml: drawerOpen ? 240 : 60 }}
          >
            <Toolbar>
              <IconButton color="inherit" edge="start" onClick={toggleDrawer}>
                <Apps />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                ACC Model App
              </Typography>
            </Toolbar>
          </AppBar>
          <Toolbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/token"
              element={<Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route path="/registration" element={<RegistrationForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/historical-comparison"
              element={<HistoricalComparison />}
            />

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
        </Box>
      </Box>
    </Router>
  );
}

export default App;
