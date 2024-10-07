import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";

/**
 * A React component for displaying a list of attributes.
 *
 * @param {Object[]} attributes - An array of attribute objects to display.
 * @param {Function} handleOpenModal - A function to be called when the user
 *   clicks the "Edit" button on an attribute. It should take the attribute
 *   being edited as an argument.
 * @param {Function} handleOpenDialog - A function to be called when the user
 *   clicks the "Delete" button on an attribute. It should take the id of the
 *   attribute being deleted as an argument.
 */
const AttributeList = ({ attributes, handleOpenModal, handleOpenDialog }) => {
  return (
    <Grid container spacing={2}>
      {attributes.map((attribute) => (
        <Grid item xs={12} key={attribute.id}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6">{attribute.name}</Typography>
                  <Typography color="textSecondary">
                    {attribute.description}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenModal(attribute)}
                    style={{ marginRight: "8px" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => handleOpenDialog(attribute.id)}
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

export default AttributeList;
