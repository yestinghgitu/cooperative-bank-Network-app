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
  Divider,
} from "@mui/joy";
import { toast } from "sonner";
import { superAdminAPI } from "../services/api";
import { Pencil, Trash2, Plus } from "lucide-react";
import dayjs from "dayjs";

// ------------------ Date Field ------------------
const JoyDateField = ({ label, value, onChange }) => (
  <FormControl sx={{ mb: 2 }}>
    <Typography level="body-sm" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      sx={{ borderRadius: 1, py: 1, fontSize: "sm" }}
    />
  </FormControl>
);

// ------------------ Main Component ------------------
const SocietyBranchesManagement = () => {
  const [banks, setBanks] = useState([]);
  const [branchesByBank, setBranchesByBank] = useState({});
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);

  // Pagination
  const [bankPage, setBankPage] = useState(1);
  const [branchPage, setBranchPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalBanks, setTotalBanks] = useState(0);
  const [totalBranches, setTotalBranches] = useState(0);

  // Search
  const [bankSearch, setBankSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");

  // Modals
  const [addBank, setAddBank] = useState(false);
  const [editBank, setEditBank] = useState(null);
  const [addBranch, setAddBranch] = useState(false);
  const [editBranch, setEditBranch] = useState(null);

  // Form states
  const [bankForm, setBankForm] = useState({
    bank_name: "",
    registration_number: "",
    rbi_license_number: "",
    ifsc_code: "",
    micr_code: "",
    head_office_address: "",
    district: "",
    state: "",
    country: "India",
    established_date: "",
    status: "Active",
  });

  const [branchForm, setBranchForm] = useState({
    bank_name: "",
    branch_name: "",
    branch_code: "",
    address: "",
    district: "",
    state: "",
    ifsc_code: "",
    contact_number: "",
    manager_name: "",
    status: "Active",
  });

  // ---------------- FETCH BANKS ----------------
  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const res = await superAdminAPI.getBanks(bankPage, pageSize, bankSearch);
      const bankData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setBanks(bankData);
      setTotalBanks(res.data?.total || bankData.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch societies");
    } finally {
      setLoadingBanks(false);
    }
  };

  // ---------------- FETCH BRANCHES ----------------
  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const res = await superAdminAPI.getBranches("", branchPage, pageSize, branchSearch);
      const branchData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const branchMap = {};
      branchData.forEach((br) => {
        if (!branchMap[br.bank_name]) branchMap[br.bank_name] = [];
        branchMap[br.bank_name].push(br);
      });

      setBranchesByBank(branchMap);
      setTotalBranches(res.data?.total || branchData.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch branches");
    } finally {
      setLoadingBranches(false);
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchBanks();
  }, [bankPage, bankSearch]);

  useEffect(() => {
    fetchBranches();
  }, [branchPage, branchSearch]);

  // ---------------- BANK HANDLERS ----------------
  const handleAddBank = async () => {
    if (!bankForm.bank_name || !bankForm.registration_number)
      return toast.error("Society name and registration number are required");
    try {
      await superAdminAPI.createBank(bankForm);
      setAddBank(false);
      setBankForm({
        bank_name: "",
        registration_number: "",
        rbi_license_number: "",
        ifsc_code: "",
        micr_code: "",
        head_office_address: "",
        district: "",
        state: "",
        country: "India",
        established_date: "",
        status: "Active",
      });
      fetchBanks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add society");
    }
  };

  const handleEditBankSave = async () => {
    if (!editBank?.bank_name || !editBank?.registration_number)
      return toast.error("Society name and registration number are required");
    try {
      await superAdminAPI.updateBank(editBank.id, editBank);
      setEditBank(null);
      fetchBanks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update society");
    }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm("Are you sure you want to delete this society?")) return;
    try {
      await superAdminAPI.deleteBank(id);
      fetchBanks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete society");
    }
  };

  // ---------------- BRANCH HANDLERS ----------------
  const handleAddBranch = async () => {
    if (!branchForm.bank_name || !branchForm.branch_name)
      return toast.error("Society and branch name are required");
    try {
      await superAdminAPI.createBranch(branchForm);
      setAddBranch(false);
      setBranchForm({
        bank_name: "",
        branch_name: "",
        branch_code: "",
        address: "",
        district: "",
        state: "",
        ifsc_code: "",
        contact_number: "",
        manager_name: "",
        status: "Active",
      });
      fetchBranches();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add branch");
    }
  };

  const handleEditBranchSave = async () => {
    if (!editBranch?.bank_name || !editBranch?.branch_name)
      return toast.error("Society and branch name are required");
    try {
      await superAdminAPI.updateBranch(editBranch.id, editBranch);
      setEditBranch(null);
      fetchBranches();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update branch");
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      await superAdminAPI.deleteBranch(id);
      fetchBranches();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete branch");
    }
  };

  // ---------------- FORM FIELDS ----------------
  const bankFields = [
    { key: "bank_name", label: "Society Name", type: "text" },
    { key: "registration_number", label: "Registration Number", type: "text" },
    { key: "rbi_license_number", label: "RBI License", type: "text" },
    { key: "ifsc_code", label: "IFSC Code", type: "text" },
    { key: "micr_code", label: "MICR Code", type: "text" },
    { key: "head_office_address", label: "Head Office Address", type: "text" },
    { key: "district", label: "District", type: "text" },
    { key: "state", label: "State", type: "text" },
    { key: "country", label: "Country", type: "text" },
    { key: "established_date", label: "Established Date", type: "date" },
    { key: "status", label: "Status", type: "status" },
  ];

  const branchFields = [
    { key: "bank_name", label: "Society", type: "select" },
    { key: "branch_name", label: "Branch Name", type: "text" },
    { key: "branch_code", label: "Branch Code", type: "text" },
    { key: "address", label: "Address", type: "text" },
    { key: "district", label: "District", type: "text" },
    { key: "state", label: "State", type: "text" },
    { key: "ifsc_code", label: "IFSC Code", type: "text" },
    { key: "contact_number", label: "Contact Number", type: "text" },
    { key: "manager_name", label: "Manager Name", type: "text" },
    { key: "status", label: "Status", type: "status" },
  ];

