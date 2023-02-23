import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
// @mui
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
} from '@mui/material';
import {
  ModeEditRounded,
  DeleteForeverRounded,
  Search,
  CheckCircleOutlineRounded,
  DoDisturbRounded,
  AddRounded,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
// components
// store
import { useDataUsers } from 'store/index';
// ----------------------------------------------------------------------

const columns = [
  { id: 'name', label: 'Nama', minWidth: 150, align: 'left' },
  { id: 'role', label: 'Pekerjaan', minWidth: 150, align: 'left' },
  {
    id: 'action',
    label: 'Action',
    minWidth: 150,
    align: 'left',
  },
];

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
// ----------------------------------------------------------------------

export default function UserPage() {
  const getUsers = useDataUsers((state) => state.getUsers);
  const getConfigs = useDataUsers((state) => state.getConfigs);
  const configs = useDataUsers((state) => state.configs);
  const loading = useDataUsers((state) => state.loading);
  const users = useDataUsers((state) => state.users);
  const page = useDataUsers((state) => state.page);
  const rowsPerPage = useDataUsers((state) => state.rowsPerPage);
  const setPage = useDataUsers((state) => state.setPage);
  const setChangeRowsPerPage = useDataUsers((state) => state.setChangeRowsPerPage);
  const onRequestSort = useDataUsers((state) => state.onRequestSort);
  const order = useDataUsers((state) => state.order);
  const orderBy = useDataUsers((state) => state.orderBy);
  const descendingComparator = useDataUsers((state) => state.descendingComparator);
  const search = useDataUsers((state) => state.search);
  const setSearch = useDataUsers((state) => state.setSearch);
  const showSearch = useDataUsers((state) => state.showSearch);
  const setShowSearch = useDataUsers((state) => state.setShowSearch);
  const editMode = useDataUsers((state) => state.editMode);
  const addUserMode = useDataUsers((state) => state.addUserMode);
  const setAddUserMode = useDataUsers((state) => state.setAddUserMode);
  const deleteAddUserNew = useDataUsers((state) => state.deleteAddUserNew);
  const showPassword = useDataUsers((state) => state.showPassword);
  const setShowPassword = useDataUsers((state) => state.setShowPassword);
  const userId = useDataUsers((state) => state.editUserId);
  const setUserId = useDataUsers((state) => state.setUserId);
  const setEditUser = useDataUsers((state) => state.setEditUser);
  const setEdit = useDataUsers((state) => state.setEdit);
  const editUser = useDataUsers((state) => state.editUser);
  const setAddUser = useDataUsers((state) => state.setAddUser);
  const addUserIcon = useDataUsers((state) => state.addUserIcon);
  const setFinalAddUser = useDataUsers((state) => state.setFinalAddUser);
  const setDeleteUser = useDataUsers((state) => state.setDeleteUser);
  const rows = users;
  const filtered = useDataUsers((state) => state.filtered);
  useEffect(() => {
    getUsers();
    getConfigs();
  }, [getUsers, getConfigs]);
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property, order, orderBy);
  };
  const handleEdit = (event) => setUserId(event);
  const roleManager = getConfigs === {} ? [] : configs.role;
  return (
    <>
      <Helmet>
        <title> Product | Alu Jaya </title>
      </Helmet>
      <Paper sx={{ mx: 5, alignItems: 'center' }} elevation={5}>
        {showSearch ? (
          <ClickAwayListener onClickAway={setShowSearch}>
            <Slide direction="right" in={showSearch} mountOnEnter unmountOnExit>
              <TextField
                sx={{ m: 2 }}
                name="Search"
                label="Search"
                variant="outlined"
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Slide>
          </ClickAwayListener>
        ) : (
          <Slide direction="left" in={!showSearch} mountOnEnter unmountOnExit>
            <Search sx={{ m: 4 }} onClick={setShowSearch} />
          </Slide>
        )}
        <TableContainer>
          <Table aria-label="Sticky Table">
            <caption>
              <Button
                disabled={addUserMode}
                variant="text"
                fullWidth
                startIcon={<AddRounded />}
                onClick={setAddUserMode}
              >
                Add Users
              </Button>
            </caption>
            <TableHead>
              <TableRow>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy, descendingComparator))
                .filter((row) => filtered(row, search))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} id={index} align={column.align}>
                          {editMode === true ? (
                            column.id === 'action' && userId === row.id ? (
                              <ButtonGroup variant="outlined">
                                <IconButton onClick={() => setEditUser(row.id)}>
                                  <Tooltip title="Confirm">
                                    <CheckCircleOutlineRounded sx={{ color: '#737373' }} />
                                  </Tooltip>
                                </IconButton>
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
                            ) : userId === row.id ? (
                              column.id === 'role' ? (
                                <Autocomplete
                                  isOptionEqualToValue={(option, value) => option.label === value.value}
                                  disablePortal
                                  id="optionsShift"
                                  name={column.id}
                                  onChange={(event, newValue) =>
                                    newValue !== null ? setEdit(newValue) : setEdit(event.target)
                                  }
                                  options={roleManager}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                                      variant="standard"
                                      placeholder={column.label}
                                    />
                                  )}
                                />
                              ) : (
                                <TextField
                                  fullWidth
                                  onChange={(event) => setEdit(event.target)}
                                  InputProps={{ disableUnderline: true }}
                                  name={column.id}
                                  placeholder={value}
                                  variant="standard"
                                  value={editUser[column.id] !== undefined ? editUser[column.id] : ''}
                                />
                              )
                            ) : column.id === 'password' && value.length > 15 && userId !== row.id ? (
                              '********'
                            ) : (
                              value
                            )
                          ) : column.id === 'action' && editMode === false && addUserMode === false ? (
                            <ButtonGroup variant="outlined">
                              {showPassword && userId === row.id ? (
                                <IconButton onClick={setShowPassword}>
                                  <Tooltip title="Hide Password">
                                    <VisibilityOff sx={{ color: '#737373' }} />
                                  </Tooltip>
                                </IconButton>
                              ) : (
                                <IconButton onClick={() => setShowPassword(row.id)}>
                                  <Tooltip title="Show Password">
                                    <Visibility sx={{ color: '#737373' }} />
                                  </Tooltip>
                                </IconButton>
                              )}
                              <IconButton onClick={() => handleEdit(row.id)}>
                                <Tooltip title="Edit User">
                                  <ModeEditRounded sx={{ color: '#737373' }} />
                                </Tooltip>
                              </IconButton>
                              <IconButton onClick={() => setDeleteUser(row.id)}>
                                <Tooltip title="Delete User">
                                  <DeleteForeverRounded sx={{ color: '#737373' }} />
                                </Tooltip>
                              </IconButton>
                            </ButtonGroup>
                          ) : column.id === 'password' && addUserMode === false && showPassword === false ? (
                            '********'
                          ) : column.id === 'password' &&
                            value.length > 15 &&
                            addUserMode === false &&
                            showPassword === true &&
                            userId === row.id ? (
                            `${value.slice(0, 15)}...`
                          ) : column.id === 'password' &&
                            addUserMode === false &&
                            showPassword === true &&
                            userId !== row.id ? (
                            '********'
                          ) : column.id === 'password' &&
                            addUserMode === true &&
                            showPassword === false &&
                            userId !== row.id ? (
                            '********'
                          ) : (
                            value
                          )}
                          {addUserMode === true && value === '' ? (
                            column.id === 'role' ? (
                              <Autocomplete
                                isOptionEqualToValue={(option, value) => option.label === value.value}
                                disablePortal
                                id="optionsShift"
                                name={column.id}
                                onChange={(event, newValue) =>
                                  newValue !== null ? setEdit(newValue) : setEdit(event.target)
                                }
                                options={roleManager}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    InputProps={{ ...params.InputProps, disableUnderline: true }}
                                    variant="standard"
                                    placeholder={column.label}
                                  />
                                )}
                              />
                            ) : (
                              <TextField
                                required
                                fullWidth
                                name={column.id}
                                onChange={(event) => setAddUser(event.target)}
                                InputProps={{ disableUnderline: true }}
                                variant="standard"
                                placeholder={column.label}
                                sx={{ width: column.minWidth }}
                              />
                            )
                          ) : addUserMode === true && column.id === 'action' && row.id === '' ? (
                            <ButtonGroup variant="outlined">
                              {addUserIcon ? (
                                <IconButton onClick={setFinalAddUser}>
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
                              <IconButton onClick={deleteAddUserNew}>
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
