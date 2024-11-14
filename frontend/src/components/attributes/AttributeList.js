import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
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
    <Stack spacing={2} sx={{ maxWidth: "80%", ml: 0 }}> {/* Left-aligned */}
      {attributes.map((attribute) => (
        <Card
          key={attribute.id}
          sx={(theme) => theme.customCard} // Custom card style from theme
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">{attribute.name}</Typography>
                <Typography color="textSecondary">{attribute.description}</Typography>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => handleOpenModal(attribute)}
                  sx={{ marginRight: 1 }} // Use MUI's spacing system
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
      ))}
    </Stack>
  );
};

export default AttributeList;
