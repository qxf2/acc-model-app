import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
} from "@mui/material";

/**
 * A React component for displaying a list of components.
 *
 * @param {Object[]} components - An array of component objects to display.
 * @param {Function} handleOpenModal - A function to be called when the user
 *   clicks the "Edit" button on a component. It should take the component
 *   being edited as an argument.
 * @param {Function} handleOpenDialog - A function to be called when the user
 *   clicks the "Delete" button on a component. It should take the id of the
 *   component being deleted as an argument.
 */
const ComponentList = ({ components, handleOpenModal, handleOpenDialog }) => {
  return (
    <Stack spacing={2} sx={{ maxWidth: "80%", ml: 0 }}>
      {components.map((component) => (
        <Card key={component.id} sx={(theme) => theme.customCard}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">{component.name}</Typography>
                <Typography color="textSecondary">
                  {component.description}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => handleOpenModal(component)}
                  sx={{ marginRight: 1 }} // Use MUI's spacing system
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => handleOpenDialog(component.id)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default ComponentList;
