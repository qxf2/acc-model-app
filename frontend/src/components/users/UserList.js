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
 * A React component for displaying a list of users.
 *
 * @param {Object[]} users - An array of user objects to display.
 * @param {Function} handleOpenModal - A function to be called when the user
 *   clicks the "Edit" button on a user. It should take the user being edited as
 *   an argument.
 * @param {Function} handleOpenDialog - A function to be called when the user
 *   clicks the "Delete" button on a user. It should take the id of the user being
 *   deleted as an argument.
 */
const UserList = ({ users, handleOpenModal, handleOpenDialog }) => {
  return (
    <Stack spacing={2} sx={{ maxWidth: "80%", ml: 0 }}>
      {users.map((user) => (
        <Card key={user.id} sx={(theme) => theme.customCard}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">{user.username}</Typography>
                <Typography color="textSecondary">{user.email}</Typography>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => handleOpenModal(user)}
                  sx={{ marginRight: 1 }} // Use MUI's spacing system
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => handleOpenDialog(user.id)}
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

export default UserList;
