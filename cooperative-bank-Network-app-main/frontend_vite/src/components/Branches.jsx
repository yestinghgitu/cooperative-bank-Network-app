// src/components/AdminBranches.jsx
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
} from "@mui/joy";
import { toast } from "sonner";
import { adminAPI } from "../services/api";
import { Pencil, Trash2, Plus } from "lucide-react";

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBranch, setEditBranch] = useState(null);
  const [addBranch, setAddBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({ branch_name: "", bank_name: "" });

  useEffect(() => {
    fetchBranches();
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await adminAPI.getBanks();
      setBanks(res.data || []);
    } catch {
      toast.error("Failed to fetch banks");
    }
  };

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getBranches();
      setBranches(res.data || []);
    } catch {
      toast.error("Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async () => {
    if (!newBranch.branch_name || !newBranch.bank_name) return toast.error("All fields required");
    try {
      await adminAPI.createBranch(newBranch);
      setAddBranch(false);
      setNewBranch({ branch_name: "", bank_name: "" });
      fetchBranches();
    } catch {
      toast.error("Failed to add branch");
    }
  };

  const handleSaveBranch = async () => {
    if (!editBranch.branch_name || !editBranch.bank_name) return toast.error("All fields required");
    try {
      await adminAPI.updateBranch(editBranch.id, {
        branch_name: editBranch.branch_name,
        bank_name: editBranch.bank_name,
      });
      setEditBranch(null);
      fetchBranches();
    } catch {
      toast.error("Failed to update branch");
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      await adminAPI.deleteBranch(id);
      fetchBranches();
    } catch {
      toast.error("Failed to delete branch");
    }
  };

  if (loading) return <Box sx={{ textAlign: "center", mt: 10 }}><Typography>Loading branches...</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography level="h4" fontWeight={700}>🏢 Branch Management</Typography>
        <Button startDecorator={<Plus />} variant="solid" onClick={() => setAddBranch(true)}>Add Branch</Button>
      </Box>

      {/* BRANCH TABLE */}
      <Card variant="outlined" sx={{ p: 2 }}>
        <Sheet variant="soft">
          <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table hoverRow stickyHeader>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Branch Name</th>
                  <th>Bank</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.branch_name}</td>
                    <td>{b.bank_name}</td>
                    <td>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="sm" variant="outlined" color="primary" onClick={() => setEditBranch(b)}>
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton size="sm" variant="outlined" color="danger" onClick={() => handleDeleteBranch(b.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Sheet>
      </Card>

      {/* ADD BRANCH MODAL */}
      {addBranch && (
        <Modal open={addBranch} onClose={() => setAddBranch(false)}>
          <ModalDialog sx={{ p: 3 }}>
            <ModalClose />
            <Typography level="h5" mb={2}>Add Branch</Typography>
            <FormControl sx={{ mb: 2 }}>
              <Typography level="body-sm">Branch Name</Typography>
              <Input value={newBranch.branch_name} onChange={(e) => setNewBranch({ ...newBranch, branch_name: e.target.value })} />
            </FormControl>
            <FormControl sx={{ mb: 2 }}>
              <Typography level="body-sm">Bank</Typography>
              <Select
                value={newBranch.bank_name}
                onChange={(e, val) => setNewBranch({ ...newBranch, bank_name: val })}
              >
                {banks.map((b) => (
                  <Option key={b.id} value={b.bank_name}>{b.bank_name}</Option>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setAddBranch(false)}>Cancel</Button>
              <Button onClick={handleAddBranch}>Add</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}

      {/* EDIT BRANCH MODAL */}
      {editBranch && (
        <Modal open={!!editBranch} onClose={() => setEditBranch(null)}>
          <ModalDialog sx={{ p: 3 }}>
            <ModalClose />
            <Typography level="h5" mb={2}>Edit Branch</Typography>
            <FormControl sx={{ mb: 2 }}>
              <Typography level="body-sm">Branch Name</Typography>
              <Input
                value={editBranch.branch_name}
                onChange={(e) => setEditBranch({ ...editBranch, branch_name: e.target.value })}
              />
            </FormControl>
            <FormControl sx={{ mb: 2 }}>
              <Typography level="body-sm">Bank</Typography>
              <Select
                value={editBranch.bank_name}
                onChange={(e, val) => setEditBranch({ ...editBranch, bank_name: val })}
              >
                {banks.map((b) => (
                  <Option key={b.id} value={b.bank_name}>{b.bank_name}</Option>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setEditBranch(null)}>Cancel</Button>
              <Button onClick={handleSaveBranch}>Save</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}
    </Box>
  );
};

export default Branches;
