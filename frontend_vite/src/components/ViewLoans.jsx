import React, { useState, useEffect } from "react";
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
  FormControl,
} from "@mui/joy";
import { FileDown, Eye, Pencil, Trash2, Columns3, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { loanAPI } from "../services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 5;

const ViewLoans = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState({
    borrower_name: true,
    loan_type: true,
    loan_amount: true,
    status: true,
    society_name: true,
    branch_name: true,
    aadhar_number: true,
    pan_number: false,
    mobile_number: true,
    created_at: true,
    created_by: true,
    remarks: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [viewApp, setViewApp] = useState(null);
  const [editApp, setEditApp] = useState(null);
  const [deleteApp, setDeleteApp] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  // Fetch Loans (server-side pagination)
  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await loanAPI.getLoanApplications({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchTerm,
        bank_id: currentUser.role !== "admin" ? currentUser.bank_id || "" : "",
        branch_id: currentUser.role !== "admin" ? currentUser.branch_id || "" : "",
      });

      let apps = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      // Role-based filters
    if (currentUser.role === "manager" || currentUser.role === "user") {
      apps = apps.filter(
        (a) =>
          String(a.bank_id) === String(currentUser.bank_id) &&
          String(a.branch_id) === String(currentUser.branch_id)
      );
    }
      setApplications(apps);
      setTotalPages(res.data?.pages || 1);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load Loans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchLoans();
  }, 400);
  return () => clearTimeout(delayDebounce);
}, [page, searchTerm]);

  // const maskAadhar = (num) => (num ? num.replace(/\d(?=\d{4})/g, "•") : "—");
  // const maskPan = (num) => (num ? num.replace(/\w(?=\w{4})/g, "•") : "—");
  // const maskMobile = (num) => (num ? num.replace(/\d(?=\d{4})/g, "•") : "—");

  // Export Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(applications);
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
          💰 Loans
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="solid"
            color="primary"
            onClick={() => navigate("/create-loan")}
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
            minWidth: 700,
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
              tableLayout: "auto",
            }}
          >
            <thead>
              <tr>
                {visibleColumns.borrower_name && <th>Borrower Name</th>}
                {visibleColumns.loan_type && <th>Loan Type</th>}
                {visibleColumns.loan_amount && <th>Loan Amount</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.society_name && <th>Society</th>}
                {visibleColumns.branch_name && <th>Branch</th>}
                {visibleColumns.aadhar_number && <th>Aadhar</th>}
                {visibleColumns.pan_number && <th>PAN</th>}
                {visibleColumns.mobile_number && <th>Mobile</th>}
                {visibleColumns.created_at && <th>Created At</th>}
                {visibleColumns.created_by && <th>Created By</th>}
                {visibleColumns.remarks && <th>Remarks</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app.application_id}>
                    {visibleColumns.borrower_name && (
                      <td>
                        {app.first_name} {app.last_name}
                      </td>
                    )}
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
                    {visibleColumns.branch_name && <td>{app.branch_name}</td>}
                    {visibleColumns.aadhar_number && (
                      <td>{app.aadhar_number}</td>
                    )}
                    {visibleColumns.pan_number && (
                      <td>{app.pan_number}</td>
                    )}
                    {visibleColumns.mobile_number && (
                      <td>{app.mobile_number}</td>
                    )}
                    {visibleColumns.created_at && (
                      <td>{new Date(app.created_at).toLocaleString()}</td>
                    )}
                    {visibleColumns.created_by && <td>{app.created_by}</td>}
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
                    No loans found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Sheet>
      </Box>

           {/* PAGINATION */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 3,
          mb: 10, // 👈 Add bottom margin to push it above footer
          position: "relative",
          zIndex: 2, // 👈 Ensure it's above the footer layer
          backgroundColor: "background.body", // optional: keeps pagination readable
          py: 1, // small vertical padding
        }}
      >
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

      {/* VIEW / EDIT / DELETE MODALS remain unchanged */}
      {/* VIEW MODAL */}
      {viewApp && (
        <Modal open onClose={() => setViewApp(null)}>
          <ModalDialog
            size="lg"
            sx={{ maxHeight: "90vh", overflowY: "auto", p: 3 }}
          >
            <Typography level="h5" mb={2}>
              💰 Loan Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
              gap={2}
            >
              {[
                ["Borrower Name", `${viewApp.first_name} ${viewApp.last_name}`],
                ["Loan Type", viewApp.loan_type],
                ["Loan Amount", `₹${viewApp.loan_amount?.toLocaleString()}`],
                ["Status", viewApp.status],
                ["Society Name", viewApp.society_name],
                ["Branch Name", viewApp.branch_name],
                ["Aadhar", viewApp.aadhar_number],
                ["PAN Number", viewApp.pan_number],
                ["Mobile", viewApp.mobile_number],
                ["Created", new Date(viewApp.created_at).toLocaleString()],
                ["Remarks", viewApp.remarks || "—"],
              ].map(([key, value]) => (
                <Box
                  key={key}
                  display="flex"
                  gap={1}
                >
                  <Typography
                    fontWeight="lg"
                    flex="0 0 140px"
                    sx={{ textAlign: "left", whiteSpace: "nowrap" }}
                  >
                    {key}:
                  </Typography>
                  <Typography flex="1">{value}</Typography>
                </Box>
              ))}
            </Box>

            <Box mt={3} textAlign="right">
              <Button onClick={() => setViewApp(null)}>Close</Button>
            </Box>
          </ModalDialog>
        </Modal>
      )}

      {/* EDIT MODAL & DELETE MODAL unchanged */}
      {editApp && (
        <Modal open={!!editApp} onClose={() => setEditApp(null)}>
          <ModalDialog
            sx={{
              maxHeight: "90vh",
              overflowY: "auto",
              width: { xs: "95%", sm: "600px" },
            }}
          >
            <Typography level="h5" mb={2}>
              ✏️ Edit Loan Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <FormControl>
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  Society Name
                </Typography>
                <Input value={editApp.society_name || ""} disabled variant="soft" />
              </FormControl>

              <FormControl>
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  Branch Name
                </Typography>
                <Input value={editApp.branch_name || ""} disabled variant="soft" />
              </FormControl>

              <FormControl>
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  Borrower First Name
                </Typography>
                <Input
                  value={editApp.first_name || ""}
                  onChange={(e) =>
                    setEditApp({ ...editApp, first_name: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  Borrower Last Name
                </Typography>
                <Input
                  value={editApp.last_name || ""}
                  onChange={(e) =>
                    setEditApp({ ...editApp, last_name: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  Aadhar Number
                </Typography>
                <Input
                  value={editApp.aadhar_number || ""}
                  onChange={(e) =>
                    setEditApp({ ...editApp, aadhar_number: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  PAN Number
                </Typography>
                <Input
                  value={editApp.pan_number || ""}
                  onChange={(e) =>
                    setEditApp({ ...editApp, pan_number: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  Loan Amount
                </Typography>
                <Input
                  type="number"
                  value={editApp.loan_amount || ""}
                  onChange={(e) =>
                    setEditApp({ ...editApp, loan_amount: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  Status
                </Typography>
                <Select
                  value={editApp.status || "Due"}
                  onChange={(e, val) => setEditApp({ ...editApp, status: val })}
                >
                  <Option value="Due">Due</Option>
                  <Option value="Overdue">Overdue</Option>
                  <Option value="Litigation">Litigation</Option>
                  <Option value="Running">Running</Option>
                </Select>
              </FormControl>

              <FormControl sx={{ gridColumn: "1 / -1" }}>
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  Remarks
                </Typography>
                <Input
                  value={editApp.remarks || ""}
                  onChange={(e) =>
                    setEditApp({ ...editApp, remarks: e.target.value })
                  }
                />
              </FormControl>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => setEditApp(null)}
              >
                Cancel
              </Button>
              <Button color="primary" onClick={handleEditSave}>
                Save Changes
              </Button>
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

export default ViewLoans;
