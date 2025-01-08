import React, { useState } from 'react';
import './App.css';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress, Box, Grid2, Typography } from '@mui/material';
import { ArrowForward, ArrowBack, ArrowUpward } from '@mui/icons-material';

const App = () => {
  const API_URL = "http://localhost:3000/api/v1"
  const [tableName, setTableName] = useState('');
  const [groupColumns, setGroupColumns] = useState(['']);
  const [selectColumns, setSelectColumns] = useState([{ column: '', function: 'Minimum' }]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true); // State to toggle form visibility

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddGroupColumn = () => {
    setGroupColumns([...groupColumns, '']);
  };

  const handleAddSelectColumn = () => {
    setSelectColumns([...selectColumns, { column: '', function: 'Minimum' }]);
  };

  const handleGroupColumnChange = (index, value) => {
    const newGroupColumns = [...groupColumns];
    newGroupColumns[index] = value;
    setGroupColumns(newGroupColumns);
  };

  const handleSelectColumnChange = (index, key, value) => {
    const newSelectColumns = [...selectColumns];
    newSelectColumns[index][key] = value;
    setSelectColumns(newSelectColumns);
  };

  const handleRemoveGroupColumn = (index) => {
    setGroupColumns(groupColumns.filter((_, i) => i !== index));
  };

  const handleRemoveSelectColumn = (index) => {
    setSelectColumns(selectColumns.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    const requestPayload = {
      table_name: tableName,
      group_columns: groupColumns.filter((col) => col.trim() !== ''),
      select: selectColumns.filter((col) => col.column.trim() !== ''),
    };

    try {
      const res = await fetch(API_URL + '/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await res.json();

      if (data.result.error) {
        setError(data.result.error);
      } else {
        setResponse(data.result.values);
      }
    } catch (err) {
      setError({ message: 'Failed to fetch data', inner_message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Typography variant="h3" align="center" gutterBottom style={{ WebkitBackgroundClip: 'text', color: '#57b9ff' }}>
        DistributedData Aggregation System
      </Typography>

      {/* Scroll to Top Button */}
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          opacity: 0.8,
          zIndex: 10,
          borderRadius: '50%',
        }}
      >
        <ArrowUpward />
      </Button>

      <Grid2 container spacing={3}>
        {/* Left side: Formularz */}
        <Grid2 item xs={12} sm={isFormVisible ? 4 : 0}>
          <Box className="form" marginBottom={3} position="relative">
            {/* Button to toggle form visibility, placed above the form */}
            <Button
              variant="outlined"
              onClick={() => setIsFormVisible(!isFormVisible)}
              size="small"
              style={{
                position: 'absolute',
                top: -25,  // Positioning the button above the form
                left: 10,
                zIndex: 10,
              }}
            >
              {isFormVisible ? <ArrowBack /> : <ArrowForward />}
            </Button>

            {/* Show/Hide Form based on isFormVisible */}
            {isFormVisible && (
              <Box marginTop={2}>
                <TextField
                  label="Table Name"
                  variant="outlined"
                  fullWidth
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  margin="normal"
                  inputProps={{
                    style: { padding: '6px 12px' }, // Reduced padding for smaller text fields
                  }}
                />

                <Box marginBottom={2}>
                  <Typography variant="h6">Group Columns</Typography>
                  {groupColumns.map((col, index) => (
                    <Box key={index} display="flex" alignItems="center" marginBottom={1}>
                      <TextField
                        label="Group Column"
                        variant="outlined"
                        value={col}
                        onChange={(e) => handleGroupColumnChange(index, e.target.value)}
                        fullWidth
                        inputProps={{
                          style: { padding: '6px 12px' }, // Reduced padding for smaller text fields
                        }}
                      />
                      <Button onClick={() => handleRemoveGroupColumn(index)} variant="contained" color="error" size="small" style={{ marginLeft: '10px' }}>
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <Button onClick={handleAddGroupColumn} variant="outlined" size="small">+ Add Group Column</Button>
                </Box>

                <Box marginBottom={2}>
                  <Typography variant="h6">Select Columns</Typography>
                  {selectColumns.map((col, index) => (
                    <Box key={index} display="flex" alignItems="center" marginBottom={1}>
                      <TextField
                        label="Column Name"
                        variant="outlined"
                        value={col.column}
                        onChange={(e) => handleSelectColumnChange(index, 'column', e.target.value)}
                        fullWidth
                        inputProps={{
                          style: { padding: '6px 12px' }, // Reduced padding for smaller text fields
                        }}
                      />
                      <FormControl variant="outlined" size="small" style={{ marginLeft: '10px', width: '150px' }}>
                        <InputLabel>Function</InputLabel>
                        <Select
                          value={col.function}
                          onChange={(e) => handleSelectColumnChange(index, 'function', e.target.value)}
                          label="Function"
                        >
                          <MenuItem value="Minimum">Minimum</MenuItem>
                          <MenuItem value="Maximum">Maximum</MenuItem>
                          <MenuItem value="Average">Average</MenuItem>
                        </Select>
                      </FormControl>
                      <Button onClick={() => handleRemoveSelectColumn(index)} variant="contained" color="error" size="small" style={{ marginLeft: '10px' }}>
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <Button onClick={handleAddSelectColumn} variant="outlined" size="small">+ Add Select Column</Button>
                </Box>

                <Button onClick={handleSubmit} variant="contained" color="primary" size="large" fullWidth disabled={loading}>
                  Submit
                </Button>
              </Box>
            )}
          </Box>
        </Grid2>

        {/* Right side: Tabelka z wynikami */}
        <Grid2 item xs={12} sm={isFormVisible ? 8 : 12}>
          {/* Increased space */}
          <Box marginTop={5}></Box>

          {loading && !response && !error && (
            <Box display="flex" justifyContent="center" marginBottom={3}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Box bgcolor="#f8d7da" border="1px solid #f5c6cb" padding={2} marginTop={3} borderRadius={1}>
              <Typography variant="h6" color="error">Error</Typography>
              <Typography>{error.message}</Typography>
              <Typography>{error.inner_message}</Typography>
            </Box>
          )}

          {response && (
            <Box marginTop={3}>
              <Grid2 container spacing={2} className="table-container">
                <Grid2 item xs={12}>
                  <table className="response-table">
                    <thead>
                      <tr>
                        {groupColumns.map((col, index) => (
                          <th key={index}>{col}</th>
                        ))}
                        {selectColumns.map((col, index) => (
                          <th key={index}>{`${col.function}(${col.column})`}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {response.map((row, rowIndex) => {
                        const groupValues = row.grouping_value.split('|');
                        return (
                          <tr key={rowIndex}>
                            {groupValues.map((value, colIndex) => (
                              <td key={colIndex}>{value}</td>
                            ))}
                            {row.results.map((result, resIndex) => (
                              <td key={resIndex}>{result.is_null ? 'NULL' : result.value}</td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Grid2>
              </Grid2>
            </Box>
          )}
        </Grid2>
      </Grid2>
    </div>
  );
};

export default App;