import React from "react";

const SortableHeader = ({ label, columnKey, sortColumn, sortDirection, onSort }) => {
  const handleClick = () => onSort(columnKey);

  let arrow = "";
  if (sortColumn === columnKey) {
    if (sortDirection === "asc") arrow = "▲";
    else if (sortDirection === "desc") arrow = "▼";
  }

  return (
    <th style={thStyle} onClick={handleClick}>
      {label} {arrow}
    </th>
  );
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  backgroundColor: "#f5f5f5",
  cursor: "pointer",
};

export default SortableHeader;
