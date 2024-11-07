import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
} from "@mui/material";

/**
 * The component renders a list of components, each with its associated
 * capabilities. The component also renders a "Create New Capability" button
 * for each component.
 */
const CapabilityList = ({
  components,
  capabilities,
  onEdit,
  onDelete,
  onCreate,
}) => {
  return (
    <Stack spacing={4} sx={{ maxWidth: "80%", ml: 0 }}>
      {components.map((component) => (
        <Box key={component.id}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" style={{ color: "#1B3A34", fontSize: "1.5rem" }} gutterBottom>
              {component.name}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onCreate(component.id)}
            >
              Create New Capability
            </Button>
          </Box>
          <Stack spacing={2}>
            {capabilities[component.id] &&
              capabilities[component.id].map((capability) => (
                <Card key={capability.id} sx={(theme) => theme.customCard}>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="h6">
                          {capability.name}
                        </Typography>
                        <Typography color="textSecondary">
                          {capability.description}
                        </Typography>
                      </Box>
                      <Box>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => onEdit(component.id, capability)}
                          sx={{ marginRight: 1 }} // Use MUI's spacing system
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() =>
                            onDelete(capability.id, component.id)
                          }
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default CapabilityList;
