// src/components/UserManagement.jsx
import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/joy";
import { toast } from "sonner";
import { adminAPI, superAdminAPI } from "../services/api";
import { Pencil, Trash2, Key, Plus } from "lucide-react";

// Get current user role and details
const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user || { role: "user", bank_name: "", branch_name: "" };
};

const UserManagement = () => {
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [banks, setBanks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    full_name: "",
    role: "user",
    email: "",
    bank_name: "",
    branch_name: "",
    bank_id: "",
    branch_id: "",
    password: "",
    confirmPassword: "",
  });
  const [validation, setValidation] = useState({});

  const previousBankRef = useRef("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // ------------------ Fetch users ------------------
  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let res;
      if (currentUser.role === "admin") {
        res = await adminAPI.getUsers(page, pageSize);
      } else if (currentUser.role === "manager") {
        res = await adminAPI.getUsers(page, pageSize);
        res.data.data = res.data.data.filter(
          (u) =>
            u.bank_name === currentUser.bank_name &&
            u.branch_name === currentUser.branch_name &&
            u.role !== "admin" // Manager should not see admin users
        );
      } else {
        res = { data: { data: [], total: 0 } };
      }
      setUsers(res.data?.data || []);
      setTotalUsers(res.data?.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Fetch banks only once ------------------
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        if (currentUser.role === "admin") {
          const res = await superAdminAPI.getBanks(1, 1000, "");
          setBanks(res.data?.data || []);
        } else {
          setBanks([{ bank_name: currentUser.bank_name }]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch banks/societies");
      }
    };
    fetchBanks();
  }, [currentUser.role]);

  // ------------------ Fetch branches when bank changes ------------------
  useEffect(() => {
    const fetchBranches = async () => {
      if (
        newUser.bank_name &&
        previousBankRef.current !== newUser.bank_name
      ) {
        try {
          if (currentUser.role === "admin") {
            const res = await superAdminAPI.getBranches(newUser.bank_name);
            setBranches(res.data?.data || []);
          } else {
            setBranches([{ branch_name: currentUser.branch_name }]);
          }
          previousBankRef.current = newUser.bank_name;
        } catch (err) {
          console.error(err);
          toast.error("Failed to fetch branches");
        }
      }
    };
    fetchBranches();
  }, [newUser.bank_name, currentUser]);

  // ------------------ Fetch branches for edit user ------------------
