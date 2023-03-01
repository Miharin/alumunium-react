import { create } from 'zustand';
import { sha256 } from 'crypto-hash';
import { collection, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from 'config/firebaseConfig';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const dataUsers = create((set, get) => ({
  loading: true,
  openSnackbar: false,
  snackbarMessage: '',
  users: [],
  configs: {},
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
  setOpenSnackbar: () => set((state) => ({ openSnackbar: !state.openSnackbar })),
  setEditUser: (userId) => {
    const getUser = get().users;
    const editUserFinal = get().editUser;
    const getOpenSnackbar = get().setOpenSnackbar;
    getUser.forEach(async (user) => {
      if (user.id === userId) {
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
        set(() => ({ snackbarMessage: `User dengan Id ${userId} Berhasil Di Update !` }));
        set((state) => ({ loading: !state.loading, editMode: !state.editMode, editUser: {} }));
        getOpenSnackbar();
      }
    });
  },
  setEdit: (event) => {
    set((state) =>
      event === 'status' || event === 'shift'
        ? { editUser: { ...state.editUser, [event]: '' } }
        : { editUser: { ...state.editUser, [event.name]: event.value } }
    );
  },
  setAddUser: (event, newValue) => {
    if (event === 'status' || event === 'role' || event === 'shift') {
      set((state) => ({ addUser: { ...state.addUser, [event]: newValue } }));
    } else {
      set((state) => ({ addUser: { ...state.addUser, [event.name]: event.value } }));
    }

    set((state) =>
      state.addUser.name === '' ||
      state.addUser.role === '' ||
      state.addUser.status === '' ||
      state.addUser.shift === '' ||
      state.addUser.username === '' ||
      state.addUser.password === '' ||
      state.addUser.password.length <= 5
        ? null
        : { addUserIcon: !state.adduserIcon }
    );
  },
  setFinalAddUser: async () => {
    const userAddFinal = get().addUser;
    const getOpenSnackbar = get().setOpenSnackbar;
    const email = `${userAddFinal.username}@gmail.com`;
    const auth = getAuth();
    delete userAddFinal.id;
    set((state) => ({ addUser: { ...state.addUser, timeStamp: serverTimestamp() }, loading: !state.loading }));
    createUserWithEmailAndPassword(auth, email, userAddFinal.password);
    await addDoc(collection(db, 'users'), userAddFinal);
    set(() => ({ snackbarMessage: `User dengan Nama ${userAddFinal.name} Berhasil Di Tambahkan !` }));
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
    getOpenSnackbar();
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
    const getOpenSnackbar = get().setOpenSnackbar;
    set((state) => ({ loading: !state.loading }));
    await deleteDoc(doc(db, 'users', id));
    set(() => ({ snackbarMessage: `User dengan Id ${id} Berhasil Di Hapus !` }));
    set((state) => ({ loading: !state.loading }));
    getOpenSnackbar();
  },
  getConfigs: async () => {
    await onSnapshot(collection(db, 'configs'), (configsData) => {
      configsData.forEach((config) =>
        config.id === 'users'
          ? set((state) => ({
              configs: {
                ...state.configs,
                status: config.data().status,
                shift: config.data().shift,
                role: config.data().role,
              },
            }))
          : null
      );
    });
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
    await delay(2000);
    set((state) => ({ loading: !state.loading }));
  },
}));
