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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentUser({ username: "", email: "", password: "" });
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
    } catch (error) {
      console.error("Error saving user:", error);
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