// ---------------- RENDER FIELDS ----------------
const renderFormFields = (fields, state, setState) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
      gap: 2,
      maxHeight: "70vh",
      overflowY: "auto",
    }}
  >
    {fields.map((field) => (
      <FormControl key={field.key}>
        {/* ✅ Only render Typography for non-date fields */}
        {field.type !== "date" && (
          <Typography level="body-sm" sx={{ mb: 0.5 }}>
            {field.label}
          </Typography>
        )}

        {field.type === "date" ? (
          <JoyDateField
            label={field.label} // label is shown inside JoyDateField
            value={state[field.key]}
            onChange={(val) => setState({ ...state, [field.key]: val })}
          />
        ) : field.type === "select" ? (
          <Select
            value={state[field.key] || ""}
            onChange={(_, val) => setState({ ...state, [field.key]: val })}
            sx={{ borderRadius: 1 }}
          >
            {banks.map((b) => (
              <Option key={b.id || b.bank_name} value={b.bank_name}>
                {b.bank_name}
              </Option>
            ))}
          </Select>
        ) : field.type === "status" ? (
          <Select
            value={state[field.key] || "Active"}
            onChange={(_, val) => setState({ ...state, [field.key]: val })}
            sx={{ borderRadius: 1 }}
          >
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        ) : (
          <Input
            type="text"
            value={state[field.key] || ""}
            onChange={(e) => setState({ ...state, [field.key]: e.target.value })}
            sx={{ borderRadius: 1 }}
          />
        )}
      </FormControl>
    ))}
  </Box>
);

  // ---------------- LOADING ----------------
  if (loadingBanks || loadingBranches)
    return <Typography sx={{ mt: 10, textAlign: "center" }}>Loading...</Typography>;

  const totalBankPages = Math.ceil(totalBanks / pageSize);
  const totalBranchPages = Math.ceil(totalBranches / pageSize);

  // ---------------- RETURN ----------------
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography level="h4" fontWeight={700}>
          🏦 Society & Branch Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button startDecorator={<Plus />} onClick={() => setAddBank(true)}>
            Add Society
          </Button>
          <Button startDecorator={<Plus />} onClick={() => setAddBranch(true)}>
            Add Branch
          </Button>
        </Stack>
      </Box>

      {/* -------- SOCIETY TABLE -------- */}
      <Card variant="outlined" sx={{ mb: 4, overflowX: "auto" }}>
        <Typography level="h6" sx={{ p: 2 }}>
          Societies
        </Typography>
        <Divider />
        <Sheet variant="soft" sx={{ p: 2 }}>
          <Table hoverRow stickyHeader>
            <thead>
              <tr>
                {bankFields.map((f) => (
                  <th key={f.key}>{f.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banks.length ? (
                banks.map((b) => (
                  <tr key={b.id}>
                    {bankFields.map((f) => (
                      <td key={f.key}>
                        {f.key === "established_date" && b[f.key]
                          ? dayjs(b[f.key]).format("DD/MM/YYYY")
                          : b[f.key] || "-"}
                      </td>
                    ))}
                    <td>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="sm" onClick={() => setEditBank(b)}>
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          size="sm"
                          color="danger"
                          onClick={() => handleDeleteBank(b.id)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={bankFields.length + 1} style={{ textAlign: "center" }}>
                    No Societies Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            <Button disabled={bankPage <= 1} onClick={() => setBankPage((p) => p - 1)}>
              Previous
            </Button>
            <Typography>Page {bankPage} of {totalBankPages}</Typography>
            <Button
              disabled={bankPage >= totalBankPages}
              onClick={() => setBankPage((p) => p + 1)}
            >
              Next
            </Button>
          </Stack>
        </Sheet>
      </Card>

      {/* -------- BRANCH TABLE -------- */}
      <Card variant="outlined" sx={{ overflowX: "auto" }}>
        <Typography level="h6" sx={{ p: 2 }}>
          Branches
        </Typography>
        <Divider />
        <Sheet variant="soft" sx={{ p: 2 }}>
          <Table hoverRow stickyHeader>
            <thead>
              <tr>
                {branchFields.map((f) => (
                  <th key={f.key}>{f.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(branchesByBank).length ? (
                Object.entries(branchesByBank).map(([bank, branchList]) =>
                  branchList.map((br) => (
                    <tr key={br.id}>
                      {branchFields.map((f) => (
                        <td key={f.key}>{br[f.key] || "-"}</td>
                      ))}
                      <td>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="sm" onClick={() => setEditBranch(br)}>
                            <Pencil size={16} />
                          </IconButton>
                          <IconButton
                            size="sm"
                            color="danger"
                            onClick={() => handleDeleteBranch(br.id)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Stack>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td colSpan={branchFields.length + 1} style={{ textAlign: "center" }}>
                    No Branches Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            <Button disabled={branchPage <= 1} onClick={() => setBranchPage((p) => p - 1)}>
              Previous
            </Button>
            <Typography>Page {branchPage} of {totalBranchPages}</Typography>
            <Button
              disabled={branchPage >= totalBranchPages}
              onClick={() => setBranchPage((p) => p + 1)}
            >
              Next
            </Button>
          </Stack>
        </Sheet>
      </Card>

      {/* -------- MODALS -------- */}

      {/* ADD SOCIETY */}
      <Modal open={addBank} onClose={() => setAddBank(false)}>
        <ModalDialog sx={{ maxHeight: "90vh", overflowY: "auto" }}>
          <ModalClose />
          <Typography level="h6">Add Society</Typography>
          {renderFormFields(bankFields, bankForm, setBankForm)}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            <Button onClick={handleAddBank}>Save</Button>
          </Stack>
        </ModalDialog>
      </Modal>
      
      {/* EDIT SOCIETY */}
      {editBank && (
        <Modal open={!!editBank} onClose={() => setEditBank(null)}>
          <ModalDialog sx={{ maxHeight: "90vh", overflowY: "auto" }}>
            <ModalClose />
            <Typography level="h6">Edit Society</Typography>
            {renderFormFields(bankFields, editBank, setEditBank)}
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button onClick={handleEditBankSave}>Save</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}

      {/* ADD BRANCH */}
      <Modal open={addBranch} onClose={() => setAddBranch(false)}>
        <ModalDialog sx={{ maxHeight: "90vh", overflowY: "auto" }}>
          <ModalClose />
          <Typography level="h6">Add Branch</Typography>
          {renderFormFields(branchFields, branchForm, setBranchForm)}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            <Button onClick={handleAddBranch}>Save</Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* EDIT BRANCH */}
      {editBranch && (
        <Modal open={!!editBranch} onClose={() => setEditBranch(null)}>
          <ModalDialog sx={{ maxHeight: "90vh", overflowY: "auto" }}>
            <ModalClose />
            <Typography level="h6">Edit Branch</Typography>
            {renderFormFields(branchFields, editBranch, setEditBranch)}
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button onClick={handleEditBranchSave}>Save</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}
    </Box>
  );
};

export default SocietyBranchesManagement;
