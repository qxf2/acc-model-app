import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import {
  fetchACCModels,
  createACCModel,
  updateACCModel,
  deleteACCModel,
} from "../services/accModelService";
import AccModelForm from "../components/accModels/AccModelForm";
import AccModelList from "../components/accModels/AccModelList";
import ConfirmDialog from "../components/accModels/ConfirmDialog";

const AccModels = () => {
  const [models, setModels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState({
    name: "",
    description: "",
  });
  const [modelToDelete, setModelToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getACCModels = async () => {
      try {
        const data = await fetchACCModels();
        setModels(data);
      } catch (error) {
        console.error("Error fetching ACC models:", error);
      }
    };

    getACCModels();
  }, []);

  const handleOpenModal = (model = { name: "", description: "" }) => {
    setCurrentModel(model);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentModel({ name: "", description: "" });
    setErrorMessage("");
    setIsModalOpen(false);
  };

  const handleOpenDialog = (modelId) => {
    setModelToDelete(modelId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setModelToDelete(null);
    setIsDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentModel((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (currentModel.id) {
        await updateACCModel(currentModel.id, currentModel);
      } else {
        await createACCModel(currentModel);
      }
      const data = await fetchACCModels();
      setModels(data);
      handleCloseModal();
      setErrorMessage("");
    } catch (error) {
      console.error("Error saving ACC model:", error);
      if (error.response && error.response.status === 400) {
        setErrorMessage("ACC model with this name already exists.");
      } else {
        setErrorMessage("An error occurred while saving the model.");
      }
  }
};

  const handleDelete = async () => {
    try {
      await deleteACCModel(modelToDelete);
      const data = await fetchACCModels();
      setModels(data);
      handleCloseDialog();
    } catch (error) {
      console.error("Error deleting ACC model:", error);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ACC Models
      </Typography>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal()}
        >
          Create New ACC Model
        </Button>
      </Box>
      <AccModelList
        models={models}
        handleOpenModal={handleOpenModal}
        handleOpenDialog={handleOpenDialog}
      />
      <AccModelForm
        isOpen={isModalOpen}
        model={currentModel}
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

export default AccModels;
