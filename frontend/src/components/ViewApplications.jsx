import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Toolbar,
  Typography,
  TextField,
  Checkbox,
  IconButton,
  FormControlLabel,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
} from "@mui/material";
import { SlidersHorizontal, FileDown, Edit3, Trash2 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { getLoanApplications } from "../services/api";

const ALL_COLUMNS = [
  { accessorKey: "society_name", header: "Society" },
  { accessorKey: "loan_type", header: "Loan Type" },
  { accessorKey: "loan_amount", header: "Amount" },
  { accessorKey: "status", header: "Lead Status" },
  { accessorKey: "voter_id", header: "Borrower Voter ID" },
  { accessorKey: "remarks", header: "Remarks" },
  { accessorKey: "created_at", header: "Created At" },
  { accessorKey: "created_by", header: "Created By" },
  { accessorKey: "modified_at", header: "Modified At" },
  { accessorKey: "modified_by", header: "Modified By" },
];

const ViewApplications = () => {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState(
    Object.fromEntries(ALL_COLUMNS.map((c) => [c.accessorKey, true]))
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  const showToast = (message, severity = "info") =>
    setToast({ open: true, message, severity });

  const handleCloseToast = () => setToast({ ...toast, open: false });

  /**  Fetch loan applications */
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLoanApplications(page + 1, pageSize, searchTerm, "latest");
      setApplications(response.applications || []);
    } catch (error) {
      console.error(" Error fetching applications:", error);
      showToast("Failed to fetch applications", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    const timeout = setTimeout(fetchApplications, 400);
    return () => clearTimeout(timeout);
  }, [fetchApplications]);

  /**  Export to Excel */
  const exportToExcel = () => {
    if (!applications.length) return showToast("No data to export", "warning");
    const worksheet = XLSX.utils.json_to_sheet(applications);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    XLSX.writeFile(workbook, "LoanApplications.xlsx");
    showToast("Exported to Excel successfully", "success");
  };

  /** 🧠 Table columns configuration */
  const columns = useMemo(
    () => [
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleEditOpen(row.original)}
            >
              <Edit3 size={18} />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 size={18} />
            </IconButton>
          </Box>
        ),
      },
      { accessorKey: "first_name", header: "Applicant Name" },
      { accessorKey: "aadhar_number", header: "Aadhar Number" },
      ...ALL_COLUMNS,
    ],
    []
  );

  /** ⚙️ React Table setup */
  const table = useReactTable({
    data: applications,
    columns,
    state: {
      sorting,
      columnVisibility,
      globalFilter: searchTerm,
      pagination: { pageIndex: page, pageSize },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex: page }) : updater;
      setPage(next.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  /** ⚙️ Column visibility handlers */
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const toggleColumn = (key) =>
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }));

  /** 🗓️ Date formatter */
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  /** ✏️ Edit modal handlers */
  const handleEditOpen = (app) => {
    setSelectedApp(app);
    setEditData({
      aadhar_number: app.aadhar_number,
      first_name: app.first_name,
      last_name: app.last_name,
      loan_amount: app.loan_amount,
      status: app.status,
      remarks: app.remarks,
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (key, value) =>
    setEditData((prev) => ({ ...prev, [key]: value }));

  const handleEditSave = async () => {
    try {
      setLoading(true);
      const payload = {
        aadhar_number: editData.aadhar_number,
        first_name: editData.first_name,
        last_name: editData.last_name,
        loan_amount: parseFloat(editData.loan_amount) || 0,
        status: editData.status,
        remarks: editData.remarks,
      };

      const response = await fetch(
        `http://localhost:5000/api/loans/applications/${selectedApp.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Update failed");

      showToast("Application updated successfully!", "success");
      setEditModalOpen(false);
      await fetchApplications();
    } catch (error) {
      console.error(" Error updating application:", error);
      showToast("Failed to update application", "error");
    } finally {
      setLoading(false);
    }
  };

  /** 🗑️ Delete handler */
  const handleDelete = async (app) => {
    if (!window.confirm(`Are you sure you want to delete application for ${app.first_name}?`))
      return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/loans/applications/${app.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Delete failed");
      showToast("Application deleted successfully", "success");
      await fetchApplications();
    } catch (error) {
      console.error(" Error deleting application:", error);
      showToast("Failed to delete application", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Loan Applications
      </Typography>

      {/* Toolbar */}
      <Card sx={{ mb: 2, boxShadow: 2, borderRadius: 2, position: "sticky", top: 70, zIndex: 10 }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            backgroundColor: "#f9fafb",
          }}
        >
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search applications"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300, backgroundColor: "white" }}
          />
          <Box>
            <Button
              variant="contained"
              startIcon={<FileDown size={18} />}
              onClick={exportToExcel}
              sx={{ mr: 1 }}
            >
              Export Excel
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <SlidersHorizontal size={18} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
              {ALL_COLUMNS.map((col) => (
                <MenuItem key={col.accessorKey}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!columnVisibility[col.accessorKey]}
                        onChange={() => toggleColumn(col.accessorKey)}
                      />
                    }
                    label={col.header}
                  />
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Card>

      {/* Table */}
      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableCell
                          key={header.id}
                          sortDirection={
                            header.column.getIsSorted()
                              ? header.column.getIsSorted() === "desc"
                                ? "desc"
                                : "asc"
                              : false
                          }
                          sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                        >
                          {header.isPlaceholder ? null : (
                            <TableSortLabel
                              active={!!header.column.getIsSorted()}
                              direction={
                                header.column.getIsSorted() === "desc" ? "desc" : "asc"
                              }
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </TableSortLabel>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>

                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow hover key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.column.id.includes("created at") ||
                            cell.column.id.includes("modified at")
                              ? formatDate(cell.getValue())
                              : flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 3,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          Previous
        </Button>
        <Typography variant="body2" color="text.secondary">
          Page {table.getState().pagination.pageIndex + 1}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Next
        </Button>
      </Box>

      {/* ✏️ Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Application</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Aadhar Number"
                value={editData.aadhar_number || ""}
                onChange={(e) => handleEditChange("aadhar_number", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editData.first_name || ""}
                onChange={(e) => handleEditChange("first_name", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editData.last_name || ""}
                onChange={(e) => handleEditChange("last_name", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Loan Amount"
                type="number"
                value={editData.loan_amount || ""}
                onChange={(e) => handleEditChange("loan_amount", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={editData.status || ""}
                  onChange={(e) => handleEditChange("status", e.target.value)}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Remarks"
                value={editData.remarks || ""}
                onChange={(e) => handleEditChange("remarks", e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/*  Snackbar Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewApplications;
