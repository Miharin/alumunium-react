import { create } from 'zustand';
import { sha256 } from 'crypto-hash';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from 'config/firebaseConfig';

export const dataUsers = create((set, get) => ({
  users: [],
  editUserId: '',
  page: 0,
  rowsPerPage: 10,
  order: '',
  orderBy: '',
  search: '',
  addUser: {
    id: '',
    name: '',
    role: '',
    status: '',
    shift: '',
    username: '',
    password: '',
  },
  addUserMode: false,
  editMode: false,
  showSearch: false,
  showPassword: false,
  setShowPassword: () => set((state) => ({ showPassword: !state.showPassword })),
  setUserId: (id) => set((state) => ({ editUserId: id, editMode: !state.editMode })),
  deleteAddUserNew: () => {
    const userDelete = get().users;
    delete userDelete[userDelete.length - 1];
    set((state) => ({ addUserMode: !state.addUserMode }));
  },
  setAddUserMode: () => {
    set((state) => ({
      addUserMode: !state.addUserMode,
      users: [
        ...state.users,
        {
          id: state.addUser.id,
          name: state.addUser.name,
          role: state.addUser.role,
          status: state.addUser.status,
          shift: state.addUser.shift,
          username: state.addUser.username,
          password: state.addUser.password,
        },
      ],
    }));
  },
  filtered: (row, search) =>
    row.name.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.role.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.status.toString().toLowerCase().includes(search.toString().toLowerCase()) ||
    row.shift.toString().toLowerCase().includes(search.toString().toLowerCase()),
  setShowSearch: () => set((state) => ({ showSearch: !state.showSearch })),
  setSearch: (event) => set(() => ({ search: event })),
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
    await onSnapshot(collection(db, 'users'), (usersData) => {
      set(() => ({ users: [] }));
      usersData.forEach(async (user) => {
        const hashPassword = await sha256(user.data().password);
        const { showPassword } = get().showPassword;
        const passwordShow = showPassword ? user.data().password : hashPassword;
        set((state) => ({
          users: [
            ...state.users,
            {
              id: user.id,
              name: user.data().name,
              role: user.data().role,
              status: user.data().status,
              shift: user.data().shift,
              username: user.data().username,
              password: passwordShow,
            },
          ],
        }));
      });
    });
  },
}));
