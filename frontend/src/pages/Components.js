import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import {
  fetchACCModels,
  fetchComponents,
  createComponent,
  updateComponent,
  deleteComponent,
} from "../services/componentService";
import ComponentForm from "../components/components/ComponentForm";
import ComponentList from "../components/components/ComponentList";
import AccModelSelector from "../components/components/AccModelSelector";
import ConfirmDialog from "../components/components/ConfirmDialog";

const Components = () => {
  const [accModels, setAccModels] = useState([]);
  const [selectedAccModel, setSelectedAccModel] = useState("");
  const [components, setComponents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentComponent, setCurrentComponent] = useState({
    name: "",
    description: "",
  });
  const [componentToDelete, setComponentToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getACCModels = async () => {
      try {
        const data = await fetchACCModels();
        setAccModels(data);
      } catch (error) {
        console.error("Error fetching ACC models:", error);
      }
    };

    getACCModels();
  }, []);

  useEffect(() => {
    if (selectedAccModel) {
      const getComponents = async () => {
        try {
          const data = await fetchComponents(selectedAccModel);
          setComponents(data);
        } catch (error) {
          console.error("Error fetching components:", error);
        }
      };

      getComponents();
    }
  }, [selectedAccModel]);

  const handleOpenModal = (
    component = { name: "", description: "", acc_model_id: selectedAccModel }
  ) => {
    setCurrentComponent(component);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentComponent({
      name: "",
      description: "",
      acc_model_id: selectedAccModel,
    });
    setErrorMessage("");
    setIsModalOpen(false);
  };

  const handleOpenDialog = (componentId) => {
    setComponentToDelete(componentId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setComponentToDelete(null);
    setIsDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentComponent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (currentComponent.id) {
        await updateComponent(currentComponent.id, currentComponent);
      } else {
        await createComponent(currentComponent);
      }
      const data = await fetchComponents(selectedAccModel);
      setComponents(data);
      handleCloseModal();
    } catch (error) {
      console.error("Error saving component:", error);
      if (error.response && error.response.status === 400) {
        setErrorMessage("Component with this name already exists.");
      } else {
        setErrorMessage("An error occurred while saving the component.");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComponent(componentToDelete);
      const data = await fetchComponents(selectedAccModel);
      setComponents(data);
      handleCloseDialog();
    } catch (error) {
      console.error("Error deleting component:", error);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "2rem" }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "primary.main" }}
      >
        Components
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 3, color: "#7f8c8d" }}>
        Components are the major sections or building blocks (nouns) of your
        product such as "User Management," "Shopping Cart," etc. They represent
        the core structural pieces that make up the project.
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Remember to create an ACC Model first before listing components.
      </Typography>

      <AccModelSelector
        accModels={accModels}
        selectedAccModel={selectedAccModel}
        handleSelect={setSelectedAccModel}
      />

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal()}
          disabled={!selectedAccModel}
        >
          Create New Component
        </Button>
      </Box>

      <ComponentList
        components={components}
        handleOpenModal={handleOpenModal}
        handleOpenDialog={handleOpenDialog}
      />
      <ComponentForm
        isOpen={isModalOpen}
        component={currentComponent}
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

export default Components;