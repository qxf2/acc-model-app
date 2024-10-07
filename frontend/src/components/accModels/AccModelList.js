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
 * A React component for displaying a list of ACC models.
 *
 * @param {Object[]} models - An array of ACC model objects to display.
 * @param {Function} handleOpenModal - A function to be called when the user
 *   clicks the "Edit" button on an ACC model. It should take the ACC model
 *   being edited as an argument.
 * @param {Function} handleOpenDialog - A function to be called when the user
 *   clicks the "Delete" button on an ACC model. It should take the id of the
 *   ACC model being deleted as an argument.
 */
const AccModelList = ({ models, handleOpenModal, handleOpenDialog }) => {
  return (
    <Grid container spacing={2}>
      {models.map((model) => (
        <Grid item xs={12} key={model.id}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6">{model.name}</Typography>
                  <Typography color="textSecondary">
                    {model.description}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenModal(model)}
                    style={{ marginRight: "8px" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => handleOpenDialog(model.id)}
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

export default AccModelList;
