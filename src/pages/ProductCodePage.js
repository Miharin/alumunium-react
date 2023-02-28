// Start Import
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
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
} from '@mui/material';
import {
  ModeEditRounded,
  DeleteForeverRounded,
  FilterAltRounded,
  CheckCircleOutlineRounded,
  DoDisturbRounded,
  AddRounded,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

// store
import { useItemCode, useTableHelper } from 'store/index';
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

export default function ProductPage() {
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
  const filtered = useTableHelper((state) => state.filtered);
  // End Helper Table

  // Start CodeProduct Initialization
  const loading = useItemCode((state) => state.loading);
  const listCategory = useItemCode((state) => state.listCategories);
  const listMerk = useItemCode((state) => state.listMerk);
  const categories = useItemCode((state) => state.categories);
  const merk = useItemCode((state) => state.merk);
  const setCategories = useItemCode((state) => state.setCategories);
  const setMerk = useItemCode((state) => state.setMerk);
  const getCodeProducts = useItemCode((state) => state.getCodeProducts);
  const codeProducts = useItemCode((state) => state.codeProducts);
  const editMode = useItemCode((state) => state.editMode);
  const addCodeProductMode = useItemCode((state) => state.addCodeProductMode);
  const setAddCodeProductMode = useItemCode((state) => state.setAddCodeProductMode);
  const deleteAddCodeProductNew = useItemCode((state) => state.deleteAddCodeProductNew);
  const codeProductId = useItemCode((state) => state.editCodeProductId);
  const setCodeProductId = useItemCode((state) => state.setCodeProductId);
  const setEditCodeProduct = useItemCode((state) => state.setEditCodeProduct);
  const setEdit = useItemCode((state) => state.setEdit);
  const editCodeProduct = useItemCode((state) => state.editCodeProduct);
  const editCodeProductIcon = useItemCode((state) => state.editCodeProductIcon);
  const setAddCodeProduct = useItemCode((state) => state.setAddCodeProduct);
  const addCodeProductIcon = useItemCode((state) => state.addCodeProductIcon);
  const setFinalAddCodeProduct = useItemCode((state) => state.setFinalAddCodeProduct);
  const setDeleteCodeProduct = useItemCode((state) => state.setDeleteCodeProduct);
  const rows = codeProducts;
  // End ProductCode Initialization

  // Declaration for Column of Table
  let columns = [];
  if ((categories !== '' || null || undefined) && (merk !== '' || null || undefined)) {
    columns = [
      { id: 'code', label: 'Code', minWidth: 150, align: 'left' },
      { id: 'name', label: 'Nama', minWidth: 150, align: 'left' },
      {
        id: 'action',
        label: 'Action',
        minWidth: 150,
        align: 'left',
      },
    ];
  } else {
    columns = [
      { id: 'code', label: 'Code', minWidth: 150, align: 'left' },
      { id: 'name', label: 'Nama', minWidth: 150, align: 'left' },
    ];
  }

  // Function for Getting Code Product Data from Database
  useEffect(() => {
    getCodeProducts();
  }, [getCodeProducts]);

  // Function for Filter Table
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property, order, orderBy);
  };
  // Function Helper for Edit
  const handleEdit = (event) => setCodeProductId(event);
  // Return Display
  return loading ? (
    <Skeleton sx={{ mx: 5, alignItems: 'center' }} animation="wave" height={300} variant="rectangular" />
  ) : (
    <>
      <Helmet>
        <title> Product Code | Alu Jaya </title>
      </Helmet>
      <Paper sx={{ mx: 5, alignItems: 'center' }} elevation={5}>
        {/* Start Function Showing Search and Filter */}
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
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Divider orientation="vertical" variant="middle" flexItem />
                <Autocomplete
                  isOptionEqualToValue={(option, value) => option.label === value.value}
                  sx={{ mx: 2 }}
                  id="category"
                  name="categories"
                  onChange={(event, newValue) =>
                    newValue !== null
                      ? (setCategories(newValue), getCodeProducts())
                      : (setCategories(), getCodeProducts())
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
                    newValue !== null ? (setMerk(newValue), getCodeProducts()) : (setMerk(), getCodeProducts())
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
          <Table aria-label="Sticky Table">
            <caption>
              {(categories !== '' || null || undefined) && (merk !== '' || null || undefined) ? (
                <Button
                  disabled={addCodeProductMode}
                  variant="text"
                  fullWidth
                  startIcon={<AddRounded />}
                  onClick={setAddCodeProductMode}
                >
                  Add Code Product
                </Button>
              ) : (
                <Alert severity="warning">
                  Jika Ingin Menambahkan, Mengubah, atau Menghapus Code Product Baru Maka{' '}
                  {categories === '' || undefined || null ? 'Kategori' : null}{' '}
                  {(categories === '' || undefined || null) && (merk === '' || null || undefined) ? 'dan ' : null}
                  {merk === '' || undefined || null ? 'Merk' : null} Harap Diisi
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
                          {editMode === true ? (
                            column.id === 'action' && codeProductId === row.id ? (
                              <ButtonGroup variant="outlined">
                                {editCodeProductIcon ? (
                                  <IconButton onClick={() => setEditCodeProduct(row.id)}>
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
                            ) : codeProductId === row.id ? (
                              <TextField
                                fullWidth
                                onChange={(event) => setEdit(event.target)}
                                InputProps={{ disableUnderline: true }}
                                name={column.id}
                                placeholder={value}
                                variant="standard"
                                value={editCodeProduct[column.id] !== undefined ? editCodeProduct[column.id] : ''}
                              />
                            ) : (
                              value
                            )
                          ) : column.id === 'action' && editMode === false && addCodeProductMode === false ? (
                            (categories !== '' || null || undefined) && (merk !== '' || null || undefined) ? (
                              <ButtonGroup variant="outlined">
                                <IconButton onClick={() => handleEdit(row.id)}>
                                  <Tooltip title="Edit Code Product">
                                    <ModeEditRounded sx={{ color: '#737373' }} />
                                  </Tooltip>
                                </IconButton>
                                <IconButton onClick={() => setDeleteCodeProduct(row.id)}>
                                  <Tooltip title="Delete Code Product">
                                    <DeleteForeverRounded sx={{ color: '#737373' }} />
                                  </Tooltip>
                                </IconButton>
                              </ButtonGroup>
                            ) : null
                          ) : (
                            value
                          )}
                          {/* End Edit Rows and Display Rows */}
                          {/* Start Add Rows */}
                          {addCodeProductMode === true && value === '' ? (
                            <TextField
                              required
                              fullWidth
                              name={column.id}
                              onChange={(event) => setAddCodeProduct(event.target)}
                              InputProps={{ disableUnderline: true }}
                              variant="standard"
                              placeholder={column.label}
                              sx={{ minWidth: column.minWidth }}
                            />
                          ) : addCodeProductMode === true && column.id === 'action' && row.id === '' ? (
                            <ButtonGroup variant="outlined">
                              {addCodeProductIcon ? (
                                <IconButton onClick={setFinalAddCodeProduct}>
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
                              <IconButton onClick={deleteAddCodeProductNew}>
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
