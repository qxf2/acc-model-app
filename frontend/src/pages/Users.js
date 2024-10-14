import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";
import UserForm from "../components/users/UserForm";
import UserList from "../components/users/UserList";
import ConfirmDialog from "../components/users/ConfirmDialog";

/**
 * A React component for managing users.
 *
 * This component fetches a list of users from the server when it mounts,
 * and displays them in a list. It also provides a button to create a new user,
 * and a form to edit an existing user. The form is opened by clicking on a
 * user in the list. The form is also used to delete an existing user.
 *
 * @returns {JSX.Element} The rendered React component.
 */
const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [userToDelete, setUserToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getUsers();
  }, []);

  const handleOpenModal = (
    user = { username: "", email: "", password: "" }
  ) => {
    setCurrentUser(user);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentUser({ username: "", email: "", password: "" });
    setErrorMessage("");
    setIsModalOpen(false);
  };

  const handleOpenDialog = (userId) => {
    setUserToDelete(userId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setUserToDelete(null);
    setIsDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Saves the current user to the server.
   *
   * If the current user has an id, it will be updated. Otherwise, it will be created.
   * If the save is successful, the list of users is refetched and the modal is closed.
   * If an error occurs, an error message is displayed.
   */
  const handleSave = async () => {
    try {
      if (currentUser.id) {
        await updateUser(currentUser.id, currentUser);
      } else {
        await createUser(currentUser);
      }
      const data = await fetchUsers();
      setUsers(data);
      handleCloseModal();
      setErrorMessage("");
    } catch (error) {
      console.error("Error saving User:", error);
      if (error.response && error.response.status === 400) {
        setErrorMessage("User with this name already exists.");
      } else {
        setErrorMessage("An error occurred while saving the User.");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(userToDelete);
      const data = await fetchUsers();
      setUsers(data);
      handleCloseDialog();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Users
      </Typography>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal()}
        >
          Create New User
        </Button>
      </Box>
      <UserList
        users={users}
        handleOpenModal={handleOpenModal}
        handleOpenDialog={handleOpenDialog}
      />
      <UserForm
        isOpen={isModalOpen}
        user={currentUser}
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

export default Users;
