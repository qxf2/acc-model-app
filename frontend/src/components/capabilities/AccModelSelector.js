import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

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
