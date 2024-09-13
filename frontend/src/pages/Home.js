import React from "react";
import {
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Box,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Settings, ListAlt, Assessment } from "@mui/icons-material";

const Home = () => {
  return (
    <Container>
      {/* Hero Section */}
      <Box sx={{ padding: 6, marginBottom: 6, borderRadius: "8px" }}>
        <Typography
          variant="h3"
          align="center"
          sx={{ fontWeight: "bold", color: "#2c3e50", marginBottom: 2 }}
        >
          Streamline your software evaluation.
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{ color: "#7f8c8d", marginBottom: 4 }}
        >
          Effortlessly build a structured{" "}
          <MuiLink href="https://qxf2.com/where-start-testing" target="_blank" sx={{ textDecoration: "none", color: "#3498db" }}>
            ACC model
          </MuiLink>{" "}
          offering clarity and coverage for effective testing.
        </Typography>
        
        <Typography variant="h6" align="center" gutterBottom>
            To get started, please{" "}
            <MuiLink href="/registration" sx={{ textDecoration: "none", color: "#3498db" }}>
              register
            </MuiLink>{" "}
            or{" "}
            <MuiLink href="/token" sx={{ textDecoration: "none", color: "#3498db" }}>
              login
            </MuiLink>{" "}
            if you already have an account.
            <br />
            Then, begin by defining Attributes, Components, and Capabilities for your project.
          </Typography>

      </Box>

      {/* Main Sections */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "#2980b9", marginBottom: 4 }}
      >
        Core Functions
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              boxShadow: 3,
              minHeight: "220px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "0.3s",
              "&:hover": { 
                boxShadow: 6,
                border: '2px solid #3498db',
              },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box display="flex" alignItems="center" marginBottom={2}>
                  <Settings
                    color="primary"
                    fontSize="large"
                    sx={{ marginRight: 2 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#34495e" }}
                  >
                    Define Attributes
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Specify the core qualities that describe your product.
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                sx={{ marginTop: "auto" }}
              >
                <Button
                  component={Link}
                  to="/attributes"
                  variant="contained"
                  sx={{
                    backgroundColor: "#3498db",
                    "&:hover": {
                      backgroundColor: "#2980b9",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  Go to Attributes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              boxShadow: 3,
              minHeight: "220px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "0.3s",
              "&:hover": { 
                boxShadow: 6,
                border: "1px solid #3498db"
              },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box display="flex" alignItems="center" marginBottom={2}>
                  <ListAlt
                    color="primary"
                    fontSize="large"
                    sx={{ marginRight: 2 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#34495e" }}
                  >
                    List Components
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Break down your project into major sections or modules.
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                sx={{ marginTop: "auto" }}
              >
                <Button
                  component={Link}
                  to="/components"
                  variant="contained"
                  sx={{
                    backgroundColor: "#3498db",
                    "&:hover": { 
                      backgroundColor: "#2980b9",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  Go to Components
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              boxShadow: 3,
              minHeight: "220px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "0.3s",
              "&:hover": { 
                boxShadow: 6,
                border: '2px solid #3498db',
              },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box display="flex" alignItems="center" marginBottom={2}>
                  <Assessment
                    color="primary"
                    fontSize="large"
                    sx={{ marginRight: 2 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#34495e" }}
                  >
                    Map Capabilities
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Identify the features of each component.
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                sx={{ marginTop: "auto" }}
              >
                <Button
                  component={Link}
                  to="/capabilities"
                  variant="contained"
                  sx={{
                    backgroundColor: "#3498db",
                    "&:hover": { 
                      backgroundColor: "#2980b9",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  Go to Capabilities
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assessment Section */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "#2980b9", marginTop: 6 }}
      >
        Assess Your Project
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              boxShadow: 3,
              minHeight: "220px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "0.3s",
              "&:hover": { 
                boxShadow: 6,
                border: '2px solid #3498db',
              },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box display="flex" alignItems="center" marginBottom={2}>
                  <Assessment
                    color="primary"
                    fontSize="large"
                    sx={{ marginRight: 2 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#34495e" }}
                  >
                    Rate Capabilities
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Evaluate and rate the effectiveness of each capability.
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                sx={{ marginTop: "auto" }}
              >
                <Button
                  component={Link}
                  to="/ratings"
                  variant="contained"
                  sx={{
                    backgroundColor: "#3498db",
                    "&:hover": { 
                      backgroundColor: "#2980b9",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  Go to Ratings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              boxShadow: 3,
              minHeight: "220px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "0.3s",
              "&:hover": { 
                boxShadow: 6,
                border: '2px solid #3498db',
             },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box display="flex" alignItems="center" marginBottom={2}>
                  <Assessment
                    color="primary"
                    fontSize="large"
                    sx={{ marginRight: 2 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#34495e" }}
                  >
                    View Ratings
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  See a consolidated view of ratings to understand overall
                  performance and areas for improvement.
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                sx={{ marginTop: "auto" }}
              >
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="contained"
                  sx={{
                    backgroundColor: "#3498db",
                    "&:hover": { 
                      backgroundColor: "#2980b9",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  Go to Dashboard
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box
            sx={{ padding: 2, marginTop: 6, textAlign: "center", color: "black" }}
          >
            <Typography variant="body2">
              Developed by{" "}
              <MuiLink 
                href="https://www.qxf2.com"
                target="_blank"
                color="inherit"
              >
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
