import { create } from 'zustand';
import { sha256 } from 'crypto-hash';
import { collection, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from 'config/firebaseConfig';

export const dataUsers = create((set, get) => ({
  loading: false,
  users: [],
  editUserId: '',
  page: 0,
  rowsPerPage: 10,
  order: '',
  orderBy: '',
  search: '',
  editUser: {},
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
  addUserIcon: false,
  editMode: false,
  showSearch: false,
  showPassword: false,
  setEditUser: (userId) => {
    const getUser = get().users;
    const editUserFinal = get().editUser;
    getUser.forEach(async (user) => {
      if (user.id === userId) {
        set((state) => ({ editUser: { ...state.editUser, id: userId } }));
        if (editUserFinal.name === '') {
          delete editUserFinal.name;
        }
        if (editUserFinal.role === '') {
          delete editUserFinal.role;
        }
        if (editUserFinal.status === '') {
          delete editUserFinal.status;
        }
        if (editUserFinal.shift === '') {
          delete editUserFinal.shift;
        }
        if (editUserFinal.username === '') {
          delete editUserFinal.username;
        }
        if (editUserFinal.password === '') {
          delete editUserFinal.password;
        }

        const updateDocument = doc(db, 'users', userId);
        set((state) => ({ loading: !state.loading }));
        await updateDoc(updateDocument, editUserFinal);
        set((state) => ({ loading: !state.loading, editMode: !state.editMode, editUser: {} }));
      }
    });
  },
  setEdit: (event) => set((state) => ({ editUser: { ...state.editUser, [event.name]: event.value } })),
  setAddUser: (event) => {
    set((state) => ({ addUser: { ...state.addUser, [event.name]: event.value } }));
    set((state) =>
      state.addUser.name === '' ||
      state.addUser.role === '' ||
      state.addUser.status === '' ||
      state.addUser.shift === '' ||
      state.addUser.user === '' ||
      state.addUser.password === ''
        ? null
        : { addUserIcon: !state.adduserIcon }
    );
  },
  setFinalAddUser: async () => {
    const userAddFinal = get().addUser;
    delete userAddFinal.id;
    set((state) => ({ addUser: { ...state.addUser, timeStamp: serverTimestamp() }, loading: !state.loading }));
    await addDoc(collection(db, 'users'), userAddFinal);
    set((state) => ({
      addUser: {
        id: '',
        name: '',
        role: '',
        status: '',
        shift: '',
        username: '',
        password: '',
      },
      addUserMode: !state.addUserMode,
      loading: !state.loading,
    }));
  },
  setShowPassword: (id) => {
    set((state) =>
      id === null || undefined
        ? { showPassword: !state.showPassword, editUserId: '' }
        : { showPassword: !state.showPassword, editUserId: id }
    );
  },
  setUserId: (id) => set((state) => ({ editUserId: id, editMode: !state.editMode, showPassword: false })),
  deleteAddUserNew: () => {
    const userDelete = get().users;
    userDelete.pop();
    set((state) => ({ addUserMode: !state.addUserMode }));
  },
  setAddUserMode: () => {
    set((state) => ({
      addUserMode: !state.addUserMode,
      editUserId: state.addUser.id,
      showPassword: false,
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
  setDeleteUser: async (id) => {
    await deleteDoc(doc(db, 'users', id));
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
