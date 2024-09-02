import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { registerUser } from '../services/registerService';

const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission initiated.');
  
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      console.log('Passwords do not match.');
      return;
    }
  
    try {
      const userData = { username, email, designation, password };
      console.log('Sending user data:', userData);
  
      const response = await registerUser(userData);
  
      if (response.status === 201 || response.status === 200) {
        setSuccess("Registration successful! Please log in.");
        setError('');
        console.log('Registration successful.');
      } else {
        setError("Failed to register. Please try again.");
        console.log('Registration failed with status:', response.status);
      }
    } catch (err) {
      setError(err.message || "An error occurred during registration.");
      console.error('An error occurred:', err);
    }
  };
  

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="primary">{success}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Designation"
            fullWidth
            margin="normal"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Register
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default RegistrationForm;