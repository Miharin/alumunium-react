// Start Import
import { Helmet } from 'react-helmet-async';
import React, { useEffect } from 'react';
// @mui Components
import {
  TextField,
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
  Alert,
  Skeleton,
  Snackbar,
  Stack,
} from '@mui/material';
import { CheckCircleOutlineRounded, DoDisturbRounded, AddRounded } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

// store
import { useTableHelper, useAddProductStore } from 'store/index';
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

export default function AddProductPage() {
  // Start Helper Table
  const page = useTableHelper((state) => state.page);
  const rowsPerPage = useTableHelper((state) => state.rowsPerPage);
  const setPage = useTableHelper((state) => state.setPage);
  const setChangeRowsPerPage = useTableHelper((state) => state.setChangeRowsPerPage);
  const onRequestSort = useTableHelper((state) => state.onRequestSort);
  const order = useTableHelper((state) => state.order);
  const orderBy = useTableHelper((state) => state.orderBy);
  const descendingComparator = useTableHelper((state) => state.descendingComparator);
  // End Helper Table

  // Start ListProduct Initialization
  const loading = useAddProductStore((state) => state.loading);
  const setName = useAddProductStore((state) => state.setName);
  const addProductMode = useAddProductStore((state) => state.addProductMode);
  const setAddProductMode = useAddProductStore((state) => state.setAddProductMode);
  const deleteAddProductNew = useAddProductStore((state) => state.deleteAddProductNew);
  const setAddProduct = useAddProductStore((state) => state.setAddProduct);
  const addProductIcon = useAddProductStore((state) => state.addProductIcon);
  const setFinalAddProduct = useAddProductStore((state) => state.setFinalAddProduct);
  const openSnackbar = useAddProductStore((state) => state.openSnackbar);
  const snackbarMessage = useAddProductStore((state) => state.snackbarMessage);
  const setOpenSnackbar = useAddProductStore((state) => state.setOpenSnackbar);
  const getProducts = useAddProductStore((state) => state.getProducts);
  const listProducts = useAddProductStore((state) => state.listProducts);
  const listName = useAddProductStore((state) => state.listName);
  const rows = listProducts;
  // End ListProduct Initialization

  // Declaration for Column of Table
  const columns = [
    { id: 'code', label: 'Kode', minWidth: 150, align: 'left' },
    { id: 'categories', label: 'Kategori', minWidth: 150, align: 'left' },
    { id: 'merk', label: 'Merk', minWidth: 150, align: 'left' },
    { id: 'name', label: 'Nama', minWidth: 300, align: 'left' },
    { id: 'price_1', label: 'Harga 1', minWidth: 150, align: 'left' },
    { id: 'price_2', label: 'Harga 2', minWidth: 150, align: 'left' },
    { id: 'price_3', label: 'Harga 3', minWidth: 150, align: 'left' },
    { id: 'stock', label: 'Stok', minWidth: 150, align: 'left' },
    {
      id: 'action',
      label: 'Action',
      minWidth: 150,
      align: 'left',
    },
  ];

  // Function for Getting Product Data from Database
  useEffect(() => {
    getProducts();
  }, [getProducts]);

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
        <title> Tambah Produk | Alu Jaya </title>
      </Helmet>
      <Paper sx={{ mx: 5, alignItems: 'center' }} elevation={5}>
        {/* Start Function Showing Search and Filter */}
        <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={setOpenSnackbar}>
          <Alert onClose={setOpenSnackbar} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        {/* End Function Showing Search and Filter */}
        <TableContainer>
          <Table aria-label="Sticky Table">
            <caption>
              <Stack direction="row" spacing={2}>
                <Button variant="text" fullWidth startIcon={<AddRounded />} onClick={setAddProductMode}>
                  Tambah Produk
                </Button>
                {addProductIcon ? (
                  <Button
                    variant="text"
                    fullWidth
                    startIcon={<CheckCircleOutlineRounded />}
                    onClick={setFinalAddProduct}
                  >
                    Selesai
                    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                      <CircularProgress color="inherit" />
                    </Backdrop>
                  </Button>
                ) : null}
              </Stack>
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
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} id={index} align={column.align}>
                          {/* Start Add Rows */}
                          {addProductMode === true && column.id === 'name' ? (
                            <Autocomplete
                              fullWidth
                              freeSolo
                              id="name"
                              name="name"
                              onChange={(event, newValue) =>
                                newValue ? setName(newValue, row.id) : setName(newValue, row.id)
                              }
                              options={listName}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  sx={{ my: 4, minWidth: 100 }}
                                  InputProps={{ ...params.InputProps, disableUnderline: true }}
                                  variant="standard"
                                  placeholder="Nama Produk"
                                />
                              )}
                            />
                          ) : addProductMode === true && column.id === 'action' ? (
                            <ButtonGroup variant="outlined">
                              <IconButton onClick={() => deleteAddProductNew(row.id)}>
                                <Tooltip title="Cancel">
                                  <DoDisturbRounded sx={{ color: '#737373' }} />
                                </Tooltip>
                              </IconButton>
                            </ButtonGroup>
                          ) : addProductMode === true &&
                            (column.id === 'price_1' ||
                              column.id === 'price_2' ||
                              column.id === 'price_3' ||
                              column.id === 'stock') ? (
                            <TextField
                              required
                              fullWidth
                              name={column.id}
                              /* eslint-disable */
                              onInput={(e) => {
                                e.target.name === 'price_1' ||
                                e.target.name === 'price_2' ||
                                e.target.name === 'price_3'
                                  ? (e.target.value = Math.max(0, Number(e.target.value)).toString().slice(0, 3))
                                  : (e.target.value = Math.max(0, Number(e.target.value)).toString().slice(0, 5));
                              }}
                              /* eslint-disable */
                              type="number"
                              onChange={(event) => setAddProduct(event.target, row.id)}
                              InputProps={{ disableUnderline: true }}
                              variant="standard"
                              placeholder={column.label}
                              sx={{ minWidth: column.minWidth }}
                            />
                          ) : (
                            value
                          )}
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