useEffect(() => {
  const fetchEditBranches = async () => {
    if (editUser?.bank_name) {
      try {
        let branchList = [];
        if (currentUser.role === "admin") {
          const res = await superAdminAPI.getBranches(editUser.bank_name);
          branchList = res.data?.data || [];
        } else {
          branchList = [{ branch_name: currentUser.branch_name }];
        }
        setBranches(branchList);

        // Ensure branch_name is set for editUser
        if (!branchList.find((b) => b.branch_name === editUser.branch_name)) {
          setEditUser((prev) => ({ ...prev, branch_name: "" }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch branches");
      }
    }
  };
  fetchEditBranches();
}, [editUser?.bank_name, currentUser]);


  // ------------------ Validation ------------------
  const validateField = (name, value) => {
    let message = "";
    if (name === "email" && value && !/^\S+@\S+\.\S+$/.test(value))
      message = "Invalid email address";
    if (name === "password" && value && value.length < 6)
      message = "Password must be at least 6 characters";
    if (name === "confirmPassword" && value !== newUser.password)
      message = "Passwords do not match";
    setValidation((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
    validateField(name, value);
  };

  // ------------------ Handlers ------------------
  const handleEdit = (user) => {
    setEditUser(user);
    setOpenEdit(true);
  };

  const handleSave = async () => {
    try {
      await adminAPI.updateUser(editUser.id, {
        full_name: editUser.full_name,
        role: editUser.role,
        bank_name: editUser.bank_name,
        branch_name: editUser.branch_name,
        bank_id: banks.find((b) => b.bank_name === editUser.bank_name)?.id,
        branch_id: branches.find((b) => b.branch_name === editUser.branch_name)?.id,
      });
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
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleAddUser = async () => {
    if (Object.values(validation).some((v) => v)) {
      return toast.error("Please fix validation errors");
    }
    try {
      await adminAPI.createUser({
        ...newUser,
        bank_id: banks.find((b) => b.bank_name === newUser.bank_name)?.id,
        branch_id: branches.find((b) => b.branch_name === newUser.branch_name)?.id,
      });
      setAddUser(false);
      setNewUser({
        username: "",
        full_name: "",
        role: "user",
        email: "",
        bank_name: "",
        branch_name: "",
        bank_id: "",
        branch_id: "",
        password: "",
        confirmPassword: "",
      });
      setValidation({});
      fetchUsers();
    } catch {
      toast.error("Failed to add user");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword)
      return toast.error("Password cannot be empty");
    if (newPassword !== confirmNewPassword)
      return toast.error("Passwords do not match");
    try {
      await adminAPI.resetPassword(resetUser.id, newPassword);
      setResetUser(null);
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      toast.error("Password reset failed");
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  // ------------------ Form Renderer ------------------
  const renderFormFields = (fields, state, setState) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      {fields.map((field) => (
        <FormControl key={field.key} sx={{ mb: 2 }}>
          <Typography level="body-sm">{field.label}</Typography>
          {field.type === "select" ? (
            <Select
              value={state[field.key]}
              onChange={(e, val) => {
                setState({ ...state, [field.key]: val });
                if (field.key === "bank_name") setState((prev) => ({ ...prev, branch_name: "" }));
              }}
            >
              {Array.isArray(field.options) &&
                field.options.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
            </Select>
          ) : (
            <Input
              type={field.type}
              value={state[field.key]}
              onChange={(e) => {
                setState({ ...state, [field.key]: e.target.value });
                if (field.key in validation) validateField(field.key, e.target.value);
              }}
              error={!!validation[field.key]}
              placeholder={validation[field.key] || ""}
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
    {
      key: "bank_name",
      label: "Society",
      type: "select",
      options: banks.map((b) => ({ value: b.bank_name, label: b.bank_name })),
    },
    {
      key: "branch_name",
      label: "Branch",
      type: "select",
      options: branches.map((b) => ({ value: b.branch_name, label: b.branch_name })),
    },
    {
      key: "role",
      label: "Role",
      type: "select",
      options:
        currentUser.role === "admin"
          ? [
              { value: "user", label: "User" },
              { value: "admin", label: "Admin" },
              { value: "manager", label: "Manager" },
            ]
          : [{ value: "user", label: "User" }],
    },
    { key: "password", label: "Password", type: "password" },
    { key: "confirmPassword", label: "Confirm Password", type: "password" },
  ];

  const editUserFields = [
  { key: "full_name", label: "Full Name", type: "text" },
  {
    key: "role",
    label: "Role",
    type: "select",
    options:
      currentUser.role === "admin"
        ? [
            { value: "user", label: "User" },
            { value: "admin", label: "Admin" },
            { value: "manager", label: "Manager" },
          ]
        : [{ value: "user", label: "User" }],
  },
  {
    key: "bank_name",
    label: "Society",
    type: "select",
    options: banks.map((b) => ({ value: b.bank_name, label: b.bank_name })),
  },
  {
    key: "branch_name",
    label: "Branch",
    type: "select",
    options: branches.map((b) => ({ value: b.branch_name, label: b.branch_name })),
  },
];


  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography>Loading users...</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography level="h4" fontWeight={700}>
          👥 User Management
        </Typography>
        {(currentUser.role === "admin" || currentUser.role === "manager") && (
          <Button
            startDecorator={<Plus />}
            variant="solid"
            color="primary"
            onClick={() => setAddUser(true)}
          >
            Add User
          </Button>
        )}
      </Box>

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
                  <th>Society</th>
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
                    <td>{u.bank_name}</td>
                    <td>{u.branch_name}</td>
                    <td>{u.role}</td>
                    <td>
                      <Stack direction="row" spacing={0.5}>
                        {(currentUser.role === "admin" ||
                          (currentUser.role === "manager" &&
                            u.bank_name === currentUser.bank_name &&
                            u.branch_name === currentUser.branch_name)) && (
                          <>
                            <IconButton
                              size="sm"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleEdit(u)}
                            >
                              <Pencil size={16} />
                            </IconButton>
                            <IconButton
                              size="sm"
                              variant="outlined"
                              color="danger"
                              onClick={() => handleDelete(u.id)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                            <IconButton
                              size="sm"
                              variant="outlined"
                              color="warning"
                              onClick={() => setResetUser(u)}
                            >
                              <Key size={16} />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Typography level="body2" sx={{ alignSelf: "center" }}>
              Page {page} of {totalPages}
            </Typography>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
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
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => setAddUser(false)}
              >
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
            {renderFormFields(editUserFields, editUser, setEditUser)}
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setOpenEdit(false);
                  setEditUser(null);
                }}
              >
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
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </FormControl>
              <FormControl sx={{ mb: 2, flex: 1 }}>
                <Typography level="body-sm">Confirm Password</Typography>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setResetUser(null);
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
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

export default UserManagement;
