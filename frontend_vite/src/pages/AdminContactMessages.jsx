import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Sheet,
  Table,
  Button,
  Chip,
  CircularProgress,
  Stack,
  IconButton,
} from "@mui/joy";
import { toast } from "sonner";
import { contactAPI } from "../services/api";
import { ChevronLeft, ChevronRight, CheckCircle, Trash2 } from "lucide-react";

// ✅ Custom Joy-based Pagination Component
const JoyPagination = ({ page, count, onChange }) => {
  const handlePrev = () => onChange(null, Math.max(1, page - 1));
  const handleNext = () => onChange(null, Math.min(count, page + 1));

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
      py={2}
    >
      <IconButton
        variant="soft"
        color="neutral"
        disabled={page === 1}
        onClick={handlePrev}
      >
        <ChevronLeft size={18} />
      </IconButton>

      <Typography level="body-md">
        Page {page} of {count}
      </Typography>

      <IconButton
        variant="soft"
        color="neutral"
        disabled={page === count}
        onClick={handleNext}
      >
        <ChevronRight size={18} />
      </IconButton>
    </Box>
  );
};

// ✅ Main Admin Contact Messages Page
const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all messages from backend
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await contactAPI.getMessages(page, limit);

      // Adjust data parsing based on backend structure
      setMessages(res.data?.data || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      toast.error("Failed to fetch contact messages");
    } finally {
      setLoading(false);
    }
  };

  // Mark message as read/unread
  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "Unread" ? "Read" : "Unread";
    try {
      await contactAPI.updateStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      fetchMessages();
    } catch (err) {
      toast.error("Failed to update message status");
    }
  };

  // Delete message
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await contactAPI.deleteMessage(id);
      toast.success("Message deleted successfully");
      fetchMessages();
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page]);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", my: 4, px: 2 }}>
      <Typography
        level="h3"
        sx={{ mb: 3, color: "primary.plainColor", textAlign: "center" }}
      >
        Contact Messages
      </Typography>

      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "lg",
          boxShadow: "md",
          bgcolor: "background.body",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <CircularProgress size="lg" />
          </Box>
        ) : messages.length === 0 ? (
          <Typography textAlign="center" sx={{ py: 5, color: "text.tertiary" }}>
            No messages found.
          </Typography>
        ) : (
          <>
            <Table
              variant="plain"
              borderAxis="bothBetween"
              hoverRow
              stickyHeader
              sx={{ minWidth: 700 }}
            >
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>Name</th>
                  <th style={{ width: "20%" }}>Email</th>
                  <th>Message</th>
                  <th style={{ width: "10%" }}>Status</th>
                  <th style={{ width: "20%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id}>
                    <td>{msg.name}</td>
                    <td>{msg.email}</td>
                    <td>{msg.message}</td>
                    <td>
                      <Chip
                        size="sm"
                        variant={msg.status === "Unread" ? "solid" : "soft"}
                        color={msg.status === "Unread" ? "danger" : "success"}
                      >
                        {msg.status}
                      </Chip>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="sm"
                          variant="soft"
                          color={
                            msg.status === "Unread" ? "success" : "neutral"
                          }
                          startDecorator={<CheckCircle size={16} />}
                          onClick={() => handleStatusChange(msg.id, msg.status)}
                        >
                          {msg.status === "Unread"
                            ? "Mark Read"
                            : "Mark Unread"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outlined"
                          color="danger"
                          startDecorator={<Trash2 size={16} />}
                          onClick={() => handleDelete(msg.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* ✅ Joy-based Pagination */}
            <JoyPagination
              page={page}
              count={totalPages}
              onChange={(e, value) => setPage(value)}
            />
          </>
        )}
      </Sheet>
    </Box>
  );
};

export default AdminContactMessages;
