import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { fetchAttributes, createAttribute, updateAttribute, deleteAttribute } from '../services/attributeService';
import AttributeForm from '../components/attributes/AttributeForm';
import AttributeList from '../components/attributes/AttributeList';
import ConfirmDialog from '../components/attributes/ConfirmDialog';

const Attributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState({ name: '', description: '' });
  const [attributeToDelete, setAttributeToDelete] = useState(null);

  useEffect(() => {
    const getAttributes = async () => {
      try {
        const data = await fetchAttributes();
        setAttributes(data);
      } catch (error) {
        console.error('Error fetching attributes:', error);
      }
    };

    getAttributes();
  }, []);

  const handleOpenModal = (attribute = { name: '', description: '' }) => {
    setCurrentAttribute(attribute);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentAttribute({ name: '', description: '' });
    setIsModalOpen(false);
  };

  const handleOpenDialog = (attributeId) => {
    setAttributeToDelete(attributeId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setAttributeToDelete(null);
    setIsDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAttribute((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (currentAttribute.id) {
        await updateAttribute(currentAttribute.id, currentAttribute);
      } else {
        await createAttribute(currentAttribute);
      }
      const data = await fetchAttributes();
      setAttributes(data);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving attribute:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAttribute(attributeToDelete);
      const data = await fetchAttributes();
      setAttributes(data);
      handleCloseDialog();
    } catch (error) {
      console.error('Error deleting attribute:', error);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
        Attributes
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 3, color: "#7f8c8d" }}>
        Attributes are the qualities or characteristics (adjectives) that describe the desired properties of your product, such as "Accuracy," 
        "Responsiveness," or "User-Friendly." They help define the key qualities that are important for your project.
      </Typography>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
          Create New Attribute
        </Button>
      </Box>
      <AttributeList attributes={attributes} handleOpenModal={handleOpenModal} handleOpenDialog={handleOpenDialog} />
      <AttributeForm
        isOpen={isModalOpen}
        attribute={currentAttribute}
        handleChange={handleChange}
        handleSave={handleSave}
        handleClose={handleCloseModal}
      />
      <ConfirmDialog
        isOpen={isDialogOpen}
        handleClose={handleCloseDialog}
        handleConfirm={handleDelete}
      />
    </Container>
  );
};

export default Attributes;
