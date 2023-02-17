import { create } from 'zustand';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'config/firebaseConfig';

export const dataUsers = create((set) => ({
  users: [],
  page: 0,
  rowsPerPage: 10,
  order: 'asc',
  orderBy: 'name',
  setPage: (newPage) => set(() => ({ page: newPage })),
  setChangeRowsPerPage: (event) => {
    console.log(event);
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
  getUsers: async () => {
    const userData = await getDocs(collection(db, 'users'));
    userData.forEach((user) => {
      set((state) => ({
        users: [
          ...state.users,
          {
            id: user.id,
            name: user.data().name,
            role: user.data().role,
            status: user.data().status,
            shift: user.data().shift,
          },
        ],
      }));
    });
  },
}));
