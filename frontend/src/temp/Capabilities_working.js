import React, { useEffect, useState } from 'react';
import {
  Typography,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

// Styles using styled API
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  minWidth: '250px',
  height: '100px',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'normal',
  padding: '10px',
}));

const CapabilitiesPage = () => {
  const [components, setComponents] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [componentsRes, attributesRes, capabilitiesRes] = await Promise.all([
          axios.get('/components/'),
          axios.get('/attributes/'),
          axios.get('/capabilities/'),
        ]);

        setComponents(componentsRes.data);
        setAttributes(attributesRes.data);
        setCapabilities(capabilitiesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredComponents = components.filter((component) =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = (componentId, attributeId) => {
    setSelectedComponent(componentId);
    setSelectedAttribute(attributeId);
    const existingCapability = capabilities.find(
      (cap) => cap.component_id === componentId && cap.attribute_id === attributeId
    );
    if (existingCapability) {
      setFormData({
        name: existingCapability.name,
        description: existingCapability.description,
      });
    } else {
      setFormData({ name: '', description: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedComponent('');
    setSelectedAttribute('');
    setFormData({ name: '', description: '' });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (formData.name.trim() === '' || !selectedComponent || !selectedAttribute) {
        alert('Please fill in all required fields.');
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        component_id: selectedComponent,
        attribute_id: selectedAttribute,
      };

      // Determine if we're creating a new capability or updating an existing one
      const existingCapability = capabilities.find(
        (cap) => cap.component_id === selectedComponent && cap.attribute_id === selectedAttribute
      );

      if (existingCapability) {
        // Update existing capability
        await axios.put(`/capabilities/${existingCapability.id}`, payload);
      } else {
        // Create new capability
        await axios.post('/capabilities/', payload);
      }

      // Refresh data
      const capabilitiesRes = await axios.get('/capabilities/');
      setCapabilities(capabilitiesRes.data);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again.');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Capabilities
      </Typography>
      {/* Search and Filter */}
      <div style={{ marginBottom: '20px' }}>
        <TextField
          label="Search Components"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <Button variant="contained">Filter</Button>
      </div>

      <TableContainer component={Paper} style={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>
                <Typography variant="h6">Component / Attribute</Typography>
              </StyledTableCell>
              {attributes.map((attribute) => (
                <StyledTableCell key={attribute.id}>
                  <Typography variant="subtitle1" sx={{ color: 'purple', fontWeight: 'bold' }}>
                    {attribute.name}
                  </Typography>
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredComponents.map((component) => (
              <TableRow key={component.id}>
                <StyledTableCell>
                  <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'blue' }}>
                    {component.name}
                  </Typography>
                </StyledTableCell>
                {attributes.map((attribute) => (
                  <StyledTableCell key={attribute.id}>
                    {capabilities
                      .filter(
                        (cap) =>
                          cap.component_id === component.id &&
                          cap.attribute_id === attribute.id
                      )
                      .map((cap) => (
                        <Typography key={cap.id} sx={{ fontWeight: 'bold' }}>
                          {cap.name}
                        </Typography>
                      ))}
                    <IconButton onClick={() => handleOpen(component.id, attribute.id)}>
                      <EditIcon />
                    </IconButton>
                  </StyledTableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedComponent && selectedAttribute ? 'Edit Capability' : 'Add Capability'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            select
            label="Component"
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value)}
            fullWidth
            variant="outlined"
            margin="dense"
          >
            {components.map((comp) => (
              <MenuItem key={comp.id} value={comp.id}>
                {comp.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Attribute"
            value={selectedAttribute}
            onChange={(e) => setSelectedAttribute(e.target.value)}
            fullWidth
            variant="outlined"
            margin="dense"
          >
            {attributes.map((attr) => (
              <MenuItem key={attr.id} value={attr.id}>
                {attr.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CapabilitiesPage;
