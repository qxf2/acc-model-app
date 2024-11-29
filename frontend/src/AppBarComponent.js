import React from "react";
import { 
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

const AppBarComponent = ({ isAuthenticated, user, toggleDrawer, handleLogout }) => {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#2E5D53", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "white",
            display: "flex",
            alignItems: "center",
            py: 2,
            backgroundColor: "#2E5D53",
          }}
        >
          <IconButton color="inherit" edge="start" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
            ACC Model App
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isAuthenticated ? (
            <>
              <Typography variant="body1" component="span" sx={{ fontWeight: "bold", color: "white" }}>
                Welcome, {user?.username || "Loading..."}
              </Typography>
              <Button
                color="inherit"
                variant="contained"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#3CAEA3",
                  "&:hover": { backgroundColor: "#2E8E83" },
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#3CAEA3",
                  "&:hover": { backgroundColor: "#2E8E83" },
                }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/registration"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#3CAEA3",
                  "&:hover": { backgroundColor: "#2E8E83" },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
