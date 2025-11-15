import React, { useEffect, useState } from "react";
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
  Skeleton,
} from "@mui/joy";
import { toast } from "sonner";
import { contactAPI } from "../services/api";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trash2,
  Eye,
} from "lucide-react";

// ==============================
// Custom Pagination
// ==============================
const JoyPagination = ({ page, count, onChange }) => (
  <Box display="flex" justifyContent="center" alignItems="center" gap={2} py={2}>
    <IconButton
      variant="soft"
      disabled={page === 1}
      onClick={() => onChange(null, Math.max(1, page - 1))}
    >
      <ChevronLeft size={18} />
    </IconButton>

    <Typography>Page {page} of {count}</Typography>

    <IconButton
      variant="soft"
      disabled={page === count}
      onClick={() => onChange(null, Math.min(count, page + 1))}
    >
      <ChevronRight size={18} />
    </IconButton>
  </Box>
);

// ==============================
// Main Component
// ==============================
const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [openModal, setOpenModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Fetch messages from backend
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await contactAPI.getMessages(page, limit);
      const data = res.data?.data || [];

      setMessages(data);
      setFiltered(data);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      toast.error("Failed to fetch contact messages");
    } finally {
      setLoading(false);
    }
  };

  // Filter + Search
  useEffect(() => {
    let result = [...messages];

    if (search.trim()) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()) ||
          m.message.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((m) => m.status === statusFilter);
    }

    setFiltered(result);
  }, [search, statusFilter, messages]);

  // Update message status
  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "Unread" ? "Read" : "Unread";
    try {
      await contactAPI.updateStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      fetchMessages();
    } catch {
      toast.error("Failed to update message status");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await contactAPI.deleteMessage(id);
      toast.success("Message deleted");
      fetchMessages();
    } catch {
      toast.error("Failed to delete message");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page]);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", my: 4, px: 2 }}>
      <Typography level="h3" sx={{ mb: 3, textAlign: "center" }}>
        Contact Messages
      </Typography>

      {/* Search + Filter */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>

        <Input
          placeholder="Search by name, email, message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1 }}
        />

        <Select
          value={statusFilter}
          onChange={(e, val) => setStatusFilter(val)}
          sx={{ width: 180 }}
        >
          <Option value="All">All Status</Option>
          <Option value="Unread">Unread</Option>
          <Option value="Read">Read</Option>
        </Select>
      </Stack>

      <Sheet variant="outlined" sx={{ borderRadius: "lg", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ p: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : filtered.length === 0 ? (
          <Typography sx={{ textAlign: "center", py: 3 }}>
            No messages found.
          </Typography>
        ) : (
          <>
            <Table
              hoverRow
              stickyHeader
              sx={{
                "& th": { whiteSpace: "nowrap", fontWeight: 600 },
                "& td": { verticalAlign: "middle" },
                "& tbody tr:hover": {
                  backgroundColor: "neutral.softBg",
                  cursor: "pointer",
                },
              }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message Preview</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((msg) => (
                  <tr key={msg.id}>
                    <td>{msg.name}</td>
                    <td>{msg.email}</td>

                    {/* Truncated message preview */}
                    <td style={{ maxWidth: 350 }}>
                      {msg.message.length > 60
                        ? msg.message.slice(0, 60) + "..."
                        : msg.message}
                    </td>

                    {/* STATUS */}
                    <td style={{ textAlign: "center" }}>
                      <Chip
                        size="sm"
                        variant={msg.status === "Unread" ? "solid" : "soft"}
                        color={msg.status === "Unread" ? "danger" : "success"}
                      >
                        {msg.status}
                      </Chip>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ textAlign: "center" }}>
                      <Stack direction="row" spacing={1} justifyContent="center">

                        <IconButton
                          variant="soft"
                          color="neutral"
                          onClick={() => {
                            setSelectedMessage(msg);
                            setOpenModal(true);
                          }}
                        >
                          <Eye size={16} />
                        </IconButton>

                        <IconButton
                          variant="soft"
                          color={msg.status === "Unread" ? "success" : "neutral"}
                          onClick={() => handleStatusChange(msg.id, msg.status)}
                        >
                          <CheckCircle size={16} />
                        </IconButton>

                        <IconButton
                          variant="soft"
                          color="danger"
                          onClick={() => handleDelete(msg.id)}
                        >
                          <Trash2 size={16} />
                        </IconButton>

                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <JoyPagination
              page={page}
              count={totalPages}
              onChange={(e, value) => setPage(value)}
            />
          </>
        )}
      </Sheet>

      {/* Modal for full message view */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog sx={{ maxWidth: 500 }}>
          <Typography level="h4">{selectedMessage?.name}</Typography>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            {selectedMessage?.email}
          </Typography>
          <Divider />
          <Typography sx={{ mt: 2, whiteSpace: "pre-line" }}>
            {selectedMessage?.message}
          </Typography>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default AdminContactMessages;
