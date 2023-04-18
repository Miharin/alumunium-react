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
import { useTableHelper, useTransactionStore } from 'store/index';
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

export default function Transaction() {
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
  const loading = useTransactionStore((state) => state.loading);
  const setName = useTransactionStore((state) => state.setName);
  const nameCus = useTransactionStore((state) => state.nameCus);
  const transactionMode = useTransactionStore((state) => state.transactionMode);
  const setTransactionMode = useTransactionStore((state) => state.setTransactionMode);
  const deleteTransactionNew = useTransactionStore((state) => state.deleteTransactionNew);
  const setTransaction = useTransactionStore((state) => state.setTransaction);
  const transactionIcon = useTransactionStore((state) => state.transactionIcon);
  const setFinalTransaction = useTransactionStore((state) => state.setFinalTransaction);
  const openSnackbar = useTransactionStore((state) => state.openSnackbar);
  const snackbarMessage = useTransactionStore((state) => state.snackbarMessage);
  const setOpenSnackbar = useTransactionStore((state) => state.setOpenSnackbar);
  const getProducts = useTransactionStore((state) => state.getProducts);
  const listProducts = useTransactionStore((state) => state.listProducts);
  const listName = useTransactionStore((state) => state.listName);
  const setPriceSelection = useTransactionStore((state) => state.setPriceSelection);
  const total = useTransactionStore((state) => state.total);
  const rows = listProducts;
  // End ListProduct Initialization

  // Declaration for Column of Table
  const columns = [
    { id: 'code', label: 'Kode', minWidth: 150, align: 'left' },
    { id: 'categories', label: 'Kategori', minWidth: 150, align: 'left' },
    { id: 'merk', label: 'Merk', minWidth: 150, align: 'left' },
    { id: 'name', label: 'Nama', minWidth: 300, align: 'left' },
    { id: 'qty', label: 'Jumlah', minWidth: 150, align: 'left' },
    { id: 'priceSelect', label: 'Pilihan Harga', minWidth: '150', align: 'left' },
    { id: 'price', label: 'Harga', minWidth: 150, align: 'left' },
    { id: 'disc', label: 'Potongan Reject', minWidth: 150, align: 'left' },
    { id: 'disc2', label: 'Potongan Per Karung / Karton', minWidth: 150, align: 'left' },
    { id: 'subtotal', label: 'Sub Total', minWidth: 150, align: 'left' },
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

  const qty = React.useRef(null);
  const disc = React.useRef(null);
  const disc2 = React.useRef(null);
  // Return Display
  return loading ? (
    <Skeleton sx={{ mx: 5, alignItems: 'center' }} animation="wave" height={300} variant="rectangular" />
  ) : (
    <>
      <Helmet>
        <title> Transaksi | Alu Jaya </title>
      </Helmet>
      <Paper sx={{ mx: 5, alignItems: 'center', pt: 1 }} elevation={5}>
        <Stack direction="row" spacing={2} sx={{ m: 2 }}>
          <TextField
            required
            fullWidth
            name="nameCustomer"
            type="text"
            onChange={(event) => setTransaction(event.target)}
            InputProps={{ disableUnderline: true }}
            variant="standard"
            placeholder="Nama"
          />
        </Stack>
        {/* Start Function Showing Search and Filter */}
        <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={setOpenSnackbar}>
          <Alert onClose={setOpenSnackbar} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        {/* End Function Showing Search and Filter */}
        <TableContainer>
          <Table aria-label="Sticky Table" size="small">
            <caption>
              <Stack direction="row" spacing={2}>
                <Button variant="text" fullWidth startIcon={<AddRounded />} onClick={setTransactionMode}>
                  Tambah Produk
                </Button>
                {transactionIcon ? (
                  <Button
                    variant="text"
                    fullWidth
                    startIcon={<CheckCircleOutlineRounded />}
                    onClick={setFinalTransaction}
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
                        <TableCell
                          key={column.id}
                          id={index}
                          align={column.align}
                          sx={{ borderBottom: '1px solid #000' }}
                        >
                          {/* Start Add Rows */}
                          {nameCus !== '' && transactionMode === true && column.id === 'name' ? (
                            <Autocomplete
                              fullWidth
                              freeSolo
                              id="name"
                              name="name"
                              value={value}
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
                          ) : nameCus !== '' && transactionMode === true && column.id === 'action' ? (
                            <ButtonGroup variant="outlined">
                              <IconButton onClick={() => deleteTransactionNew(row.id)}>
                                <Tooltip title="Cancel">
                                  <DoDisturbRounded sx={{ color: '#737373' }} />
                                </Tooltip>
                              </IconButton>
                            </ButtonGroup>
                          ) : nameCus !== '' &&
                            row.priceSelect !== '' &&
                            transactionMode === true &&
                            column.id === 'qty' ? (
                            <TextField
                              required
                              fullWidth
                              // eslint-disable-next-line
                              autoFocus={true}
                              name={column.id}
                              /* eslint-disable */
                              onInput={(e) => {
                                e.target.name === 'qty'
                                  ? (e.target.value = Math.max(0, Number(e.target.value)).toString().slice(0, 3))
                                  : (e.target.value = Math.max(0, Number(e.target.value)).toString().slice(0, 5));
                              }}
                              /* eslint-disable */
                              type="number"
                              inputRef={qty}
                              onChange={(event) => setTransaction(event.target, row.id)}
                              InputProps={{
                                disableUnderline: true,
                                onKeyPress: (event) => {
                                  const { key } = event;
                                  if (key === 'Enter') {
                                    /* eslint-disable */
                                    disc.current.focus();
                                    /* eslint-disable */
                                  }
                                },
                              }}
                              variant="standard"
                              placeholder={column.label}
                              sx={{ minWidth: column.minWidth }}
                            />
                          ) : nameCus !== '' && transactionMode === true && column.id === 'subtotal' ? (
                            value !== '0' ? (
                              new Intl.NumberFormat('in-in', {
                                style: 'currency',
                                currency: 'idr',
                                maximumSignificantDigits: 1,
                              }).format(value)
                            ) : (
                              'Rp.0'
                            )
                          ) : nameCus !== '' && transactionMode === true && column.id === 'price' ? (
                            value !== '' ? (
                              new Intl.NumberFormat('in-in', {
                                style: 'currency',
                                currency: 'idr',
                                maximumSignificantDigits: 3,
                              }).format(value)
                            ) : (
                              'Rp.0'
                            )
                          ) : nameCus !== '' &&
                            row.priceSelect !== '' &&
                            transactionMode === true &&
                            (column.id === 'disc' || column.id === 'disc2') ? (
                            <TextField
                              required
                              // eslint-disable-next-line
                              autoFocus={true}
                              inputRef={column.id === 'disc' ? disc : column.id === 'disc2' ? disc2 : null}
                              inputProps={{
                                onKeyPress: (event) => {
                                  const { key } = event;
                                  if (key === 'Enter') {
                                    /* eslint-disable */

                                    if (event.target.name === 'disc') {
                                      disc2.current.focus();
                                    }
                                    /* eslint-disable */
                                  }
                                },
                              }}
                              name={column.id}
                              /* eslint-disable */
                              onInput={(e) => {
                                e.target.name === 'qty'
                                  ? (e.target.value = Math.max(0, Number(e.target.value)).toString().slice(0, 3))
                                  : (e.target.value = Math.max(0, Number(e.target.value)).toString().slice(0, 5));
                              }}
                              /* eslint-disable */
                              type="number"
                              onChange={(event) => setTransaction(event.target, row.id)}
                              InputProps={{ disableUnderline: true }}
                              variant="standard"
                              placeholder={column.label}
                              sx={{ minWidth: column.minWidth }}
                            />
                          ) : nameCus !== '' && transactionMode === true && column.id === 'priceSelect' ? (
                            <Autocomplete
                              freeSolo
                              fullWidth
                              id={column.id}
                              name={column.id}
                              value={value !== null || undefined ? row.labelPrice : value}
                              onChange={(event, newValue) =>
                                newValue ? setPriceSelection(row.id, newValue) : setPriceSelection(row.id, newValue)
                              }
                              options={[
                                { id: 'price_1', label: 'Harga 1' },
                                { id: 'price_2', label: 'Harga 2' },
                                { id: 'price_3', label: 'Harga 3' },
                              ]}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  sx={{ minWidth: 100 }}
                                  InputProps={{ ...params.InputProps, disableUnderline: true }}
                                  variant="standard"
                                  placeholder="Harga"
                                />
                              )}
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
              <TableRow>
                <TableCell colSpan={3} sx={{ borderBottom: '1px solid #000' }} />
                <TableCell colSpan={3} sx={{ borderBottom: '1px solid #000' }}>
                  Total
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid #000' }}>
                  {total === 0
                    ? 'Rp.0.000,00'
                    : new Intl.NumberFormat('in-in', { style: 'currency', currency: 'idr' }).format(total)}
                </TableCell>
              </TableRow>
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
