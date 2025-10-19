// src/components/AdminUsers.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Table,
  Sheet,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  Input,
  Select,
  Option,
  IconButton,
  Button,
  useTheme,
} from "@mui/joy";
import { toast } from "sonner";
import { adminAPI } from "../services/api";
import { Pencil, Trash2, Key, Plus } from "lucide-react";

const AdminUsers = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    full_name: "",
    role: "user",
    email: "",
    branch: "",
    password: "",
    confirmPassword: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers(page, pageSize);
      setUsers(res.data || []);
      setTotalUsers(res.total || 0);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setOpenEdit(true);
  };

  const handleSave = async () => {
    try {
      await adminAPI.updateUser(editUser.id, {
        full_name: editUser.full_name,
        role: editUser.role,
      });
      //toast.success("User updated successfully");
      setOpenEdit(false);
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminAPI.deleteUser(userId);
      //toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleAddUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      await adminAPI.createUser(newUser);
      //toast.success("User added successfully");
      setAddUser(false);
      setNewUser({
        username: "",
        full_name: "",
        role: "user",
        email: "",
        branch: "",
        password: "",
        confirmPassword: "",
      });
      fetchUsers();
    } catch {
      toast.error("Failed to add user");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) return toast.error("Password cannot be empty");
    if (newPassword !== confirmNewPassword) return toast.error("Passwords do not match");
    try {
      await adminAPI.resetPassword(resetUser.id, newPassword);
      //toast.success("Password reset successfully");
      setResetUser(null);
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      toast.error("Password reset failed");
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography>Loading users...</Typography>
      </Box>
    );
  }

  const renderFormFields = (fields, state, setState) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      {fields.map((field) => (
        <FormControl sx={{ mb: 2 }} key={field.key}>
          <Typography level="body-sm">{field.label}</Typography>
          {field.type === "select" ? (
            <Select value={state[field.key]} onChange={(e, val) => setState({ ...state, [field.key]: val })}>
              {field.options.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          ) : (
            <Input
              type={field.type}
              value={state[field.key]}
              onChange={(e) => setState({ ...state, [field.key]: e.target.value })}
            />
          )}
        </FormControl>
      ))}
    </Box>
  );

  const addUserFields = [
    { key: "full_name", label: "Full Name", type: "text" },
    { key: "username", label: "Username", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "branch", label: "Branch", type: "text" },
    {
      key: "role",
      label: "Role",
      type: "select",
      options: [
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
      ],
    },
    { key: "password", label: "Password", type: "password" },
    { key: "confirmPassword", label: "Confirm Password", type: "password" },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography level="h4" fontWeight={700}>
          👥 User Management
        </Typography>
        <Button startDecorator={<Plus />} variant="solid" color="primary" onClick={() => setAddUser(true)}>
          Add User
        </Button>
      </Box>

      {/* USERS TABLE */}
      <Card variant="outlined" sx={{ p: 2 }}>
        <Sheet variant="soft">
          <Box sx={{ maxHeight: "500px", overflowY: "auto" }}>
            <Table hoverRow stickyHeader>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.full_name}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.branch}</td>
                    <td>{u.role}</td>
                    <td>
                      <Stack direction="row" spacing={0.5} sx={{ position: "sticky", right: 0 }}>
                        <IconButton size="sm" variant="outlined" color="primary" onClick={() => handleEdit(u)} title="Edit">
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton size="sm" variant="outlined" color="danger" onClick={() => handleDelete(u.id)} title="Delete">
                          <Trash2 size={16} />
                        </IconButton>
                        <IconButton size="sm" variant="outlined" color="warning" onClick={() => setResetUser(u)} title="Reset Password">
                          <Key size={16} />
                        </IconButton>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>

          {/* PAGINATION */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Typography level="body2" sx={{ alignSelf: "center" }}>
              Page {page} of {totalPages}
            </Typography>
            <Button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </Stack>
        </Sheet>
      </Card>

      {/* ADD USER MODAL */}
      {addUser && (
        <Modal open={addUser} onClose={() => setAddUser(false)}>
          <ModalDialog sx={{ maxHeight: "80vh", overflowY: "auto", p: 3 }}>
            <ModalClose />
            <Typography level="h5" mb={2}>
              Add New User
            </Typography>
            {renderFormFields(addUserFields, newUser, setNewUser)}
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" color="neutral" onClick={() => setAddUser(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
          <ModalDialog sx={{ maxHeight: "80vh", overflowY: "auto", p: 3 }}>
            <ModalClose />
            <Typography level="h5" mb={2}>
              Edit User
            </Typography>
            {renderFormFields(
              [
                { key: "full_name", label: "Full Name", type: "text" },
                {
                  key: "role",
                  label: "Role",
                  type: "select",
                  options: [
                    { value: "user", label: "User" },
                    { value: "admin", label: "Admin" },
                  ],
                },
              ],
              editUser,
              setEditUser
            )}
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" color="neutral" onClick={() => { setOpenEdit(false); setEditUser(null); }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetUser && (
        <Modal open={!!resetUser} onClose={() => setResetUser(null)}>
          <ModalDialog sx={{ maxHeight: "50vh", overflowY: "auto", p: 3 }}>
            <ModalClose />
            <Typography level="h5" mb={2}>
              Reset Password for {resetUser.full_name}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl sx={{ mb: 2, flex: 1 }}>
                <Typography level="body-sm">New Password</Typography>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </FormControl>
              <FormControl sx={{ mb: 2, flex: 1 }}>
                <Typography level="body-sm">Confirm Password</Typography>
                <Input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => { setResetUser(null); setNewPassword(""); setConfirmNewPassword(""); }}
              >
                Cancel
              </Button>
              <Button onClick={handleResetPassword}>Reset</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}
    </Box>
  );
};

export default AdminUsers;
