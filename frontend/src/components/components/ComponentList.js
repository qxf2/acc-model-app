import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Button,
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
    <Grid container spacing={2}>
      {components.map((component) => (
        <Grid item xs={12} key={component.id}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
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
                    style={{ marginRight: "8px" }}
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
        </Grid>
      ))}
    </Grid>
  );
};

export default ComponentList;
