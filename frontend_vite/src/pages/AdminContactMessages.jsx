import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Sheet,
  Table,
  Button,
  Chip,
  Stack,
  IconButton,
  Input,
  Select,
  Option,
  Modal,
  ModalDialog,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  FormControl,
  FormLabel,
  Slider,
  Badge,
} from "@mui/joy";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { contactAPI } from "../services/api";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trash2,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer,
} from "lucide-react";
import * as XLSX from "xlsx";

// ---------- Helpers ----------
const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const inDateRange = (isoStr, range) => {
  if (!isoStr) return false;
  const d = new Date(isoStr);
  const now = new Date();
  if (range === "All") return true;
  if (range === "Today") {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }
  if (range === "This Week") {
    // week starts Monday
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const weekNow = Math.ceil(((now - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
    const weekD = Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
    return weekNow === weekD && d.getFullYear() === now.getFullYear();
  }
  if (range === "This Month") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  return true;
};

const downloadCSV = (rows, filename = "messages.csv") => {
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = r[h] ?? "";
          // escape quotes
          return `"${String(v).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const exportXLSX = (rows, filename = "messages.xlsx") => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Messages");
  XLSX.writeFile(wb, filename);
};

// highlight matched text
const highlightText = (text = "", query = "") => {
  if (!query) return text;
  const q = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${q})`, "ig");
  const parts = String(text).split(re);
  return parts.map((part, i) =>
    re.test(part) ? (
      <mark key={i} style={{ background: "rgba(255,235,59,0.5)", padding: "0 2px" }}>
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

// ---------- Pagination component (enhanced) ----------
const JoyPagination = ({ page, count, onChange, onRowsPerPageChange, rowsPerPage }) => {
  const pageButtons = [];
  const visible = 5;
  let start = Math.max(1, page - Math.floor(visible / 2));
  let end = start + visible - 1;
  if (end > count) {
    end = count;
    start = Math.max(1, end - visible + 1);
  }
  for (let i = start; i <= end; i++) pageButtons.push(i);

  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ p: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button variant="soft" size="sm" onClick={() => onChange(null, 1)} disabled={page === 1}>
          First
        </Button>
        <IconButton variant="outlined" size="sm" onClick={() => onChange(null, Math.max(1, page - 1))} disabled={page === 1}>
          <ChevronLeft size={16} />
        </IconButton>
        {pageButtons.map((p) => (
          <Button
            key={p}
            variant={p === page ? "solid" : "plain"}
            color={p === page ? "primary" : "neutral"}
            size="sm"
            onClick={() => onChange(null, p)}
          >
            {p}
          </Button>
        ))}
        <IconButton variant="outlined" size="sm" onClick={() => onChange(null, Math.min(count, page + 1))} disabled={page === count}>
          <ChevronRight size={16} />
        </IconButton>
        <Button variant="soft" size="sm" onClick={() => onChange(null, count)} disabled={page === count}>
          Last
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography level="body-sm">Rows</Typography>
        <Select
          value={rowsPerPage}
          onChange={(e, val) => onRowsPerPageChange(val)}
          size="sm"
          sx={{ width: 92 }}
        >
          {[5, 10, 20, 50].map((n) => (
            <Option key={n} value={n}>
              {n}
            </Option>
          ))}
        </Select>
      </Stack>
    </Stack>
  );
};

// ---------- Main Component ----------
const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // controls
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const [sortBy, setSortBy] = useState({ key: "created_at", dir: "desc" });

  // modal & expand
  const [openModal, setOpenModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // UI menu for export/print
  const [exportAnchor, setExportAnchor] = useState(null);

  // fetch list from backend (we keep your existing API signature)
  const fetchMessages = async (p = page, limit = rowsPerPage) => {
    try {
      setLoading(true);
      const res = await contactAPI.getMessages(p, limit);
      const data = res.data?.data || [];
      setMessages(data);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      toast.error("Failed to fetch contact messages");
    } finally {
      setLoading(false);
    }
  };

  // change page or rows per page
  useEffect(() => {
    fetchMessages(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // Derived & filtered data
  const filtered = useMemo(() => {
    let arr = Array.isArray(messages) ? [...messages] : [];

    // date filter (created_at)
    arr = arr.filter((m) => inDateRange(m.created_at, dateFilter));

    // status filter
    if (statusFilter !== "All") {
      arr = arr.filter((m) => m.status === statusFilter);
    }

    // search
    const q = (search || "").trim().toLowerCase();
    if (q) {
      arr = arr.filter(
        (m) =>
          (m.name || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q) ||
          (m.message || "").toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy?.key) {
      arr.sort((a, b) => {
        const A = (a[sortBy.key] ?? "").toString().toLowerCase();
        const B = (b[sortBy.key] ?? "").toString().toLowerCase();
        if (A < B) return sortBy.dir === "asc" ? -1 : 1;
        if (A > B) return sortBy.dir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }, [messages, search, statusFilter, dateFilter, sortBy]);

  // API actions
  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "Unread" ? "Read" : "Unread";
    try {
      await contactAPI.updateStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      fetchMessages(page, rowsPerPage);
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((s) => ({ ...s, status: newStatus }));
      }
    } catch {
      toast.error("Failed to update message status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await contactAPI.deleteMessage(id);
      toast.success("Message deleted");
      // after delete, refresh
      fetchMessages(page, rowsPerPage);
      if (selectedMessage && selectedMessage.id === id) {
        setOpenModal(false);
        setSelectedMessage(null);
      }
    } catch {
      toast.error("Failed to delete message");
    }
  };

  // open modal
  const openViewer = (msg) => {
    setSelectedMessage(msg);
    setOpenModal(true);
  };

  // Export / Print handlers
  const handleExportMenu = (e) => setExportAnchor(e.currentTarget);
  const handleCloseExport = () => setExportAnchor(null);

  const handleExportCSV = () => {
    if (!filtered.length) return toast.error("No data to export");
    const rows = filtered.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      message: r.message,
      status: r.status,
      created_at: r.created_at,
    }));
    downloadCSV(rows);
    handleCloseExport();
  };

  const handleExportXLSX = () => {
    if (!filtered.length) return toast.error("No data to export");
    const rows = filtered.map((r) => ({
      ID: r.id,
      Name: r.name,
      Email: r.email,
      Message: r.message,
      Status: r.status,
      CreatedAt: r.created_at,
    }));
    exportXLSX(rows);
    handleCloseExport();
  };

  const handlePrint = () => {
    window.print();
  };

  // sortable header click
  const handleSort = (key) => {
    if (sortBy.key === key) {
      setSortBy((s) => ({ key, dir: s.dir === "asc" ? "desc" : "asc" }));
    } else {
      setSortBy({ key, dir: "asc" });
    }
  };

  // small-screen card view
  const MobileCard = ({ msg }) => (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: "md",
        p: 2,
        mb: 1,
        boxShadow: "sm",
      }}
    >
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography level="body-md" fontWeight="lg">
            {highlightText(msg.name, search)}
          </Typography>
          <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
            {highlightText(msg.email || "—", search)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Chip size="sm" color={msg.status === "Unread" ? "danger" : "success"}>
            {msg.status}
          </Chip>
        </Box>
      </Stack>

      <Box sx={{ mt: 1 }}>
        <Typography level="body-sm" sx={{ whiteSpace: "pre-line" }}>
          {msg.message.length > 140 ? (
            <>
              {highlightText(msg.message.slice(0, 140) + "...", search)}{" "}
              <Button variant="plain" size="sm" onClick={() => openViewer(msg)}>
                Read more
              </Button>
            </>
          ) : (
            highlightText(msg.message, search)
          )}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }} justifyContent="flex-end">
        <IconButton variant="outlined" onClick={() => openViewer(msg)}><Eye size={16} /></IconButton>
        <IconButton
          variant="soft"
          color={msg.status === "Unread" ? "success" : "neutral"}
          onClick={() => handleStatusChange(msg.id, msg.status)}
        >
          <CheckCircle size={16} />
        </IconButton>
        <IconButton variant="outlined" color="danger" onClick={() => handleDelete(msg.id)}>
          <Trash2 size={16} />
        </IconButton>
      </Stack>
    </Sheet>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", my: 4, px: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography level="h4">Contact Messages</Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="plain" startDecorator={<FileText size={16} />} onClick={handleExportMenu}>
            Export
          </Button>
          <Menu open={Boolean(exportAnchor)} anchorEl={exportAnchor} onClose={handleCloseExport}>
            <MenuItem onClick={handleExportCSV}>Download CSV</MenuItem>
            <MenuItem onClick={handleExportXLSX}>Download XLSX</MenuItem>
            <MenuItem onClick={handlePrint}>Print</MenuItem>
          </Menu>

          <Button variant="solid" color="danger" startDecorator={<Trash2 size={16} />} onClick={() => {
            if (!window.confirm("Delete all messages?")) return;
            toast.error("Bulk delete NOT implemented (safety)"); // keep safe
          }}>
            Bulk Delete
          </Button>
        </Stack>
      </Stack>

      {/* Filters + Search */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Input
          placeholder="Search name, email, message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startDecorator={<ChevronDown size={16} />}
          sx={{ flex: 1 }}
        />

        <Select value={statusFilter} onChange={(e, val) => setStatusFilter(val)} size="sm" sx={{ width: 140 }}>
          <Option value="All">All</Option>
          <Option value="Unread">Unread</Option>
          <Option value="Read">Read</Option>
        </Select>

        <Select value={dateFilter} onChange={(e, val) => setDateFilter(val)} size="sm" sx={{ width: 160 }}>
          <Option value="All">All Dates</Option>
          <Option value="Today">Today</Option>
          <Option value="This Week">This Week</Option>
          <Option value="This Month">This Month</Option>
        </Select>
      </Stack>

      <Sheet variant="outlined" sx={{ borderRadius: "lg", p: 0, overflow: "hidden" }}>
        {/* Desktop Table (hidden on xs) */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table
              hoverRow
              stickyHeader
              sx={{
                minWidth: 900,
                tableLayout: "fixed",
                "& th": { whiteSpace: "nowrap", fontWeight: 700, fontSize: 14 },
                "& td": { verticalAlign: "top", wordBreak: "break-word", whiteSpace: "normal", padding: "12px 10px" },
                "& tbody tr:hover": { backgroundColor: "neutral.softBg" },
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "16%" }}>
                    <Button variant="plain" endDecorator={sortBy.key === "name" ? (sortBy.dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null} onClick={() => handleSort("name")}>
                      Name
                    </Button>
                  </th>
                  <th style={{ width: "20%" }}>
                    <Button variant="plain" endDecorator={sortBy.key === "email" ? (sortBy.dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null} onClick={() => handleSort("email")}>
                      Email
                    </Button>
                  </th>
                  <th style={{ width: "36%" }}>
                    Message
                  </th>
                  <th style={{ width: "12%", textAlign: "center" }}>
                    <Button variant="plain" onClick={() => handleSort("created_at")}>
                      Created
                      {sortBy.key === "created_at" ? (sortBy.dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                    </Button>
                  </th>
                  <th style={{ width: "8%", textAlign: "center" }}>Status</th>
                  <th style={{ width: "8%", textAlign: "center", position: "sticky", right: 0, background: "var(--joy-palette-background-body)", zIndex: 3 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((msg) => (
                  <React.Fragment key={msg.id}>
                    <tr>
                      <td>{highlightText(msg.name || "—", search)}</td>
                      <td>{highlightText(msg.email || "—", search)}</td>
                      <td style={{ maxWidth: 420 }}>
                        {msg.message.length > 160 ? (
                          <span>{highlightText(msg.message.slice(0, 160) + "...", search)}</span>
                        ) : (
                          highlightText(msg.message || "—", search)
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>{formatDate(msg.created_at)}</td>
                      <td style={{ textAlign: "center" }}>
                        <Chip size="sm" variant={msg.status === "Unread" ? "solid" : "soft"} color={msg.status === "Unread" ? "danger" : "success"}>
                          {msg.status}
                        </Chip>
                      </td>
                      <td style={{ textAlign: "center", position: "sticky", right: 0, background: "transparent" }}>
                        <Stack direction="row" spacing={1} justifyContent="center" sx={{ whiteSpace: "nowrap" }}>
                          <IconButton variant="plain" onClick={() => openViewer(msg)}>
                            <Eye size={16} />
                          </IconButton>
                          <IconButton variant="soft" color={msg.status === "Unread" ? "success" : "neutral"} onClick={() => handleStatusChange(msg.id, msg.status)}>
                            <CheckCircle size={16} />
                          </IconButton>
                          <IconButton variant="outlined" color="danger" onClick={() => handleDelete(msg.id)}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Stack>
                      </td>
                    </tr>

                    {/* Expand row (Framer Motion) */}
                    <AnimatePresence initial={false}>
                      {expandedRow === msg.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={6} style={{ background: "var(--joy-palette-background-surface)", padding: 12 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box sx={{ maxWidth: 900 }}>
                                <Typography level="body-md" sx={{ mb: 1 }}>{msg.name} — {msg.email}</Typography>
                                <Typography level="body-sm" sx={{ whiteSpace: "pre-line" }}>{msg.message}</Typography>
                              </Box>

                              <Stack spacing={1}>
                                <Button size="sm" variant="soft" onClick={() => handleStatusChange(msg.id, msg.status)} startDecorator={<CheckCircle size={14} />}>
                                  {msg.status === "Unread" ? "Mark Read" : "Mark Unread"}
                                </Button>
                                <Button size="sm" variant="outlined" color="danger" onClick={() => handleDelete(msg.id)} startDecorator={<Trash2 size={14} />}>
                                  Delete
                                </Button>
                              </Stack>
                            </Stack>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </Box>

          {/* Pagination (desktop) */}
          <JoyPagination
            page={page}
            count={totalPages}
            onChange={(e, v) => setPage(v)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n);
              setPage(1);
            }}
          />
        </Box>

        {/* Mobile cards (visible xs -> md) */}
        <Box sx={{ display: { xs: "block", md: "none" }, p: 2 }}>
          {loading ? (
            <Stack spacing={1}>
              <CircularProgress />
            </Stack>
          ) : filtered.length === 0 ? (
            <Typography textAlign="center" sx={{ py: 3 }}>No messages</Typography>
          ) : (
            filtered.map((msg) => (
              <Box key={msg.id} sx={{ mb: 1 }}>
                <MobileCard msg={msg} />
              </Box>
            ))
          )}

          <JoyPagination
            page={page}
            count={totalPages}
            onChange={(e, v) => setPage(v)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n);
              setPage(1);
            }}
          />
        </Box>
      </Sheet>

      {/* Viewer modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog sx={{ width: { xs: "92%", sm: 600 } }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography level="h5">{selectedMessage?.name}</Typography>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  {selectedMessage?.email} • {formatDate(selectedMessage?.created_at)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button size="sm" variant="outlined" startDecorator={<FileText size={14} />} onClick={() => {
                  if (!selectedMessage) return;
                  downloadCSV([selectedMessage], `message-${selectedMessage.id}.csv`);
                }}>
                  Export
                </Button>

                <IconButton variant="plain" onClick={() => handleStatusChange(selectedMessage.id, selectedMessage.status)}>
                  <CheckCircle size={16} />
                </IconButton>

                <IconButton variant="outlined" color="danger" onClick={() => handleDelete(selectedMessage.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </Stack>
            </Stack>

            <Divider />

            <Typography level="body-md" sx={{ whiteSpace: "pre-line" }}>
              {selectedMessage?.message}
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="plain" onClick={() => setOpenModal(false)}>Close</Button>
              <Button variant="solid" onClick={() => setOpenModal(false)}>Done</Button>
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default AdminContactMessages;
