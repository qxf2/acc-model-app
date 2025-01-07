import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  Compare as CompareIcon,
  RateReview,
  ExpandLess,
  ExpandMore,
  People,
  MiscellaneousServices,
  Settings,
} from "@mui/icons-material";

const DrawerComponent = ({ isAuthenticated, drawerOpen, toggleDrawer, toggleModels, openModels }) => {
  return (
    <Drawer
      variant="permanent"
      open={drawerOpen}
      onClose={toggleDrawer}
      sx={{
        width: drawerOpen ? 240 : 60,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerOpen ? 240 : 60,
          boxSizing: "border-box",
          backgroundColor: "#2E5D53",
          color: "white",
          boxShadow: "2px 0px 5px rgba(0, 0, 0, 0.1)",
          marginTop: "64px",
          height: `calc(100% - 64px)`,
        },
      }}
    >
      <Divider />
      {isAuthenticated && (
        <List>
          <ListItem component={Link} to="/dashboard">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <Divider />

          <ListItem component={Link} to="/historical-comparison">
            <ListItemIcon>
              <CompareIcon />
            </ListItemIcon>
            <ListItemText primary="Ratings Trends" />
          </ListItem>

          <Divider />

          <ListItem component={Link} to="/ratings">
            <ListItemIcon>
              <RateReview />
            </ListItemIcon>
            <ListItemText primary="Submit Ratings" />
          </ListItem>

          <Divider />
          <ListItem onClick={toggleModels}>
            <ListItemIcon>
              <MiscellaneousServices />
            </ListItemIcon>
            <ListItemText primary="Manage" />
            {openModels ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={openModels} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem component={Link} to="/acc-models" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="ACC Models" />
              </ListItem>

              <ListItem component={Link} to="/attributes" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="Attributes" />
              </ListItem>

              <ListItem component={Link} to="/components" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="Components" />
              </ListItem>

              <ListItem component={Link} to="/capabilities" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="Capabilities" />
              </ListItem>
            </List>
          </Collapse>

          <Divider />

          <ListItem component={Link} to="/users">
            <ListItemIcon>
              <People />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>

          <Divider />
        </List>
      )}
    </Drawer>
  );
};

export default DrawerComponent;
