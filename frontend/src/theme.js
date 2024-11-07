import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4B8077", // Sage green
      light: "#8BB3A1", // Lighter sage green
      dark: "#2E5D53", // Darker sage green
    },
    secondary: {
      main: "#FF6F61", // Coral
      light: "#FF8A75", // Lighter coral
      dark: "#D75948", // Darker coral
    },
    background: {
      default: "#F2F8F6", // Light sage green for main background
      paper: "#E4EFED", // Slightly darker sage for card background
    },
    text: {
      primary: "#2E403B", // Dark green-gray for primary text
      secondary: "#5F7269", // Medium gray-green for secondary text
    },
    table: {
      header: {
        background: "#C7D9D3", // Dark sage green for table header
        color: "#C7D9D3",
      },
      row: {
        background: "#E5EFEA", // Dark sage green for table row
      },
    },
    action: {
      active: "#3A756B", // Dark sage green for active icons or links
    },
    tableHeader: {
      background: "#E0F2EF", // Dark sage green for table header
      color: "#283593",
    },
    custom: {
      itemBackground: "#E0F2EF",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#E0F2EF",
          color: "#283593",
          fontWeight: "bold",
          padding: "0.5rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#EDF7F2",
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontWeight: "bold",
          color: "#CBE7E0",
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "#CBE7E0",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "#CBE7E0",
        },
      },
    },
  },
});

export default theme;
