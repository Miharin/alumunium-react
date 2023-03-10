// Start Import
import { Helmet } from 'react-helmet-async';
import React, { useEffect } from 'react';
// @mui Components
import {
  Slide,
  TextField,
  InputAdornment,
  ClickAwayListener,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  ButtonGroup,
  IconButton,
  Tooltip,
  Backdrop,
  CircularProgress,
  Autocomplete,
  Stack,
  Divider,
  Alert,
  Skeleton,
  Snackbar,
} from '@mui/material';
import { FilterAltRounded, CheckCircleOutlineRounded, DoDisturbRounded, AddRounded } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

// store
import { useTableHelper, useHistoryProductStore } from 'store/index';
// End Import

// Start Function of Filtered

// eslint-disable-next-line
const getComparator = (order, orderBy, descendingComparator) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};
// End Function of Filtered

export default function HistoryProductPage() {
  // Start Helper Table
  const page = useTableHelper((state) => state.page);
  const rowsPerPage = useTableHelper((state) => state.rowsPerPage);
  const setPage = useTableHelper((state) => state.setPage);
  const setChangeRowsPerPage = useTableHelper((state) => state.setChangeRowsPerPage);
  const onRequestSort = useTableHelper((state) => state.onRequestSort);
  const order = useTableHelper((state) => state.order);
  const orderBy = useTableHelper((state) => state.orderBy);
  const descendingComparator = useTableHelper((state) => state.descendingComparator);
  const search = useTableHelper((state) => state.search);
  const setSearch = useTableHelper((state) => state.setSearch);
  const showSearch = useTableHelper((state) => state.showSearch);
  const setShowSearch = useTableHelper((state) => state.setShowSearch);
  const filtered = useTableHelper((state) => state.filteredDetail);
  // End Helper Table

  // Start CodeProduct Initialization
  const loading = useHistoryProductStore((state) => state.loading);
  const listName = useHistoryProductStore((state) => state.listName);
  const nameSelect = useHistoryProductStore((state) => state.nameSelect);
  const setNameSelect = useHistoryProductStore((state) => state.setNameSelect);
  const products = useHistoryProductStore((state) => state.products);
  const removeProductMode = useHistoryProductStore((state) => state.removeProductMode);
  const setRemoveProductMode = useHistoryProductStore((state) => state.setRemoveProductMode);
  const deleteRemoveProductNew = useHistoryProductStore((state) => state.deleteRemoveProductNew);
  const setRemoveProduct = useHistoryProductStore((state) => state.setRemoveProduct);
  const removeProductIcon = useHistoryProductStore((state) => state.removeProductIcon);
  const setFinalRemoveProduct = useHistoryProductStore((state) => state.setFinalRemoveProduct);
  const openSnackbar = useHistoryProductStore((state) => state.openSnackbar);
  const snackbarMessage = useHistoryProductStore((state) => state.snackbarMessage);
  const setOpenSnackbar = useHistoryProductStore((state) => state.setOpenSnackbar);
  const helperCode = useHistoryProductStore((state) => state.helperCode);
  const helperCodeName = useHistoryProductStore((state) => state.helperCodeName);
  const getProducts = useHistoryProductStore((state) => state.getProducts);
  const getName = useHistoryProductStore((state) => state.getField);
  const snackbarType = useHistoryProductStore((state) => state.snackbarType);
  const rows = products;
  // End ProductCode Initialization

  // Declaration for Column of Table
  let columns = [];
  if (nameSelect !== '' || null || undefined) {
    columns = [
      { id: 'code', label: 'Code', minWidth: 100, align: 'left' },
      { id: 'name', label: 'Nama', minWidth: 200, align: 'left' },
      { id: 'detail', label: 'Detail', minWidth: 150, align: 'left' },
      { id: 'in', label: 'Masuk', minWidth: 50, align: 'left' },
      { id: 'out', label: 'Keluar', minWidth: 50, align: 'left' },
      { id: 'stock', label: 'Stok Total', minWidth: 150, align: 'left' },
      { id: 'lastInput', label: 'Oleh', minWidth: 150, align: 'left' },
    ];
  }
  if (removeProductMode === true) {
    columns = [
      { id: 'code', label: 'Code', minWidth: 100, align: 'left' },
      { id: 'name', label: 'Nama', minWidth: 200, align: 'left' },
      { id: 'detail', label: 'Detail', minWidth: 150, align: 'left' },
      { id: 'in', label: 'Masuk', minWidth: 50, align: 'left' },
      { id: 'out', label: 'Keluar', minWidth: 50, align: 'left' },
      { id: 'stock', label: 'Stok Total', minWidth: 150, align: 'left' },
      { id: 'lastInput', label: 'Oleh', minWidth: 150, align: 'left' },
      {
        id: 'action',
        label: 'Action',
        minWidth: 150,
        align: 'left',
      },
    ];
  }
  if (nameSelect === '' || null || undefined) {
    columns = [
      { id: 'code', label: 'Code', minWidth: 100, align: 'left' },
      { id: 'name', label: 'Nama', minWidth: 200, align: 'left' },
      { id: 'detail', label: 'Detail', minWidth: 150, align: 'left' },
      { id: 'in', label: 'Masuk', minWidth: 50, align: 'left' },
      { id: 'out', label: 'Keluar', minWidth: 50, align: 'left' },
      { id: 'stock', label: 'Stok Total', minWidth: 150, align: 'left' },
      { id: 'lastInput', label: 'Oleh', minWidth: 150, align: 'left' },
    ];
  }

  // Function for Getting Code Product Data from Database
  useEffect(() => {
    getProducts();
    getName();
  }, [getProducts, getName]);

  // Function for Filter Table
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property, order, orderBy);
  };

  // Return Display
  return loading ? (
    <Skeleton sx={{ mx: 5, alignItems: 'center' }} animation="wave" height={300} variant="rectangular" />
  ) : (
    <>
      <Helmet>
        <title> Produk Histori | Alu Jaya </title>
      </Helmet>
      <Paper sx={{ mx: 5, alignItems: 'center' }} elevation={5}>
        {/* Start Function Showing Search and Filter */}
        <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={setOpenSnackbar}>
          <Alert onClose={setOpenSnackbar} severity={snackbarType} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        {showSearch ? (
          <ClickAwayListener onClickAway={setShowSearch}>
            <Slide direction="down" in={showSearch} mountOnEnter unmountOnExit>
              <Stack direction="row" spacing={0}>
                <TextField
                  sx={{ my: 4, mx: 2 }}
                  name="Search"
                  placeholder="Search"
                  variant="standard"
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <FilterAltRounded />
                      </InputAdornment>
                    ),
                  }}
                />
                <Divider orientation="vertical" variant="middle" flexItem />
                <Autocomplete
                  freeSolo
                  isOptionEqualToValue={(option, value) => option.label === value.value}
                  sx={{ mx: 2 }}
                  id="category"
                  name="categories"
                  onChange={(event, newValue) =>
                    newValue !== null ? (setNameSelect(newValue), getProducts()) : (setNameSelect(), getProducts())
                  }
                  options={listName}
                  value={nameSelect}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ my: 4, width: 300 }}
                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                      variant="standard"
                      placeholder="Kategori"
                    />
                  )}
                />
              </Stack>
            </Slide>
          </ClickAwayListener>
        ) : (
          <Slide direction="down" in={!showSearch} mountOnEnter unmountOnExit>
            <FilterAltRounded sx={{ m: 4 }} onClick={setShowSearch} />
          </Slide>
        )}
        {/* End Function Showing Search and Filter */}
        <TableContainer>
          <Table aria-label="Sticky Table">
            <caption>
              {nameSelect !== '' || null || undefined ? (
                <Button
                  disabled={removeProductMode}
                  variant="text"
                  fullWidth
                  startIcon={<AddRounded />}
                  onClick={setRemoveProductMode}
                >
                  Tambah Penjualan
                </Button>
              ) : (
                <Alert severity="warning">
                  Jika Ingin Menambahkan History Produk Maka{' '}
                  {nameSelect === '' || undefined || null ? 'Nama Barang' : null} Harap Diisi
                </Alert>
              )}
            </caption>
            <TableHead>
              <TableRow>
                {/* Start Define Column */}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={createSortHandler(column.id)}
                    >
                      {column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
                {/* End Define Column */}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Start Define Rows */}
              {stableSort(rows, getComparator(order, orderBy, descendingComparator))
                .filter((row) => filtered(row, search))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} id={index} align={column.align}>
                          {/* Start Edit Rows and Display Rows */}
                          {value}
                          {/* End Edit Rows and Display Rows */}
                          {/* Start Add Rows */}
                          {removeProductMode === true && value === '' ? (
                            <TextField
                              required
                              fullWidth
                              name={column.id}
                              type={column.id === 'in' || column.id === 'out' ? 'number' : 'text'}
                              onChange={(event) => setRemoveProduct(event.target)}
                              InputProps={{ disableUnderline: true }}
                              helperText={column.id === 'code' ? helperCode : helperCodeName}
                              variant="standard"
                              placeholder={column.label}
                              sx={{ width: column.minWidth }}
                            />
                          ) : removeProductMode === true && column.id === 'action' && row.id === '' ? (
                            <ButtonGroup variant="outlined">
                              {removeProductIcon ? (
                                <IconButton onClick={setFinalRemoveProduct}>
                                  <Tooltip title="Confirm">
                                    <CheckCircleOutlineRounded sx={{ color: '#737373' }} />
                                  </Tooltip>
                                  <Backdrop
                                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                    open={loading}
                                  >
                                    <CircularProgress color="inherit" />
                                  </Backdrop>
                                </IconButton>
                              ) : null}
                              <IconButton onClick={deleteRemoveProductNew}>
                                <Tooltip title="Cancel">
                                  <DoDisturbRounded sx={{ color: '#737373' }} />
                                </Tooltip>
                              </IconButton>
                            </ButtonGroup>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              {/* End Add Rows */}
              {/* End Define Rows */}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={setPage}
          onRowsPerPageChange={(event) => setChangeRowsPerPage(event.target.value)}
        />
      </Paper>
    </>
  );
}
