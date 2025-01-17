import React, { useState, useEffect } from 'react';
import './App.css';
import { Button, MenuItem, Select, FormControl, InputLabel, CircularProgress, Box, Grid2, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { ArrowForward, ArrowBack, ArrowUpward } from '@mui/icons-material';

const App = () => {
  const API_URL = "http://localhost:3000/api/v1";
  const [tableName, setTableName] = useState('');
  const [tables, setTables] = useState([]);
  const [groupColumns, setGroupColumns] = useState(['']);
  const [groupColumnOptions, setGroupColumnOptions] = useState([]);
  const [selectColumns, setSelectColumns] = useState([{ column: '', function: 'Minimum' }]);
  const [selectColumnOptions, setSelectColumnOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true); // State to toggle form visibility
  const [formError, setFormError] = useState(null); // Nowy stan dla błędów walidacji
  const [uploadOpen, setUploadOpen] = useState(false); // State to control the upload dialog
  const [uploadTableName, setUploadTableName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch(API_URL + '/tables');
        const data = await res.json();
        setTables(data);
      } catch (err) {
        console.error('Error fetching tables:', err);
      }
    };

    fetchTables();
  }, []);

  const getValue = (result) => {

    if (result.is_null) {
      return 'NULL'
    }

    switch(result.result_type) { 
      case 'INT': { 
        return result.int_value
      } 
      case 'DOUBLE': { 
        return result.double_value
      } 
      case 'FLOAT': { 
        return result.float_value
     } 
      default: { 
         return 'NULL'
      } 
   } 
  }

  const handleUploadFile = async () => {
    if (!uploadTableName) {
      setUploadError('Table name is required.');
      return;
    }

    if (!uploadFile) {
      setUploadError('You must select a Parquet file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    setLoadingUpload(true);
    setUploadError(null);

    try {
      const res = await fetch(`${API_URL}/tables/upload?name=${uploadTableName}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Unknown error');
      }

      const data = await res.text();
      alert(data);
      setUploadOpen(false);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setLoadingUpload(false);
    }
  };

  const fetchColumns = async (endpoint, setOptions) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}?name=${tableName}`);
      const data = await res.json();
      console.log(data)
      setOptions(data.map(({ name, type }) => ({ label: `${name} (${type})`, value: name })));
    } catch (err) {
      console.error(`Error fetching columns from ${endpoint}:`, err);
    }
  };

  useEffect(() => {
    if (tableName) {
      fetchColumns('/tables/columns', setGroupColumnOptions);
      fetchColumns('/tables/select-columns', setSelectColumnOptions);
    }
  }, [tableName]);

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
    setFormError(null); // Resetujemy błędy przed próbą wysłania
    setLoading(true);
    setResponse(null);
    setError(null);
  
    if (!tableName) {
      setFormError('Select a table name.');
      setLoading(false);
      return;
    }

    if (groupColumns.some((col) => col.trim() === '')) {
      setFormError('All Group Columns must be filled.');
      setLoading(false);
      return;
    }

    if (selectColumns.some((col) => col.column.trim() === '')) {
      setFormError('All Select Columns must be filled.');
      setLoading(false);
      return;
    }
  
    if (groupColumns.filter((col) => col.trim() !== '').length === 0) {
      setFormError('Select at least one group column.');
      setLoading(false);
      return;
    }
  
    if (selectColumns.filter((col) => col.column.trim() !== '').length === 0) {
      setFormError('Select at least one column for aggreagation.');
      setLoading(false);
      return;
    }

    const uniqueGroupColumns = new Set(groupColumns.filter((col) => col.trim() !== ''));
    if (uniqueGroupColumns.size !== groupColumns.filter((col) => col.trim() !== '').length) {
      setFormError('Group columns must be unique.');
      setLoading(false);
      return;
    }

    // Walidacja: Konflikt między kolumnami grupującymi a agregowanymi
    const groupSet = new Set(groupColumns.filter((col) => col.trim() !== ''));
    const conflict = selectColumns.some((col) => groupSet.has(col.column.trim()));
    if (conflict) {
      setFormError('Select columns cannot be the same as group columns.');
      setLoading(false);
      return;
    }

  
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
  
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Unknown error');
      } 

      const data = await res.json();
      setResponse(data.result.values);
    } catch (err) {
      setError({ message: 'Failed to fetch data', inner_message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Typography variant="h3" align="center" gutterBottom style={{ WebkitBackgroundClip: 'text', color: '#57b9ff' }}>
        Distributed Data Aggregation System
      </Typography>

      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
        <Grid2 item xs={12} sm={isFormVisible ? 4 : 0}>
        <Box className="form" marginBottom={3} position="relative">
          <Grid2 item xs={12} sm={8}>

          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
            <Button
              variant="outlined"
              onClick={() => setIsFormVisible(!isFormVisible)}
              size="small"
              style={{
                zIndex: 10,
              }}
            >
              {isFormVisible ? <ArrowBack /> : <ArrowForward />}
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setUploadOpen(true)}
            >
              Upload
            </Button>
          </Box>

            <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} fullWidth maxWidth="sm">
              <DialogTitle>Upload Parquet File</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Table Name"
                  value={uploadTableName}
                  onChange={(e) => setUploadTableName(e.target.value)}
                />
                <input
                  type="file"
                  accept=".parquet"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  style={{ marginTop: '10px', marginBottom: '10px' }}
                />
                {uploadError && (
                  <Typography color="error" variant="body2">
                    {uploadError}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setUploadOpen(false)} color="secondary">
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadFile}
                  color="primary"
                  disabled={loadingUpload}
                >
                  {loadingUpload ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogActions>
            </Dialog>
          </Grid2>

            {isFormVisible && (
              <Box marginTop={2}>
                <FormControl variant="outlined" fullWidth margin="normal">
                  <InputLabel>Table Name</InputLabel>
                  <Select
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    label="Table Name"
                  >
                    {tables.map((table, index) => (
                      <MenuItem key={index} value={table}>{table}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box marginBottom={2}>
                  <Typography variant="h6">Group Columns</Typography>
                  {groupColumns.map((col, index) => (
                    <Box key={index} display="flex" alignItems="center" marginBottom={1}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>Group Column</InputLabel>
                        <Select
                          value={col}
                          onChange={(e) => handleGroupColumnChange(index, e.target.value)}
                          label="Group Column"
                        >
                          {groupColumnOptions.map((option, i) => (
                            <MenuItem key={i} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>Column Name</InputLabel>
                        <Select
                          value={col.column}
                          onChange={(e) => handleSelectColumnChange(index, 'column', e.target.value)}
                          label="Column Name"
                        >
                          {selectColumnOptions.map((option, i) => (
                            <MenuItem key={i} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl variant="outlined" size="small" style={{ marginLeft: '10px', width: '150px' }}>
                        <InputLabel>Function</InputLabel>
                        <Select
                          value={col.function}
                          onChange={(e) => handleSelectColumnChange(index, 'function', e.target.value)}
                          label="Function"
                        >
                          <MenuItem value="Minimum">Min</MenuItem>
                          <MenuItem value="Maximum">Max</MenuItem>
                          <MenuItem value="Average">Avg</MenuItem>
                          <MenuItem value="Sum">Sum</MenuItem>
                          <MenuItem value="Count">Count</MenuItem>
                        </Select>
                      </FormControl>
                      <Button onClick={() => handleRemoveSelectColumn(index)} variant="contained" color="error" size="small" style={{ marginLeft: '10px' }}>
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <Button onClick={handleAddSelectColumn} variant="outlined" size="small">+ Add Select Column</Button>
                </Box>

                {formError && (
                  <Box bgcolor="#f8d7da" border="1px solid #f5c6cb" padding={2} marginTop={3} borderRadius={1}>
                  <Typography variant="h6" color="error">{formError}</Typography>
                </Box>
                )}

                <Button onClick={handleSubmit} variant="contained" color="primary" size="large" fullWidth disabled={loading}>
                  Submit
                </Button>
              </Box>
            )}
          </Box>
        </Grid2>

        <Grid2 item xs={12} sm={isFormVisible ? 8 : 12}>
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
                              <td key={resIndex}>{getValue(result)}</td>
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
