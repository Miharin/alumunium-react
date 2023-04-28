// Start Import
import { Helmet } from 'react-helmet-async';
import React, { useEffect } from 'react';
// @mui Components
import {
  Slide,
  TextField,
  InputAdornment,
  ClickAwayListener,
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
import { ModeEditRounded, FilterAltRounded, CheckCircleOutlineRounded, DoDisturbRounded } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

// store
import { useTableHelper, useListProductStore } from 'store/index';
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

export default function DashboardAppPage() {
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
  const filtered = useTableHelper((state) => state.filteredProducts);
  // End Helper Table

  // Start ListProduct Initialization
  const loading = useListProductStore((state) => state.loading);
  const listCategory = useListProductStore((state) => state.listCategories);
  const listMerk = useListProductStore((state) => state.listMerk);
  const categories = useListProductStore((state) => state.categories);
  const merk = useListProductStore((state) => state.merk);
  const setCategories = useListProductStore((state) => state.setCategories);
  const setMerk = useListProductStore((state) => state.setMerk);
  const editMode = useListProductStore((state) => state.editMode);
  const productId = useListProductStore((state) => state.editProductId);
  const setProductId = useListProductStore((state) => state.setProductId);
  const setEditProduct = useListProductStore((state) => state.setEditProduct);
  const setEdit = useListProductStore((state) => state.setEdit);
  const editProduct = useListProductStore((state) => state.editProduct);
  const editProductIcon = useListProductStore((state) => state.editProductIcon);
  const getField = useListProductStore((state) => state.getField);
  const openSnackbar = useListProductStore((state) => state.openSnackbar);
  const snackbarMessage = useListProductStore((state) => state.snackbarMessage);
  const setOpenSnackbar = useListProductStore((state) => state.setOpenSnackbar);
  const getProducts = useListProductStore((state) => state.getProducts);
  const listProducts = useListProductStore((state) => state.listProducts);
  const rows = listProducts;
  // End ListProduct Initialization

  // Declaration for Column of Table
  let columns = [];
  if ((categories !== '' || null || undefined) && (merk !== '' || null || undefined)) {
    columns = [
      { id: 'code', label: 'Kode', minWidth: 150, align: 'left' },
      { id: 'categories', label: 'Kategori', minWidth: 150, align: 'left' },
      { id: 'merk', label: 'Merk', minWidth: 150, align: 'left' },
      { id: 'name', label: 'Nama', minWidth: 300, align: 'left' },
      { id: 'price_1', label: 'Harga 1', minWidth: 150, align: 'left' },
      { id: 'price_2', label: 'Harga 2', minWidth: 150, align: 'left' },
      { id: 'price_3', label: 'Harga 3', minWidth: 150, align: 'left' },
      { id: 'stock', label: 'Stok', minWidth: 150, align: 'left' },
      { id: 'lastInput', label: 'Terakhir Diubah', minWidth: 350, align: 'left' },
    ];
  } else {
    columns = [
      { id: 'code', label: 'Code', minWidth: 150, align: 'left' },
      { id: 'categories', label: 'Kategori', minWidth: 150, align: 'left' },
      { id: 'merk', label: 'Merk', minWidth: 150, align: 'left' },
      { id: 'name', label: 'Nama', minWidth: 300, align: 'left' },
      { id: 'price_1', label: 'Harga 1', minWidth: 150, align: 'left' },
      { id: 'price_2', label: 'Harga 2', minWidth: 150, align: 'left' },
      { id: 'price_3', label: 'Harga 3', minWidth: 150, align: 'left' },
      { id: 'stock', label: 'Stok', minWidth: 150, align: 'left' },
      { id: 'lastInput', label: 'Terakhir Diubah', minWidth: 350, align: 'left' },
    ];
  }

  // Function for Getting Product Data from Database
  useEffect(() => {
    getField();
    getProducts();
  }, [getField, getProducts]);

  // Function for Filter Table
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property, order, orderBy);
  };

  // Function Helper for Edit
  const handleEdit = (event) => setProductId(event);

  // Return Display
  return loading ? (
    <Skeleton sx={{ mx: 5, alignItems: 'center' }} animation="wave" height={300} variant="rectangular" />
  ) : (
    <>
      <Helmet>
        <title> Dashboard | Alu Jaya </title>
      </Helmet>
      <Paper sx={{ mx: 5, alignItems: 'center' }} elevation={5}>
        {/* Start Function Showing Search and Filter */}
        <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={setOpenSnackbar}>
          <Alert onClose={setOpenSnackbar} severity="success" sx={{ width: '100%' }}>
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
                  isOptionEqualToValue={(option, value) => option.label === value.value}
                  sx={{ mx: 2 }}
                  id="category"
                  name="categories"
                  onChange={(event, newValue) =>
                    newValue !== null ? (setCategories(newValue), getProducts()) : (setCategories(), getProducts())
                  }
                  options={listCategory}
                  value={categories}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ my: 4, minWidth: 150 }}
                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                      variant="standard"
                      placeholder="Kategori"
                    />
                  )}
                />
                <Divider orientation="vertical" variant="middle" flexItem />
                <Autocomplete
                  isOptionEqualToValue={(option, value) => option.label === value.value}
                  sx={{ mx: 2 }}
                  id="merk"
                  name="merk"
                  onChange={(event, newValue) =>
                    newValue !== null ? (setMerk(newValue), getProducts()) : (setMerk(), getProducts())
                  }
                  options={listMerk}
                  value={merk}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{ my: 4, minWidth: 100 }}
                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                      variant="standard"
                      placeholder="Merk"
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
          <Table aria-label="Sticky Table" size="small">
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
                      if (Number(row.stock) < row.stockWarning) {
                        return (
                          <TableCell
                            key={column.id}
                            id={index}
                            align={column.align}
                            sx={{ borderBottom: '1px solid #000' }}
                          >
                            {/* Start Edit Rows and Display Rows */}
                            {editMode === true ? (
                              column.id === 'action' && productId === row.id ? (
                                <ButtonGroup variant="outlined">
                                  {editProductIcon ? (
                                    <IconButton onClick={() => setEditProduct(row.id)}>
                                      <Tooltip title="Confirm">
                                        <CheckCircleOutlineRounded sx={{ color: '#737373' }} />
                                      </Tooltip>
                                    </IconButton>
                                  ) : null}
                                  <Backdrop
                                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                    open={loading}
                                  >
                                    <CircularProgress color="inherit" />
                                  </Backdrop>
                                  <IconButton onClick={() => handleEdit()}>
                                    <Tooltip title="Cancel">
                                      <DoDisturbRounded sx={{ color: '#737373' }} />
                                    </Tooltip>
                                  </IconButton>
                                </ButtonGroup>
                              ) : productId === row.id &&
                                column.id !== 'lastInput' &&
                                column.id !== 'code' &&
                                column.id !== 'name' &&
                                column.id !== 'categories' &&
                                column.id !== 'merk' ? (
                                <TextField
                                  fullWidth
                                  onChange={(event) => setEdit(event.target)}
                                  /* eslint-disable */
                                  onInput={(e) => {
                                    column.id === 'price_1' || column.id === 'price_2' || column.id === 'price_3'
                                      ? (e.target.value = Math.max(0, Number(e.target.value)).toString().slice(0, 3))
                                      : null;
                                  }}
                                  /* eslint-disable */
                                  InputProps={{ disableUnderline: true }}
                                  type={column.id === 'code' ? 'number' : 'text'}
                                  name={column.id}
                                  placeholder={value}
                                  variant="standard"
                                  value={editProduct[column.id] !== undefined ? editProduct[column.id] : ''}
                                />
                              ) : (
                                value
                              )
                            ) : column.id === 'action' && editMode === false ? (
                              categories !== '' && merk !== '' ? (
                                <ButtonGroup variant="outlined">
                                  <IconButton onClick={() => handleEdit(row.id)}>
                                    <Tooltip title="Edit Code Product">
                                      <ModeEditRounded sx={{ color: '#737373' }} />
                                    </Tooltip>
                                  </IconButton>
                                </ButtonGroup>
                              ) : null
                            ) : (column.id === 'price_1' || column.id === 'price_2' || column.id === 'price_3') &&
                              editMode === false ? (
                              new Intl.NumberFormat('in-in', {
                                style: 'currency',
                                currency: 'idr',
                                maximumSignificantDigits: 3,
                              }).format(value)
                            ) : column.id === 'stock' ? (
                              <Alert
                                severity={
                                  Number(value) < row.stockWarning
                                    ? Number(value) < 10
                                      ? 'error'
                                      : 'warning'
                                    : 'success'
                                }
                              >
                                {value}
                              </Alert>
                            ) : (
                              value
                            )}
                            {/* End Edit Rows and Display Rows */}
                          </TableCell>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </TableRow>
                ))}
              {/* End Add Rows */}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => setChangeRowsPerPage(event.target.value)}
        />
      </Paper>
    </>
  );
}
