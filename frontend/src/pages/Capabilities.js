import React, { useEffect, useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import AccModelSelector from "../components/capabilities/AccModelSelector";
import CapabilityForm from "../components/capabilities/CapabilityForm";
import CapabilityList from "../components/capabilities/CapabilityList";
import ConfirmDialog from "../components/capabilities/ConfirmDialog";
import {
  fetchACCModels,
  fetchComponents,
  fetchCapabilities,
  createCapability,
  updateCapability,
  deleteCapability,
} from "../services/capabilitiesService";


/**
 * A React component for displaying and editing capabilities for a selected
 * ACC model.
 *
 * The component displays a list of components for the selected ACC model,
 * and for each component, it displays a list of capabilities. The user can
 * create a new capability, edit an existing capability, or delete a capability.
 * The component also displays a confirmation dialog when the user clicks the
 * delete button.
 *
 * The component fetches the list of ACC models and the list of components for
 * the selected ACC model from the server when it mounts.
 *
 * @returns {JSX.Element} The rendered React component.
 */
const Capabilities = () => {
  const [accModels, setAccModels] = useState([]);
  const [selectedAccModel, setSelectedAccModel] = useState("");
  const [components, setComponents] = useState([]);
  const [capabilities, setCapabilities] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCapability, setCurrentCapability] = useState({
    name: "",
    description: "",
    component_id: "",
  });
  const [capabilityToDelete, setCapabilityToDelete] = useState(null);
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

          const capabilitiesData = {};
          for (const component of data) {
            const caps = await fetchCapabilities(component.id);
            capabilitiesData[component.id] = caps;
          }
          setCapabilities(capabilitiesData);
        } catch (error) {
          console.error("Error fetching components:", error);
        }
      };

      getComponents();
    }
  }, [selectedAccModel]);

  const handleOpenModal = (
    componentId,
    capability = { name: "", description: "", component_id: componentId }
  ) => {
    setCurrentCapability(capability);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentCapability({ name: "", description: "", component_id: "" });
    setErrorMessage("");
    setIsModalOpen(false);
  };

  const handleOpenDialog = (capabilityId, componentId) => {
    setCapabilityToDelete(capabilityId);
    setCurrentCapability((prev) => ({
      ...prev,
      component_id: componentId,
    }));
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCapabilityToDelete(null);
    setIsDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCapability((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Saves the current capability to the server.
   *
   * If the current capability has an id, it will be updated. Otherwise, it will be created.
   * If the save is successful, the list of capabilities is refetched and the modal is closed.
   * If an error occurs, an error message is displayed.
   */
  const handleSave = async () => {
    try {
      if (currentCapability.id) {
        await updateCapability(currentCapability.id, currentCapability);
      } else {
        await createCapability(currentCapability);
      }

      const updatedCapabilities = await fetchCapabilities(
        currentCapability.component_id
      );
      setCapabilities((prev) => ({
        ...prev,
        [currentCapability.component_id]: updatedCapabilities,
      }));
      setErrorMessage("");
      handleCloseModal();
    } catch (error) {
      console.error("Error saving capability:", error);
      if (error.response && error.response.status === 400) {
        setErrorMessage("Capability with this name already exists.");
      } else {
        setErrorMessage("An error occurred while saving the capability.");
      }
    }
  };
    

  const handleDelete = async () => {
    try {
      await deleteCapability(capabilityToDelete);

      const updatedCapabilities = await fetchCapabilities(
        currentCapability.component_id
      );
      setCapabilities((prevCapabilities) => ({
        ...prevCapabilities,
        [currentCapability.component_id]: updatedCapabilities,
      }));

      handleCloseDialog();
    } catch (error) {
      console.error("Error deleting capability:", error);
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
        Capabilities
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 3, color: "#7f8c8d" }}>
        Capabilities are the specific features or functionalities (verbs) that
        each Component has, such as "Add User", "Process Payment." etc. <br /> They
        help define what each Component can do.
      </Typography>

      <Box display="flex" justifyContent="flex-start" mb={3}>
      <AccModelSelector
        accModels={accModels}
        selectedAccModel={selectedAccModel}
        onSelectAccModel={setSelectedAccModel}
      />
      </Box>

      <CapabilityList
        components={components}
        capabilities={capabilities}
        onEdit={handleOpenModal}
        onDelete={handleOpenDialog}
        onCreate={handleOpenModal}
      />
      <CapabilityForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        capability={currentCapability}
        onChange={handleChange}
        onSave={handleSave}
        errorMessage={errorMessage}
      />
      <ConfirmDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleDelete}
      />
    </Container>
  );
};

export default Capabilities;
