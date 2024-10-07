import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

/**
 * A React component for selecting an ACC model from a list.
 *
 * @param {Object[]} accModels - An array of ACC model objects to display.
 * @param {string} selectedAccModel - The id of the currently selected ACC model.
 * @param {function} onSelectAccModel - A function to be called when the user selects an ACC model.
 *   It should take the id of the selected ACC model as an argument.
 */
const AccModelSelector = ({
  accModels,
  selectedAccModel,
  onSelectAccModel,
}) => {
  return (
    <FormControl fullWidth margin="normal" variant="outlined">
      <InputLabel id="acc-model-select-label">Select ACC Model</InputLabel>
      <Select
        labelId="acc-model-select-label"
        value={selectedAccModel || ""}
        onChange={(e) => onSelectAccModel(e.target.value)}
        label="Select ACC Model"
      >
        {accModels.length === 0 ? (
          <MenuItem disabled value="">
            No ACC Models Available
          </MenuItem>
        ) : (
          accModels.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.name}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

export default AccModelSelector;
