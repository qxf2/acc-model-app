import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress 
} from '@mui/material';
import { styled } from '@mui/system';

const Dashboard = () => {
  const [capabilities, setCapabilities] = useState([]);
  const [components, setComponents] = useState({});
  const [attributes, setAttributes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [capabilitiesResponse, componentsResponse, attributesResponse] = await Promise.all([
        axios.get('/capabilities'),
        axios.get('/components'),
        axios.get('/attributes'),
      ]);

      const organizedCapabilities = organizeCapabilitiesData(capabilitiesResponse.data);
      setCapabilities(organizedCapabilities);
      setComponents(mapById(componentsResponse.data));
      setAttributes(mapById(attributesResponse.data));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const mapById = (dataArray) => {
    const map = {};
    dataArray.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  };

  const organizeCapabilitiesData = (data) => {
    const organizedData = {};

    data.forEach((capability) => {
      const { component_id, attribute_id, name, description, rating, id } = capability;

      if (!organizedData[component_id]) {
        organizedData[component_id] = { attributes: {} };
      }
      if (!organizedData[component_id].attributes[attribute_id]) {
        organizedData[component_id].attributes[attribute_id] = [];
      }
      organizedData[component_id].attributes[attribute_id].push({ id, name, description, rating });
    });

    return organizedData;
  };

  if (loading) {
    return <CircularProgress />;
  }

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.action.hover,
  }));

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Green':
        return '#4caf50'; // Green
      case 'Yellow':
        return '#ffeb3b'; // Yellow
      case 'Red':
        return '#f44336'; // Red
      default:
        return 'transparent';
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Component</StyledTableCell>
              {Object.keys(attributes).map(attributeId => (
                <StyledTableCell key={attributeId}>
                  {attributes[attributeId]?.name}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(components).map(componentId => (
              <StyledTableRow key={componentId}>
                <StyledTableCell>{components[componentId]?.name}</StyledTableCell>
                {Object.keys(attributes).map(attributeId => (
                  <TableCell key={attributeId}>
                    {capabilities[componentId]?.attributes[attributeId]?.map(capability => (
                      <div key={capability.id} style={{ backgroundColor: getRatingColor(capability.rating), padding: '8px', borderRadius: '4px', marginBottom: '4px' }}>
                        <Typography variant="body1" fontWeight="bold">
                          {capability.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {capability.description}
                        </Typography>
                      </div>
                    ))}
                  </TableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Dashboard;
