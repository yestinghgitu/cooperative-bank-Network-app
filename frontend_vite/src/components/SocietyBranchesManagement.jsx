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
  Button,
  Divider,
  IconButton,
  Autocomplete
} from "@mui/joy";
import { toast } from "sonner";
import { superAdminAPI } from "../services/api";
import { Plus, Edit, Trash2, Eye, ChevronDown, ChevronRight } from "lucide-react";
import indiaDistrictsData from "../data/indiaDistricts.json";
import useMediaQuery from "@mui/material/useMediaQuery";
// ------------------ State & District Data ------------------
const statesData = indiaDistrictsData.states;
const stateDistrictMap = {};
statesData.forEach((s) => {
  stateDistrictMap[s.state] = s.districts;
});
const stateOptions = statesData.map((s) => ({ value: s.state, label: s.state }));
const getDistrictsByStateName = (stateName) => stateDistrictMap[stateName] || [];

// ------------------ Main Component ------------------
const SocietyBranchesManagement = () => {
  const [banks, setBanks] = useState([]);
  const [branchesByBank, setBranchesByBank] = useState({});
  const [expandedBanks, setExpandedBanks] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewModal, setViewModal] = useState(null);

  const [addBankModal, setAddBankModal] = useState(false);
  const [editBank, setEditBank] = useState(null);
  const [bankForm, setBankForm] = useState({
    bank_name: "",
    registration_number: "",
    head_office_address: "",
    state: "",
    district: "",
    country: "India",
    established_date: "",
    status: "Active",
  });

  const [addBranchModal, setAddBranchModal] = useState(false);
  const [editBranch, setEditBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    bank_name: "",
    branch_name: "",
    branch_code: "",
    address: "",
    state: "",
    district: "",
    city: "",
    status: "Active",
  });

  const [districtOptions, setDistrictOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const isMobile = useMediaQuery("(max-width:600px)");

  // ---------------- FETCH DATA ------------------
  const fetchBanks = async () => {
    try {
      const res = await superAdminAPI.getBanks(1, 100);
      setBanks(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to fetch societies");
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await superAdminAPI.getBranches("", 1, 100);
      const branchMap = {};
      (res.data?.data || []).forEach((br) => {
        if (!branchMap[br.bank_name]) branchMap[br.bank_name] = [];
        branchMap[br.bank_name].push(br);
      });
      setBranchesByBank(branchMap);
    } catch (err) {
      toast.error("Failed to fetch branches");
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchBranches();
  }, []);

  // ------------------ FORM HANDLERS ------------------
  const handleAddBank = async () => {
    try {
      await superAdminAPI.createBank(bankForm);
      setAddBankModal(false);
      setBankForm({
        bank_name: "",
        registration_number: "",
        head_office_address: "",
        state: "",
        district: "",
        country: "India",
        established_date: "",
        status: "Active",
      });
      fetchBanks();
    } catch (err) {
      toast.error("Failed to add society");
    }
  };

  const handleEditBankSave = async () => {
    try {
      await superAdminAPI.updateBank(editBank.id, editBank);
      setEditBank(null);
      fetchBanks();
    } catch (err) {
      toast.error("Failed to update society");
    }
  };

  const handleDeleteBank = async (bankId) => {
    if (!confirm("Are you sure you want to delete this society?")) return;
    try {
      await superAdminAPI.deleteBank(bankId);
      fetchBanks();
      fetchBranches();
      toast.success("Society deleted");
    } catch (err) {
      toast.error("Failed to delete society");
    }
  };

  const handleAddBranch = async () => {
    try {
      await superAdminAPI.createBranch(branchForm);
      setAddBranchModal(false);
      setBranchForm({
        bank_name: "",
        branch_name: "",
        branch_code: "",
        address: "",
        state: "",
        district: "",
        city: "",
        status: "Active",
      });
      fetchBranches();
    } catch (err) {
      toast.error("Failed to add branch");
    }
  };

  const handleEditBranchSave = async () => {
    try {
      await superAdminAPI.updateBranch(editBranch.id, editBranch);
      setEditBranch(null);
      fetchBranches();
    } catch (err) {
      toast.error("Failed to update branch");
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    try {
      await superAdminAPI.deleteBranch(branchId);
      fetchBranches();
      toast.success("Branch deleted");
    } catch (err) {
      toast.error("Failed to delete branch");
    }
  };

  const filteredBanks = banks.filter(
    (b) =>
      b.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus ? b.status === filterStatus : true)
  );

  // ------------------ FORM FIELDS ------------------
  const bankFields = [
    { key: "bank_name", label: "Society Name", type: "text", width: "200px" },
    { key: "registration_number", label: "Registration No", type: "text", width: "150px" },
    { key: "head_office_address", label: "Address", type: "text", width: "250px" },
    { key: "state", label: "State", type: "state" },
    { key: "district", label: "District", type: "district" },
    { key: "established_date", label: "Established Date", type: "date" },
    { key: "status", label: "Status", type: "status" },
  ];

  const branchFields = [
    { key: "bank_name", label: "Society", type: "select" },
    { key: "branch_name", label: "Branch Name", type: "text" },
    { key: "branch_code", label: "Branch Code", type: "text" },
    { key: "address", label: "Address", type: "text" },
    { key: "state", label: "State", type: "state" },
    { key: "district", label: "District", type: "district" },
    { key: "city", label: "City", type: "city" },
    { key: "status", label: "Status", type: "status" },
  ];

  // ------------------ Render Form Fields ------------------
  const renderFormFields = (
    fields,
    state,
    setState,
    cityOptions,
    districtOptions,
    setCityOptions,
    setDistrictOptions,
    banks,
    disableBankSelect = false
  ) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      {fields.map((field) => {
        if (field.type === "date") {
          return (
            <FormControl key={field.key}>
              <Typography level="body-sm">{field.label}</Typography>
              <Input
                type="date"
                value={state[field.key] || ""}
                onChange={(e) => setState({ ...state, [field.key]: e.target.value })}
              />
            </FormControl>
          );
        }

        if (field.key === "state") {
          return (
            <FormControl key={field.key}>
              <Typography level="body-sm">{field.label}</Typography>
              <Autocomplete
                placeholder="Select or type state"
                options={stateOptions}
                getOptionLabel={(option) => option.label || ""}
                value={state.state ? { label: state.state, value: state.state } : null}
                freeSolo
                onChange={(_, newValue) => {
                  const stateName = typeof newValue === "string" ? newValue : newValue?.label;
                  const districts = getDistrictsByStateName(stateName);
                  setState({ ...state, state: stateName, district: districts[0] || "", city: "" });
                  setDistrictOptions(districts);
                  setCityOptions([]);
                }}
              />
            </FormControl>
          );
        }

        if (field.key === "district") {
          return (
            <FormControl key={field.key}>
              <Typography level="body-sm">{field.label}</Typography>
              <Autocomplete
                placeholder="Select or type district"
                options={districtOptions || []}
                freeSolo
                value={state.district ? { label: state.district, value: state.district } : null}
                onChange={(_, newValue) =>
                  setState({
                    ...state,
                    district: newValue ? (typeof newValue === "string" ? newValue : newValue.label) : "",
                  })
                }
              />
            </FormControl>
          );
        }

        if (field.key === "city") {
          return (
            <FormControl key={field.key}>
              <Typography level="body-sm">{field.label}</Typography>
              <Autocomplete
                placeholder="Select or type city"
                options={cityOptions || []}
                freeSolo
                value={state.city ? { label: state.city, value: state.city } : null}
                onChange={(_, newValue) =>
                  setState({
                    ...state,
                    city: newValue ? (typeof newValue === "string" ? newValue : newValue.label) : "",
                  })
                }
              />
            </FormControl>
          );
        }

        if (field.type === "select") {
          return (
            <FormControl key={field.key}>
              <Typography level="body-sm">{field.label}</Typography>
              <Select
                value={state[field.key] || ""}
                disabled={disableBankSelect && !!state[field.key]}
                onChange={(_, val) => setState({ ...state, [field.key]: val })}
              >
                {banks.map((b) => (
                  <Option key={b.id || b.bank_name} value={b.bank_name}>
                    {b.bank_name}
                  </Option>
                ))}
              </Select>
            </FormControl>
          );
        }

        if (field.type === "status") {
          return (
            <FormControl key={field.key}>
              <Typography level="body-sm">{field.label}</Typography>
              <Select
                value={state[field.key] || "Active"}
                onChange={(_, val) => setState({ ...state, [field.key]: val })}
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </FormControl>
          );
        }

        return (
          <FormControl key={field.key}>
            <Typography level="body-sm">{field.label}</Typography>
            <Input
              type="text"
              value={state[field.key] || ""}
              onChange={(e) => setState({ ...state, [field.key]: e.target.value })}
            />
          </FormControl>
        );
      })}
    </Box>
  );

  // ------------------ RETURN ------------------
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Typography level="h4" fontWeight={700}>🏦 Society & Branch Management</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button startDecorator={<Plus />} onClick={() => setAddBankModal(true)}>Add Society</Button>
          <Button startDecorator={<Plus />} onClick={() => setAddBranchModal(true)}>Add Branch</Button>
        </Stack>
      </Box>

      {/* Search & Filter */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <Input placeholder="Search Societies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Select placeholder="Filter Status" value={filterStatus} onChange={(_, val) => setFilterStatus(val)}>
          <Option value="">All</Option>
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
      </Stack>

      {/* Societies Table */}
      <Card variant="outlined" sx={{ mb: 4, overflowX: "auto" }}>
        <Typography level="h6" sx={{ p: 2 }}>Societies</Typography>
        <Divider />
        <Sheet variant="soft" sx={{ p: 2 }}>
          <Table hoverRow sx={{ minWidth: "700px" }}>
            <thead>
              <tr>
                <th></th>
                {bankFields.map((f) => <th key={f.key} style={{ minWidth: f.width }}>{f.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanks.length ? (
                filteredBanks.map((b) => (
                  <React.Fragment key={b.id}>
                    <tr>
                      <td>
                        <IconButton onClick={() => setExpandedBanks(prev => ({ ...prev, [b.id]: !prev[b.id] }))}>
                          {expandedBanks[b.id] ? <ChevronDown /> : <ChevronRight />}
                        </IconButton>
                      </td>
                      {bankFields.map((f) => <td key={f.key}>{b[f.key] || "-"}</td>)}
                      <td>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <IconButton size="sm" onClick={() => setEditBank(b)}><Edit /></IconButton>
                          <IconButton size="sm" color="danger" onClick={() => handleDeleteBank(b.id)}><Trash2 /></IconButton>
                          <IconButton size="sm" onClick={() => setViewModal(b)}><Eye /></IconButton>
                        </Stack>
                      </td>
                    </tr>

                    {/* Branches */}
                    {expandedBanks[b.id] && (
                      <tr>
                        <td colSpan={bankFields.length + 2}>
                          {isMobile ? (
                            <Stack spacing={1} mt={1}>
                              {(branchesByBank[b.bank_name] || []).map((br) => (
                                <Card key={br.id} variant="outlined">
                                  <Stack spacing={0.5}>
                                    {branchFields.map((f) => (
                                      <Box key={f.key} sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography fontWeight={500}>{f.label}</Typography>
                                        <Typography>{br[f.key] || "-"}</Typography>
                                      </Box>
                                    ))}
                                    <Stack direction="row" spacing={1} mt={1}>
                                      <IconButton size="sm" onClick={() => setEditBranch(br)}><Edit /></IconButton>
                                      <IconButton size="sm" color="danger" onClick={() => handleDeleteBranch(br.id)}><Trash2 /></IconButton>
                                    </Stack>
                                  </Stack>
                                </Card>
                              ))}
                            </Stack>
                          ) : (
                            <Box sx={{ overflowX: "auto", mt: 1 }}>
                              <Table hoverRow sx={{ minWidth: "600px" }}>
                                <thead>
                                  <tr>
                                    {branchFields.map((f) => <th key={f.key}>{f.label}</th>)}
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(branchesByBank[b.bank_name] || []).map((br) => (
                                    <tr key={br.id}>
                                      {branchFields.map((f) => <td key={f.key}>{br[f.key] || "-"}</td>)}
                                      <td>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                          <IconButton size="sm" onClick={() => setEditBranch(br)}><Edit /></IconButton>
                                          <IconButton size="sm" color="danger" onClick={() => handleDeleteBranch(br.id)}><Trash2 /></IconButton>
                                        </Stack>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </Box>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={bankFields.length + 2} style={{ textAlign: "center" }}>No societies found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Sheet>
      </Card>

      {/* ---------------- MODALS ---------------- */}
      {/* Add Bank */}
      <Modal open={addBankModal} onClose={() => setAddBankModal(false)}>
        <ModalDialog sx={{ maxHeight: "90vh", overflowY: "auto" }}>
          <ModalClose />
          <Typography level="h6">Add Society</Typography>
          {renderFormFields(bankFields, bankForm, setBankForm, cityOptions, districtOptions, setCityOptions, setDistrictOptions, banks)}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            <Button onClick={handleAddBank}>Save</Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Edit Bank */}
      {editBank && (
        <Modal open={!!editBank} onClose={() => setEditBank(null)}>
          <ModalDialog sx={{ maxHeight: "90vh", overflowY: "auto" }}>
            <ModalClose />
            <Typography level="h6">Edit Society</Typography>
            {renderFormFields(bankFields, editBank, setEditBank, cityOptions, districtOptions, setCityOptions, setDistrictOptions, banks)}
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button onClick={handleEditBankSave}>Update</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}

      {/* View Bank */}
      {viewModal && (
        <Modal open={!!viewModal} onClose={() => setViewModal(null)}>
          <ModalDialog>
            <ModalClose />
            <Typography level="h6">Society Details</Typography>
            <Stack spacing={1} mt={2}>
              {bankFields.map((f) => (
                <Box key={f.key} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontWeight={500}>{f.label}</Typography>
                  <Typography>{viewModal[f.key] || "-"}</Typography>
                </Box>
              ))}
            </Stack>
          </ModalDialog>
        </Modal>
      )}

      {/* Add Branch */}
      <Modal open={addBranchModal} onClose={() => setAddBranchModal(false)}>
        <ModalDialog sx={{ maxHeight: "90vh", overflowY: "auto" }}>
          <ModalClose />
          <Typography level="h6">Add Branch</Typography>
          {renderFormFields(branchFields, branchForm, setBranchForm, cityOptions, districtOptions, setCityOptions, setDistrictOptions, banks)}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            <Button onClick={handleAddBranch}>Save</Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Edit Branch */}
      {editBranch && (
        <Modal open={!!editBranch} onClose={() => setEditBranch(null)}>
          <ModalDialog sx={{ maxHeight: "90vh", overflowY: "auto" }}>
            <ModalClose />
            <Typography level="h6">Edit Branch</Typography>
            {renderFormFields(branchFields, editBranch, setEditBranch, cityOptions, districtOptions, setCityOptions, setDistrictOptions, banks, true)}
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
              <Button onClick={handleEditBranchSave}>Update</Button>
            </Stack>
          </ModalDialog>
        </Modal>
      )}
    </Box>
  );
};

export default SocietyBranchesManagement;
