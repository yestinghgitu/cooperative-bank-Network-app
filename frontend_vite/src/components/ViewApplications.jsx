import React, { useState, useEffect } from "react";
import CreateLoan from "./CreateLoan"; // ✅ import CreateLoan
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Table,
  Sheet,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Modal,
  ModalDialog,
  Input,
  Select,
  Option,
  Divider,
  Chip,
} from "@mui/joy";
import {
  FileDown,
  Eye,
  Pencil,
  Trash2,
  Columns3,
  Search,
} from "lucide-react";
import * as XLSX from "xlsx";
import { loanAPI } from "../services/api";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 5;

const ViewApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createLoanModal, setCreateLoanModal] = useState(false); // ✅ new state

  const [visibleColumns, setVisibleColumns] = useState({
    first_name: true,
    last_name: true,
    loan_type: true,
    loan_amount: true,
    status: true,
    society_name: true,
    aadhar_number: true,
    voter_id: true,
    mobile_number: true,
    created_at: true,
    remarks: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [viewApp, setViewApp] = useState(null);
  const [editApp, setEditApp] = useState(null);
  const [deleteApp, setDeleteApp] = useState(null);
  const [page, setPage] = useState(1);

  // Fetch Loans
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await loanAPI.getLoanApplications();
        const apps = Array.isArray(res.applications)
          ? res.applications
          : res.data?.applications || [];
        setApplications(apps);
        setFiltered(apps);
      } catch (error) {
        console.error("Error loading applications:", error);
        toast.error("Failed to load Loans.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = applications.filter(
      (app) =>
        app.first_name?.toLowerCase().includes(term) ||
        app.last_name?.toLowerCase().includes(term) ||
        app.aadhar_number?.toLowerCase().includes(term) ||
        app.voter_id?.toLowerCase().includes(term) ||
        app.mobile_number?.toLowerCase().includes(term)
    );
    setFiltered(results);
    setPage(1);
  }, [searchTerm, applications]);

  const maskAadhar = (num) => (num ? num.replace(/\d(?=\d{4})/g, "•") : "—");
  const maskVoter = (num) => (num ? num.replace(/\w(?=\w{4})/g, "•") : "—");
  const maskMobile = (num) => (num ? num.replace(/\d(?=\d{4})/g, "•") : "—");

  // Export Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    XLSX.writeFile(workbook, "loans.xlsx");
    toast.success("Excel file exported successfully!");
  };

  const toggleColumn = (col) =>
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));

  // Edit
  const handleEditSave = async () => {
    try {
      await loanAPI.updateApplication(editApp.application_id, editApp);
      toast.success("Loan updated successfully!");
      setApplications((prev) =>
        prev.map((a) =>
          a.application_id === editApp.application_id ? editApp : a
        )
      );
      setEditApp(null);
    } catch (error) {
      toast.error("Failed to update application.");
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      await loanAPI.deleteApplication(deleteApp.application_id);
      toast.success("Loan deleted successfully!");
      setApplications((prev) =>
        prev.filter((a) => a.application_id !== deleteApp.application_id)
      );
      setDeleteApp(null);
    } catch (error) {
      toast.error("Failed to delete application.");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <Typography level="h4" fontWeight="lg">
          Loans
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="solid"
            color="primary"
            onClick={() => setCreateLoanModal(true)} // ✅ open modal
          >
            Create Loan
          </Button>

          <Input
            startDecorator={<Search size={18} />}
            placeholder="Search Loans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Dropdown>
            <MenuButton
              variant="soft"
              color="neutral"
              startDecorator={<Columns3 size={18} />}
            >
              Columns
            </MenuButton>
            <Menu>
              {Object.keys(visibleColumns).map((col) => (
                <MenuItem
                  key={col}
                  selected={visibleColumns[col]}
                  onClick={() => toggleColumn(col)}
                >
                  {col.replace(/_/g, " ").toUpperCase()}
                </MenuItem>
              ))}
            </Menu>
          </Dropdown>

          <Button
            variant="soft"
            color="primary"
            startDecorator={<FileDown size={18} />}
            onClick={exportToExcel}
          >
            Excel
          </Button>
        </Box>
      </Box>

      {/* TABLE */}
      <Box sx={{ overflowX: "auto" }}>
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "md",
            boxShadow: "sm",
            overflow: "auto",
            minWidth: 900,
          }}
        >
          <Table
            aria-label="applications"
            stickyHeader
            hoverRow
            variant="plain"
            sx={{
              "& th": { fontWeight: "600", bgcolor: "background.level1" },
              "& td": { py: 1.5 },
            }}
          >
            <thead>
              <tr>
                {visibleColumns.first_name && <th>First Name</th>}
                {visibleColumns.last_name && <th>Last Name</th>}
                {visibleColumns.loan_type && <th>Loan Type</th>}
                {visibleColumns.loan_amount && <th>Loan Amount</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.society_name && <th>Society Name</th>}
                {visibleColumns.aadhar_number && <th>Aadhar</th>}
                {visibleColumns.voter_id && <th>Voter ID</th>}
                {visibleColumns.mobile_number && <th>Mobile</th>}
                {visibleColumns.created_at && <th>Created At</th>}
                {visibleColumns.remarks && <th>Remarks</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((app) => (
                  <tr key={app.application_id}>
                    {visibleColumns.first_name && <td>{app.first_name}</td>}
                    {visibleColumns.last_name && <td>{app.last_name}</td>}
                    {visibleColumns.loan_type && <td>{app.loan_type}</td>}
                    {visibleColumns.loan_amount && (
                      <td>₹ {app.loan_amount?.toLocaleString()}</td>
                    )}
                    {visibleColumns.status && (
                      <td>
                        <Chip
                          color={
                            app.status === "Running"
                              ? "success"
                              : app.status === "Due"
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {app.status}
                        </Chip>
                      </td>
                    )}
                    {visibleColumns.society_name && <td>{app.society_name}</td>}
                    {visibleColumns.aadhar_number && <td>{maskAadhar(app.aadhar_number)}</td>}
                    {visibleColumns.voter_id && <td>{maskVoter(app.voter_id)}</td>}
                    {visibleColumns.mobile_number && <td>{maskMobile(app.mobile_number)}</td>}
                    {visibleColumns.created_at && (
                      <td>{new Date(app.created_at).toLocaleString()}</td>
                    )}
                    {visibleColumns.remarks && <td>{app.remarks}</td>}
                    <td>
                      <Tooltip title="View Details">
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => setViewApp(app)}
                        >
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="primary"
                          onClick={() => setEditApp({ ...app })}
                        >
                          <Pencil size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={() => setDeleteApp(app)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} style={{ textAlign: "center", padding: "1rem" }}>
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Sheet>
      </Box>

      {/* PAGINATION */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          variant="soft"
        >
          ← Previous
        </Button>
        <Typography>
          Page {page} of {totalPages}
        </Typography>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          variant="soft"
        >
          Next →
        </Button>
      </Box>

    {/* CREATE LOAN MODAL */}
      {createLoanModal && (
        <Modal open onClose={() => setCreateLoanModal(false)}>
          <ModalDialog
            size="lg"
            sx={{
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              p: 0,
            }}
          >
            <Box sx={{ overflowY: "auto", flex: 1 }}>
              <CreateLoan
                onBack={() => setCreateLoanModal(false)}
                onSuccess={() => {
                  setCreateLoanModal(false); // close modal after creation
                  fetchLoans(); // refresh table
                }}
              />
            </Box>
          </ModalDialog>
        </Modal>
      )}


      {/* VIEW MODAL */}
      {viewApp && (
        <Modal open onClose={() => setViewApp(null)}>
          <ModalDialog size="lg" sx={{ maxHeight: "90vh", overflowY: "auto" }}>
            <Typography level="h5" mb={1}>
              Loan Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
              <Typography><strong>Applicant:</strong> {viewApp.first_name} {viewApp.last_name}</Typography>
              <Typography><strong>Loan Type:</strong> {viewApp.loan_type}</Typography>
              <Typography><strong>Loan Amount:</strong> ₹{viewApp.loan_amount?.toLocaleString()}</Typography>
              <Typography><strong>Status:</strong> {viewApp.status}</Typography>
              <Typography><strong>Society Name:</strong> {viewApp.society_name}</Typography>
              <Typography><strong>Aadhar:</strong> {maskAadhar(viewApp.aadhar_number)}</Typography>
              <Typography><strong>Voter ID:</strong> {maskVoter(viewApp.voter_id)}</Typography>
              <Typography><strong>Mobile:</strong> {maskMobile(viewApp.mobile_number)}</Typography>
              <Typography><strong>Created:</strong> {new Date(viewApp.created_at).toLocaleString()}</Typography>
              <Typography><strong>Remarks:</strong> {viewApp.remarks || "—"}</Typography>
            </Box>
            <Box mt={2} textAlign="right">
              <Button onClick={() => setViewApp(null)}>Close</Button>
            </Box>
          </ModalDialog>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editApp && (
        <Modal open onClose={() => setEditApp(null)}>
          <ModalDialog>
            <Typography level="h5" mb={1}>Edit Loan</Typography>
            <Box display="grid" gap={1}>
              <Input
                placeholder="Aadhar Number"
                value={editApp.aadhar_number || ""}
                onChange={(e) => setEditApp({ ...editApp, aadhar_number: e.target.value })}
              />
              <Input
                placeholder="First Name"
                value={editApp.first_name || ""}
                onChange={(e) => setEditApp({ ...editApp, first_name: e.target.value })}
              />
              <Input
                placeholder="Last Name"
                value={editApp.last_name || ""}
                onChange={(e) => setEditApp({ ...editApp, last_name: e.target.value })}
              />
              <Input
                placeholder="Loan Amount"
                value={editApp.loan_amount || ""}
                onChange={(e) => setEditApp({ ...editApp, loan_amount: e.target.value })}
              />
              <Select
                value={editApp.status || "Due"}
                onChange={(e, val) => setEditApp({ ...editApp, status: val })}
              >
                <Option value="Due">Due</Option>
                <Option value="Overdue">Overdue</Option>
                <Option value="Litigation">Litigation</Option>
                <Option value="Running">Running</Option>
              </Select>
              <Input
                placeholder="Remarks"
                value={editApp.remarks || ""}
                onChange={(e) => setEditApp({ ...editApp, remarks: e.target.value })}
              />
              <Box display="flex" justifyContent="end" gap={1}>
                <Button variant="outlined" color="neutral" onClick={() => setEditApp(null)}>Cancel</Button>
                <Button onClick={handleEditSave}>Save Changes</Button>
              </Box>
            </Box>
          </ModalDialog>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {deleteApp && (
        <Modal open onClose={() => setDeleteApp(null)}>
          <ModalDialog>
            <Typography level="h5" mb={1}>Confirm Delete</Typography>
            <Typography>Are you sure you want to delete this loan?</Typography>
            <Box mt={2} display="flex" justifyContent="end" gap={1}>
              <Button variant="outlined" color="neutral" onClick={() => setDeleteApp(null)}>Cancel</Button>
              <Button color="danger" onClick={handleDelete}>Delete</Button>
            </Box>
          </ModalDialog>
        </Modal>
      )}
    </Box>
  );
};

export default ViewApplications;
