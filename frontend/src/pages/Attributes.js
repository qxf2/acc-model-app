import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import {
  fetchAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "../services/attributeService";
import AttributeForm from "../components/attributes/AttributeForm";
import AttributeList from "../components/attributes/AttributeList";
import ConfirmDialog from "../components/attributes/ConfirmDialog";


/**
 * A React component for displaying and managing attributes.
 *
 * The component provides a list of all attributes, a form for creating new
 * attributes and editing existing ones, and a confirm dialog for deleting
 * attributes.
 *
 * The attributes are fetched from the server when the component mounts and are
 * stored in the component's state. The component also provides functions for
 * creating, updating, and deleting attributes.
 */
const Attributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState({
    name: "",
    description: "",
  });
  const [attributeToDelete, setAttributeToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getAttributes = async () => {
      try {
        const data = await fetchAttributes();
        setAttributes(data);
      } catch (error) {
        console.error("Error fetching attributes:", error);
      }
    };

    getAttributes();
  }, []);

  const handleOpenModal = (attribute = { name: "", description: "" }) => {
    setCurrentAttribute(attribute);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentAttribute({ name: "", description: "" });
    setErrorMessage("");
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

  /**
   * Saves the current attribute to the server.
   *
   * If the current attribute has an id, it will be updated. Otherwise, it will be created.
   * If the save is successful, the list of attributes is refetched and the modal is closed.
   * If an error occurs, an error message is displayed.
   */
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
      setErrorMessage("");
    } catch (error) {
      console.error("Error saving attribute:", error);
      if (error.response && error.response.status === 400) {
        setErrorMessage("Attribute with this name already exists.");
      } else {
        setErrorMessage("An error occurred while saving the Attribute.");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAttribute(attributeToDelete);
      const data = await fetchAttributes();
      setAttributes(data);
      handleCloseDialog();
    } catch (error) {
      console.error("Error deleting attribute:", error);
    }
  };

  return (
    <Container maxWidth="xl" classname="custom-container">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "primary.main" }}
      >
        Attributes
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 3, color: "#7f8c8d" }}>
        Attributes are the qualities or characteristics (adjectives) that
        describe the desired properties of your product, such as "Accuracy," or
        "Responsiveness." <br />They help define the key qualities
        that are important for your project.
      </Typography>
      <Box display="flex" justifyContent="flex-start" mt={1} mb={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal()}
        >
          Create New Attribute
        </Button>
      </Box>
      <AttributeList
        attributes={attributes}
        handleOpenModal={handleOpenModal}
        handleOpenDialog={handleOpenDialog}
      />
      <AttributeForm
        isOpen={isModalOpen}
        attribute={currentAttribute}
        handleChange={handleChange}
        handleSave={handleSave}
        handleClose={handleCloseModal}
        errorMessage={errorMessage}
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
