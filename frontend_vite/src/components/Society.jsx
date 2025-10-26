// src/components/AdminBanks.jsx
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
  IconButton,
  Button,
} from "@mui/joy";
import { toast } from "sonner";
import { adminAPI } from "../services/api";
import { Pencil, Trash2, Plus } from "lucide-react";

const AdminBanks = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBank, setEditBank] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [addBank, setAddBank] = useState(false);
  const [newBankName, setNewBankName] = useState("");

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getBanks();
      setBanks(res.data || []);
    } catch {
      toast.error("Failed to fetch banks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = async () => {
    if (!newBankName) return toast.error("Bank name cannot be empty");
    try {
      await adminAPI.createBank({ bank_name: newBankName });
      setAddBank(false);
      setNewBankName("");
      fetchBanks();
    } catch {
      toast.error("Failed to add bank");
    }
  };

  const handleSaveBank = async () => {
    if (!editBank.bank_name) return toast.error("Bank name cannot be empty");
    try {
      await adminAPI.updateBank(editBank.id, { bank_name: editBank.bank_name });
      setOpenEdit(false);
      setEditBank(null);
      fetchBanks();
    } catch {
      toast.error("Failed to update bank");
    }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bank?")) return;
    try {
      await adminAPI.deleteBank(id);
      fetchBanks();
    } catch {
      toast.error("Failed to delete bank");
    }
  };

  if (loading) return <Box sx={{ textAlign: "center", mt: 10 }}><Typography>Loading banks...</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography level="h4" fontWeight={700}>🏦 Bank Management</Typography>
        <Button startDecorator={<Plus />} variant="solid" onClick={() => setAddBank(true)}>Add Bank</Button>
      </Box>

      {/* BANK TABLE */}
      <Card variant="outlined" sx={{ p: 2 }}>
        <Sheet variant="soft">
          <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table hoverRow stickyHeader>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Bank Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.bank_name}</td>
                    <td>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="sm" variant="outlined" color="primary" onClick={() => setEditBank(b)}>
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton size="sm" variant="outlined" color="danger" onClick={() => handleDeleteBank(b.id)}>
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

      {/* ADD BANK MODAL */}
      {addBank && (
        <Modal open={addBank} onClose={() => setAddBank(false)}>
          <ModalDialog sx={{ p: 3 }}>
            <ModalClose />
            <Typography level="h5" mb={2}>Add Bank</Typography>
            <FormControl>
              <Typography level="body-sm">Bank Name</Typography>
              <Input value={newBankName} onChange={(e) => setNewBankName(e.target.value)} />
            </FormControl>
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" onClick={() => setAddBank(false)}>Cancel</Button>
              <Button onClick={handleAddBank}>Add</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}

      {/* EDIT BANK MODAL */}
      {editBank && (
        <Modal open={!!editBank} onClose={() => setEditBank(null)}>
          <ModalDialog sx={{ p: 3 }}>
            <ModalClose />
            <Typography level="h5" mb={2}>Edit Bank</Typography>
            <FormControl>
              <Typography level="body-sm">Bank Name</Typography>
              <Input
                value={editBank.bank_name}
                onChange={(e) => setEditBank({ ...editBank, bank_name: e.target.value })}
              />
            </FormControl>
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" onClick={() => setEditBank(null)}>Cancel</Button>
              <Button onClick={handleSaveBank}>Save</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}
    </Box>
  );
};

export default Society;
