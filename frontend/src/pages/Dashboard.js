import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import axios from 'axios';

const Dashboard = ({ token }) => {
    const [capabilities, setCapabilities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCapabilities = async () => {
            try {
                const response = await axios.get('http://localhost:8000/capabilities/?limit=100', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setCapabilities(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching capabilities:', error);
            }
        };
        fetchCapabilities();
    }, [token]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container component="main" maxWidth="md">
            <Typography component="h1" variant="h5" gutterBottom>
                Capabilities
            </Typography>
            <List>
                {capabilities.map((capability) => (
                    <ListItem key={capability.id}>
                        <ListItemText primary={capability.name} secondary={capability.description} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default Dashboard;
