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
import { useTableHelper, useMutationPcsToSetStore } from 'store/index';
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

export default function MutationPcsToSet() {
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
  const loading = useMutationPcsToSetStore((state) => state.loading);
  const setName = useMutationPcsToSetStore((state) => state.setName);
  const transactionMode = useMutationPcsToSetStore((state) => state.transactionMode);
  const setTransactionMode = useMutationPcsToSetStore((state) => state.setTransactionMode);
  const deleteTransactionNew = useMutationPcsToSetStore((state) => state.deleteTransactionNew);
  const setTransaction = useMutationPcsToSetStore((state) => state.setTransaction);
  const transactionIcon = useMutationPcsToSetStore((state) => state.transactionIcon);
  const setFinalTransaction = useMutationPcsToSetStore((state) => state.setFinalTransaction);
  const openSnackbar = useMutationPcsToSetStore((state) => state.openSnackbar);
  const snackbarMessage = useMutationPcsToSetStore((state) => state.snackbarMessage);
  const setOpenSnackbar = useMutationPcsToSetStore((state) => state.setOpenSnackbar);
  const getProducts = useMutationPcsToSetStore((state) => state.getProducts);
  const listProducts = useMutationPcsToSetStore((state) => state.listProducts);
  const listName = useMutationPcsToSetStore((state) => state.listName);
  // const setPriceSelection = useMutationPcsToSetStore((state) => state.setPriceSelection);
  // const total = useMutationPcsToSetStore((state) => state.total);
  // const setDate = useMutationPcsToSetStore((state) => state.setDate);
  const getDataCode = useMutationPcsToSetStore((state) => state.getDataCode);
  const rows = listProducts;
  // End ListProduct Initialization

  // Declaration for Column of Table
  const columns = [
    { id: 'codeBox', label: 'Kode', minWidth: 150, align: 'left' },
    { id: 'nameBox', label: 'Nama Barang', minWidth: 300, align: 'left' },
    { id: 'qtyBox', label: 'Jumlah', minWidth: 100, align: 'left' },
    { id: 'codeBox2', label: 'Kode', minWidth: 150, align: 'left' },
    { id: 'nameBox2', label: 'Nama Barang', minWidth: 300, align: 'left' },
    { id: 'qtyBox2', label: 'Jumlah', minWidth: 100, align: 'left' },
    { id: 'codePack', label: 'Kode Set', minWidth: 150, align: 'left' },
    { id: 'namePack', label: 'Nama Barang Set', minWidth: 300, align: 'left' },
    { id: 'totalPackIn', label: 'Total', minWidth: 100, align: 'left' },
    {
      id: 'action',
      label: 'Action',
      minWidth: 100,
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

  const qtyBox = React.useRef(null);
  const qtyBoxPack = React.useRef(null);
  const disc = React.useRef(null);
  // const disc2 = React.useRef(null);
  // console.log(rows);
  // Return Display
  return loading ? (
    <Skeleton sx={{ mx: 5, alignItems: 'center' }} animation="wave" height={300} variant="rectangular" />
  ) : (
    <>
      <Helmet>
        <title> Mutasi Pcs To Set | Alu Jaya </title>
      </Helmet>
      <Paper sx={{ mx: 5, alignItems: 'center', pt: 1 }} elevation={5}>
        {/* <Stack direction="row" spacing={2} sx={{ m: 2 }}>
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
          <TextField
            required
            fullWidth
            name="date"
            type="text"
            onChange={(event) => setDate(event.target)}
            InputProps={{ disableUnderline: true }}
            variant="standard"
            placeholder="Tanggal"
          />
        </Stack> */}
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
                          {transactionMode === true &&
                          (column.id === 'nameBox' ||
                            column.id === 'nameBox2' ||
                            (column.id === 'namePack' && row.nameBox !== '' && row.nameBox2 !== '')) ? (
                            <Autocomplete
                              fullWidth
                              freeSolo
                              id="name"
                              name={column.id}
                              value={value}
                              onInputChange={(event, newValue) =>
                                newValue ? getDataCode(newValue) : getDataCode(newValue)
                              }
                              onChange={(event, newValue) =>
                                newValue ? setName(newValue, row.id, column.id) : setName(newValue, row.id)
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
                          ) : transactionMode === true && column.id === 'action' ? (
                            <ButtonGroup variant="outlined">
                              <IconButton onClick={() => deleteTransactionNew(row.id)}>
                                <Tooltip title="Cancel">
                                  <DoDisturbRounded sx={{ color: '#737373' }} />
                                </Tooltip>
                              </IconButton>
                            </ButtonGroup>
                          ) : row.nameBox !== '' &&
                            transactionMode === true &&
                            (column.id === 'qtyBox' || column.id === 'qtyBox2') ? (
                            <TextField
                              required
                              fullWidth
                              // eslint-disable-next-line
                              autoFocus={true}
                              name={column.id}
                              /* eslint-disable */
                              onInput={(e) => {
                                e.target.name === 'qtyBox' || e.target.name === 'qtyBox2'
                                  ? (e.target.value = Math.max(0, Number(e.target.value)).toString().slice(0, 3))
                                  : (e.target.value = Math.max(0, Number(e.target.value)).toString().slice(0, 5));
                              }}
                              /* eslint-disable */
                              type="number"
                              inputRef={column.id === 'qtyBox' ? qtyBox : qtyBoxPack}
                              value={value}
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
