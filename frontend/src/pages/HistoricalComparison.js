import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Container,
  Grid,
  Typography,
  MenuItem,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchHistoricalGraphData, fetchBulkCapabilityAssessmentIDs } from "../services/ratingsService";
import { fetchAttributes } from "../services/attributeService";
import { fetchACCModels, fetchComponents } from "../services/componentService";
import { fetchCapabilities } from "../services/capabilitiesService";
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const HistoricalComparison = () => {
  const [selectedAccModel, setSelectedAccModel] = useState("");
  const [components, setComponents] = useState([]);
  const [expandedComponent, setExpandedComponent] = useState(null);
  const [accModels, setAccModels] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [graphData, setGraphData] = useState(null);
  const [capabilityNames, setCapabilityNames] = useState([]);
  const [attributeNames, setAttributeNames] = useState([]);
  const [attributeColors, setAttributeColors] = useState({});
  const [attributeIds, setAttributeIds] = useState([]);

  // Fetch initial ACC Models
  useEffect(() => {
    const fetchAccModels = async () => {
      const accModelsData = await fetchACCModels();
      setAccModels(accModelsData);
      console.log("Fetched ACC Models", accModelsData);
    };
    fetchAccModels();
  }, []);

  // Fetch data based on selected ACC Model
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedAccModel) return;

      try {
        const components = await fetchComponents(selectedAccModel);
        setComponents(components);
        console.log("Fetched Components for selected ACC Model:", components);

        const attributes = await fetchAttributes();
        const attributeNamesFetched = attributes.map((attr) => attr.name);
        const attributeIdsFetched = attributes.map((attr) => attr.id);

        setAttributeIds(attributeIdsFetched);
        setAttributeNames(attributeNamesFetched);
        console.log("Fetched Attributes:", attributes);

        const colors = {};
        attributeNamesFetched.forEach((attribute) => {
          colors[attribute] = getRandomColor();
        });
        setAttributeColors(colors);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedAccModel]);

  // Function to handle selecting an ACC Model
  const handleAccModelChange = (event) => {
    setSelectedAccModel(event.target.value);
    setComponents([]);
  };

  // Handle accordion expansion and fetch data for the expanded component only
  const handleAccordionChange = async (componentId) => {
    const isExpanding = expandedComponent !== componentId;
    setExpandedComponent(isExpanding ? componentId : null);

    if (isExpanding) {
      try {
        const capabilities = await fetchCapabilities(componentId);
        const capabilityIds = capabilities.map((cap) => cap.id);
        setCapabilityNames(capabilities.map((cap) => cap.name));

        const capabilityAssessmentData = await fetchBulkCapabilityAssessmentIDs(capabilityIds, attributeIds);
        const capabilityAssessmentIds = capabilityAssessmentData.map(item => item.capability_assessment_id);

        const data = await fetchHistoricalGraphData(
          capabilityAssessmentIds,
          startDate,
          endDate
        );
        setGraphData(data);
        console.log("Graph data for expanded component:", componentId, data);
      } catch (error) {
        console.error("Error fetching capabilities:", error);
      }
    } else {
      setGraphData(null);
      setCapabilityNames([]);
    }
  };

  // Prepare data for the charts
  const prepareChartData = (dateType) => {
    if (!graphData) return null;

    const dateData = graphData[dateType];
    const datasets = attributeNames.map(attribute => {
      const data = capabilityNames.map(capability => {
        const foundData = dateData.find(
          item => item.capability_name === capability && item.attribute_name === attribute
        );
        return foundData ? foundData.average_rating : 0;
      });

      return {
        label: attribute,
        data,
        backgroundColor: attributeColors[attribute],
      };
    });

    return {
      labels: capabilityNames,
      datasets,
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Ratings Comparison" },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <Container maxWidth="xl" classname="custom-container">
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: "primary.main" }}>
        Ratings Trends
      </Typography>
      <Typography
        variant="body1"
        style={{ marginBottom: "1.5rem", color: "#primary.main" }}
      >
        Explore historical rating trends for different components within the selected ACC Model.
        Use this comparison tool to analyze rating shifts over specific time frames.
      </Typography>

      <Typography
        variant="body2"
        style={{ marginBottom: "2rem", color: "text.secondary" }}
      >
        To get started, first select the ACC Model from the dropdown. Next, choose your desired start and end dates. 
        Finally, expand each component to view the detailed ratings.
      </Typography>

      <Box display="flex" justifyContent="flex-start" mb={3}>
      <TextField
        select
        label="Select ACC Model"
        value={selectedAccModel}
        onChange={handleAccModelChange}
        variant="outlined"
        margin="normal"
        sx={{ width: "400px" }}
      >
        {accModels.map((model) => (
          <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
        ))}
      </TextField>
      </Box>

      <Box display="flex" gap={2} mb={3}>
      <TextField
        label="Start Date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        sx={{ width: '300px' }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="End Date"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        sx={{ width: '300px' }}
        InputLabelProps={{ shrink: true }}
      />
    </Box>

      {components.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Components</Typography>
          {components.map((component) => (
            <Accordion
              key={component.id}
              expanded={expandedComponent === component.id}
              onChange={() => handleAccordionChange(component.id)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{component.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {expandedComponent === component.id && graphData ? (
                  <>
                    <Typography variant="h6" gutterBottom>Start Date Ratings</Typography>
                    <Bar data={prepareChartData("start_date")} options={options} />
                    <Typography variant="h6" gutterBottom style={{ marginTop: "2rem" }}>End Date Ratings</Typography>
                    <Bar data={prepareChartData("end_date")} options={options} />
                  </>
                ) : (
                  <Typography>Select dates and expand to view the graph</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default HistoricalComparison;
