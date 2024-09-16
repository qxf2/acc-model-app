import React, { useState } from "react";
import { Button, TextField, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login } from "../services/loginService";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { access_token } = await login(username, password);

      // Token expiration time is 300 minutes (5 hours)
      const EXPIRATION_TIME_MINUTES = 300;
      const expirationTimestamp =
        Date.now() + EXPIRATION_TIME_MINUTES * 60 * 1000;

      localStorage.setItem("authToken", access_token);
      localStorage.setItem("tokenExpiry", expirationTimestamp);

      console.log("Token expiry time", expirationTimestamp);
      onLoginSuccess();
      navigate("/");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        fullWidth
        style={{ marginTop: "1rem" }}
      >
        Login
      </Button>
    </Container>
  );
};

export default Login;
