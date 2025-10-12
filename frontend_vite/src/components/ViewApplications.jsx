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
} from "@mui/joy";
import { FileDown, Eye, Pencil, Trash2, Columns3 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { loanAPI } from "../services/api";

const ViewApplications = ({ onBack }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState({
    application_id: true,
    first_name: true,
    last_name: true,
    loan_type: true,
    loan_amount: true,
    status: true,
    society_name: true,
    aadhar_number: true,
    voter_id: true,
    created_at: true,
    created_by: true,
    modified_at: true,
    modified_by: true,
    remarks: true,
  });

  // Fetch loan applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await loanAPI.getLoanApplications();
        const apps = Array.isArray(res.applications)
          ? res.applications
          : res.data?.applications || [];
        setApplications(apps);
      } catch (error) {
        console.error("Error loading applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Aadhaar masking
  const maskAadhar = (num) =>
    num ? num.replace(/\d(?=\d{4})/g, "•") : "—";

  // Export Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(applications);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    XLSX.writeFile(workbook, "loan_applications.xlsx");
  };

  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Loan Applications", 14, 10);
    const tableColumn = Object.keys(visibleColumns).filter(
      (key) => visibleColumns[key]
    );
    const tableRows = applications.map((app) =>
      tableColumn.map((col) => app[col] ?? "")
    );
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("loan_applications.pdf");
  };

  // Column toggling
  const toggleColumn = (col) =>
    setVisibleColumns((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));

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
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography level="h4" fontWeight="lg">
          View Applications
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Column Selection */}
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

          {/* Export Buttons */}
          <Button
            variant="soft"
            color="primary"
            startDecorator={<FileDown size={18} />}
            onClick={exportToExcel}
          >
            Excel
          </Button>
          <Button
            variant="soft"
            color="success"
            startDecorator={<FileDown size={18} />}
            onClick={exportToPDF}
          >
            PDF
          </Button>
        </Box>
      </Box>

      {/* TABLE */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "md",
          boxShadow: "sm",
          overflow: "auto",
        }}
      >
        <Table
          aria-label="applications"
          stickyHeader
          hoverRow
          variant="plain"
          sx={{
            minWidth: 1000,
            "& th": { fontWeight: "600", bgcolor: "background.level1" },
            "& td": { py: 1.5 },
          }}
        >
          <thead>
            <tr>
              {visibleColumns.application_id && <th>Application ID</th>}
              {visibleColumns.first_name && <th>First Name</th>}
              {visibleColumns.last_name && <th>Last Name</th>}
              {visibleColumns.loan_type && <th>Loan Type</th>}
              {visibleColumns.loan_amount && <th>Loan Amount</th>}
              {visibleColumns.status && <th>Status</th>}
              {visibleColumns.society_name && <th>Society Name</th>}
              {visibleColumns.aadhar_number && <th>Aadhar Number</th>}
              {visibleColumns.voter_id && <th>Voter ID</th>}
              {visibleColumns.created_at && <th>Created At</th>}
              {visibleColumns.created_by && <th>Created By</th>}
              {visibleColumns.modified_at && <th>Modified At</th>}
              {visibleColumns.modified_by && <th>Modified By</th>}
              {visibleColumns.remarks && <th>Remarks</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app) => (
                <tr key={app.id}>
                  {visibleColumns.application_id && (
                    <td>{app.application_id}</td>
                  )}
                  {visibleColumns.first_name && <td>{app.first_name}</td>}
                  {visibleColumns.last_name && <td>{app.last_name}</td>}
                  {visibleColumns.loan_type && <td>{app.loan_type}</td>}
                  {visibleColumns.loan_amount && (
                    <td>₹ {app.loan_amount?.toLocaleString()}</td>
                  )}
                  {visibleColumns.status && <td>{app.status}</td>}
                  {visibleColumns.society_name && (
                    <td>{app.society_name}</td>
                  )}
                  {visibleColumns.aadhar_number && (
                    <td>{maskAadhar(app.aadhar_number)}</td>
                  )}
                  {visibleColumns.voter_id && <td>{app.voter_id}</td>}
                  {visibleColumns.created_at && (
                    <td>{new Date(app.created_at).toLocaleString()}</td>
                  )}
                  {visibleColumns.created_by && <td>{app.created_by}</td>}
                  {visibleColumns.modified_at && (
                    <td>{new Date(app.modified_at).toLocaleString()}</td>
                  )}
                  {visibleColumns.modified_by && <td>{app.modified_by}</td>}
                  {visibleColumns.remarks && <td>{app.remarks}</td>}
                  <td>
                    <Tooltip title="View">
                      <IconButton size="sm" variant="plain" color="neutral">
                        <Eye size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="sm" variant="plain" color="primary">
                        <Pencil size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="sm" variant="plain" color="danger">
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} style={{ textAlign: "center", padding: "1rem" }}>
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>

      <Box textAlign="center" mt={3}>
        <Button variant="soft" color="neutral" onClick={onBack}>
          ← Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default ViewApplications;
