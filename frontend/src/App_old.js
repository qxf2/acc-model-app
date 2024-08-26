import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import ACCModels from './pages/ACCModels';
import Components from './pages/Components';
import Capabilities from './pages/Capabilities';
import Attributes from './pages/Attributes';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Login from './pages/Login';
import theme from './theme'; 

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const setTokenAndStore = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" style={{ flexGrow: 1 }}>
                Home
              </Typography>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/acc-models">
                ACC Models
              </Button>
              <Button color="inherit" component={Link} to="/components">
                Components
              </Button>
              <Button color="inherit" component={Link} to="/attributes">
                Attributes
              </Button>
              <Button color="inherit" component={Link} to="/capabilities">
                Capabilities
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
              {!token ? (
                <>
                  <Button color="inherit" component={Link} to="/register">
                    Register
                  </Button>
                  <Button color="inherit" component={Link} to="/login">
                    Login
                  </Button>
                </>
              ) : (
                <Button color="inherit" onClick={logout}>
                  Logout
                </Button>
              )}
            </Toolbar>
          </AppBar>
          <Routes>
            <Route path="/dashboard" element={<Dashboard token={token}/>} />
            <Route path="/acc-models" element={<ACCModels />} />
            <Route path="/components" element={<Components />} />
            <Route path="/capabilities" element={<Capabilities token={token}/>} />
            <Route path="/attributes" element={<Attributes />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/login"
              element={<Login setToken={setTokenAndStore} />}
            />
            <Route path="/" element={<Dashboard token={token}/>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
