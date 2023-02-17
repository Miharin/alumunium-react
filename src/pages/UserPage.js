import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
// @mui
import {
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
} from '@mui/material';
import { ModeEditRounded, DeleteForeverRounded } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
// components
// store
import { useDataUsers } from 'store/index';
// ----------------------------------------------------------------------

const columns = [
  { id: 'name', label: 'Name', minWidth: 200, align: 'center' },
  { id: 'role', label: 'Role', minWidth: 200, align: 'center' },
  { id: 'status', label: 'Status', minWidth: 200, align: 'center' },
  { id: 'shift', label: 'Shift', minWidth: 200, align: 'center' },
  {
    id: 'action',
    label: 'Action',
    minWidth: 200,
    align: 'center',
    renderCell: () => (
      <>
        <ModeEditRounded sx={{ color: '#737373', mr: 2 }} /> <DeleteForeverRounded sx={{ color: '#737373' }} />
      </>
    ),
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
  console.log(stabilizedThis);
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
  useEffect(() => {
    getUsers();
  }, [getUsers]);
  const users = useDataUsers((state) => state.users);
  const page = useDataUsers((state) => state.page);
  const rowsPerPage = useDataUsers((state) => state.rowsPerPage);
  const setPage = useDataUsers((state) => state.setPage);
  const setChangeRowsPerPage = useDataUsers((state) => state.setChangeRowsPerPage);
  const onRequestSort = useDataUsers((state) => state.onRequestSort);
  const order = useDataUsers((state) => state.order);
  const orderBy = useDataUsers((state) => state.orderBy);
  const descendingComparator = useDataUsers((state) => state.descendingComparator);
  const rows = users;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property, order, orderBy);
  };

  return (
    <>
      <Helmet>
        <title> User | Alu Jaya </title>
      </Helmet>
      <Paper sx={{ mx: 5, alignItems: 'center' }} elevation={5}>
        <TableContainer>
          <Table aria-label="Sticky Table">
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
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} id={index} align={column.align}>
                          {column.format && typeof value === 'number' ? column.format(value) : value}
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
