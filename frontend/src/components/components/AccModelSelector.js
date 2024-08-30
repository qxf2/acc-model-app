import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const AccModelSelector = ({ accModels, selectedAccModel, handleSelect }) => {
  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id="acc-model-select-label">Select ACC Model</InputLabel>
      <Select
        labelId="acc-model-select-label"
        value={selectedAccModel}
        onChange={(e) => handleSelect(e.target.value)}
      >
        {accModels.map((model) => (
          <MenuItem key={model.id} value={model.id}>
            {model.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AccModelSelector;
