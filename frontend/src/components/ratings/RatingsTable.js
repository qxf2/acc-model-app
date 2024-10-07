import React from "react";
import {
  Box,
  Typography,
  IconButton,
  TableCell,
  TableRow,
  Select,
  MenuItem,
} from "@mui/material";
import { ExpandMore, ExpandLess, Edit } from "@mui/icons-material";

/**
 * A table for displaying and editing capability ratings.
 *
 * @param {object} components A list of component objects with their IDs and names.
 * @param {object} attributes A list of attribute objects with their IDs and names.
 * @param {object} expandedComponents A dictionary mapping component IDs to booleans
 *   of whether the component is currently expanded.
 * @param {function} handleToggleExpand A function to call when a component row is
 *   clicked. It takes the ID of the component row.
 * @param {object} capabilities A list of capability objects with their IDs, names,
 *   and component IDs.
 * @param {object} ratings A dictionary mapping capability IDs and attribute IDs to
 *   rating values.
 * @param {function} handleRatingChange A function to call when a rating value is
 *   changed. It takes the capability ID, attribute ID, and new rating value.
 * @param {function} handleOpenModal A function to call when the edit icon is
 *   clicked. It takes the capability ID and attribute ID.
 * @param {array} ratingOptions A list of rating options.
 *
 * @returns {ReactElement} A table element.
 */
const RatingsTable = ({
  components,
  attributes,
  expandedComponents,
  handleToggleExpand,
  capabilities,
  ratings,
  handleRatingChange,
  handleOpenModal,
  ratingOptions,
}) => (
  <>
    {components.map((component) => (
      <React.Fragment key={component.id}>
        <TableRow>
          <TableCell>
            <Box display="flex" alignItems="center">
              <IconButton onClick={() => handleToggleExpand(component.id)}>
                {expandedComponents[component.id] ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
              </IconButton>
              <Typography
                variant="h6"
                component="h2"
                style={{ fontSize: "1.25rem" }}
              >
                {component.name}
              </Typography>
            </Box>
          </TableCell>
          {attributes.map((attribute) => (
            <TableCell key={`${component.id}-${attribute.id}`}>
              {/* Empty component row cells */}
            </TableCell>
          ))}
        </TableRow>
        {expandedComponents[component.id] &&
          capabilities
            .filter((cap) => cap.componentId === component.id)
            .flatMap((cap) => cap.capabilities)
            .map((capability) => (
              <TableRow key={capability.id}>
                <TableCell style={{ paddingLeft: "2rem" }}>
                  {capability.name}
                </TableCell>
                {attributes.map((attribute) => (
                  <TableCell
                    key={`${capability.id}-${attribute.id}`}
                    style={{ position: "relative" }}
                  >
                    <Select
                      value={
                        ratings[`${capability.id}-${attribute.id}`]?.rating ||
                        ""
                      }
                      onChange={(e) =>
                        handleRatingChange(
                          capability.id,
                          attribute.id,
                          e.target.value
                        )
                      }
                      displayEmpty
                      fullWidth
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {ratingOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    <IconButton
                      style={{ position: "absolute", top: 0, right: 0 }}
                      onClick={() =>
                        handleOpenModal(capability.id, attribute.id)
                      }
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                ))}
              </TableRow>
            ))}
      </React.Fragment>
    ))}
  </>
);

export default RatingsTable;
