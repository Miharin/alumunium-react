import { create } from 'zustand';

export const tableHelper = create((set) => ({
  page: 0,
  open: false,
  rowsPerPage: 10,
  order: '',
  orderBy: '',
  search: '',
  editMode: false,
  showSearch: false,
  setOpen: () => set((state) => ({ open: !state.open })),
  filtered: (row, search) =>
    row.code.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.name.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.categories.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.merk.toString().toLowerCase().includes(search.toString().toLowerCase()),
  filteredProducts: (row, search) =>
    row.code.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.categories.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.merk.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.name.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.price_1.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.price_2.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.price_3.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.stock.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.lastInput.toString().toLowerCase().includes(search.toString().toLowerCase()),
  filteredUser: (row, search) =>
    row.name.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.role.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.status.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.shift.toString().toLowerCase().includes(search.toString().toLowerCase()),
  filteredDetail: (row, search) =>
    row.code.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.name.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.detail.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.stock.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.in.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.out.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.disc.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.total.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.nameCustomer.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.lastInput.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.stockOut.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.id.toString().toLowerCase().includes(search.toString().toLowerCase()),
  filteredRank: (row, search) =>
    row.code.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.name.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.stockOut.toString().toLowerCase().includes(search.toString().toLowerCase()),
  setShowSearch: () => set((state) => ({ showSearch: !state.showSearch })),
  setSearch: (event) => set(() => ({ search: event })),
  setPage: (newPage) => set(() => ({ page: newPage })),
  setChangeRowsPerPage: (event) => {
    set(() => ({ rowsPerPage: +event, page: 0 }));
  },
  onRequestSort: (event, property, order, orderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    set(() => (isAsc ? { order: 'desc', orderBy: property } : { order: 'asc', orderBy: property }));
  },
  descendingComparator: (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  },
}));
