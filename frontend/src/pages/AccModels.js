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

/**
 * A React component for displaying a list of ACC models.
 *
 * This component fetches a list of ACC models from the server when it mounts,
 * and displays them in a list. It also provides a button to create a new ACC
 * model, and a form to edit an existing ACC model. The form is opened by
 * clicking on an ACC model in the list. The form is also used to delete an
 * ACC model.
 *
 * @returns {JSX.Element} The rendered React component.
 */
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

  /**
   * Saves the current ACC model to the server.
   *
   * If the current ACC model has an id, it will be updated. Otherwise, it will be created.
   * If the save is successful, the list of ACC models is refetched and the modal is closed.
   * If an error occurs, an error message is displayed.
   */
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
    <Container maxWidth="xl" classname="custom-container">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "primary.main" }}
      >
        ACC Models
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 3, color: "#7f8c8d" }}>
        ACC Models are the starting point that ties everything together.
      </Typography>
      <Box display="flex" justifyContent="flex-start" mt={1} mb={3}>
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
