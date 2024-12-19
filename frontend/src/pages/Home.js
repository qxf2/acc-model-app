import React from "react";
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";
import FeatureFlagService from "../services/featureFlagService";
import { useFlags } from "launchdarkly-react-client-sdk";

const styles = {
  heroSection: {
    backgroundColor: "#708C70", // Sage green color
    width: "100vw",
    minHeight: "50vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    position: "relative",
    left: "50%",
    marginLeft: "-50vw",
    padding: "4rem 2rem",
    textAlign: "center",
  },
  mainContainer: {
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden",
  },
  actionButton: {
    margin: "0.5rem 1rem",
    padding: "0.5rem 2rem",
    backgroundColor: "#D1C6AD",
    color: "#34495e",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#B0A17F",
    },
  },
};

const Home = ({ isAuthenticated }) => {

  //const hideAuthButtons = FeatureFlagService.getFlagValue("hideAuthButtons");
  const { hideAuthButtons } = useFlags();
  console.log("hideAuthButton value:", hideAuthButtons);

  return (
    <Container style={styles.mainContainer}>
      {/* Hero Section */}
      <Box sx={styles.heroSection}>
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "#ffffff" }}>
          Simplify Your Software Evaluation
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: "#f0f0f0", maxWidth: "75%"}}
        >
          Effortlessly build a structured ACC model offering clarity and
          coverage for effective testing.
        </Typography>
        {!isAuthenticated && !hideAuthButtons && (
        <Box display="flex" justifyContent="center" gap={2} sx={{marginBottom: "2rem", marginTop: "2rem" }}>
          <Button
            component={Link}
            to="/registration"
            variant="contained"
            sx={styles.actionButton}
          >
            Register
          </Button>
          <Button
            component={Link}
            to="/token"
            variant="contained"
            sx={styles.actionButton}
          >
            Login
          </Button>
        </Box>
        )}
        <Typography
          variant="body1"
          sx={{ color: "#FCFCFC", maxWidth: "80%"}}
        >
          Start by creating an ACC Model, then define key Attributes, add
          Components, and map Capabilities.
        </Typography>
        <Button
            component={Link}
            to="/acc-models"
            variant="contained"
            sx={styles.actionButton}
          >
            Get Started
          </Button>
      </Box>

      {/* Main Content - Features Section */}
      <Box sx={{ backgroundColor: "#f8f8f8", padding: "4rem 2rem" }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                padding: 2,
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", marginBottom: 1 }}
              >
                Submit Ratings
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Rate and evaluate each component for accurate insights.
              </Typography>
              <Button
                component={Link}
                to="/ratings"
                variant="contained"
                sx={{ marginTop: 2, backgroundColor: "#708C70" }}
              >
                Go to Ratings
              </Button>
            </Box>
          </Grid>

          {/* New Feature Card for Dashboard */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                padding: 2,
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", marginBottom: 1 }}
              >
                Dashboard
              </Typography>
              <Typography variant="body2" color="textSecondary">
                View a comprehensive overview of your project ratings.
              </Typography>
              <Button
                component={Link}
                to="/dashboard"
                variant="contained"
                sx={{ marginTop: 2, backgroundColor: "#708C70" }}
              >
                Go to Dashboard
              </Button>
            </Box>
          </Grid>

          {/* New Feature Card for Ratings Trends */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                padding: 2,
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", marginBottom: 1 }}
              >
                Ratings Trends
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Track ratings over time and analyze historical data.
              </Typography>
              <Button
                component={Link}
                to="/historical-comparison"
                variant="contained"
                sx={{ marginTop: 2, backgroundColor: "#708C70" }}
              >
                Go to Trends
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{ padding: 2, marginTop: 6, textAlign: "center", color: "black" }}
      >
        <Typography variant="body2">
          Developed by{" "}
          <MuiLink href="https://www.qxf2.com" target="_blank" color="inherit">
            Qxf2 Services
          </MuiLink>{" "}
          |{" "}
          <MuiLink
            href="https://github.com/qxf2/acc-model-app"
            target="_blank"
            color="inherit"
          >
            GitHub
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
