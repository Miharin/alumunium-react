import { create } from 'zustand';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  arrayUnion,
  Timestamp,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from 'config/firebaseConfig';
import { getAuth } from 'firebase/auth';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const historyProductStore = create((set, get) => ({
  loading: true,
  openSnackbar: false,
  snackbarMessage: '',
  snackbarType: 'success',
  listCategories: [],
  name: '',
  helperCode: '',
  helperCodeName: '',
  listName: [],
  nameSelect: '',
  helperAddCategory: '',
  products: [],
  search: '',
  removeProduct: {
    id: '',
    code: '',
    name: '',
    in: '0',
    out: '',
  },
  removeProductMode: false,
  removeProductIcon: false,
  showSearch: false,
  setOpenSnackbar: () => set((state) => ({ openSnackbar: !state.openSnackbar })),
  setNameSelect: (name) =>
    name !== undefined || null || ''
      ? set((state) => ({
          nameSelect: name.label,
          removeProduct: { ...state.removeProduct, code: name.code, name: name.label },
          loading: !state.loading,
        }))
      : (set((state) => ({ nameSelect: '', loading: !state.loading })), get().deleteRemoveProductNew()),
  setRemoveProduct: (event) => {
    set((state) => ({ removeProduct: { ...state.removeProduct, [event.name]: event.value } }));
    set((state) =>
      state.removeProduct.out !== ''
        ? {
            removeProductIcon: true,
          }
        : { removeProductIcon: false }
    );
  },
  setFinalRemoveProduct: async () => {
    set((state) => ({
      removeProduct: { ...state.removeProduct, timeStamp: serverTimestamp() },
      loading: !state.loading,
    }));
    const removeProductFinal = get().removeProduct;
    const getOpenSnackbar = get().setOpenSnackbar;
    delete removeProductFinal.id;
    const docId = await getDocs(collection(db, 'listProducts'));
    const docIdEdit = [];
    docId.forEach((item) => {
      docIdEdit.push({ id: item.id, code: item.data().code, stock: item.data().stock });
    });
    const filterData = docIdEdit.filter((product) => product.code === removeProductFinal.code);
    if (filterData.length === 1) {
      const removeProductStockFinal = {
        stock: (Number(filterData[0].stock) - Number(removeProductFinal.out)).toString(),
        history: arrayUnion({
          detail: 'Penjualan Kasir',
          in: '0',
          out: removeProductFinal.out,
          stock: (Number(filterData[0].stock) - Number(removeProductFinal.out)).toString(),
          lastInput: getAuth().currentUser.email,
          timeStamp: Timestamp.now(),
        }),
      };
      await updateDoc(doc(db, 'listProducts', filterData[0].id), removeProductStockFinal);
      set(() => ({ snackbarMessage: `${removeProductFinal.name} Berhasil Dikurangi !`, snackbarType: 'success' }));
    } else {
      set(() => ({ snackbarMessage: `${removeProductFinal.name} Gagal Dikurangi !`, snackbarType: 'error' }));
    }
    const removeProductDelete = get().products;
    removeProductDelete.pop();
    set((state) => ({
      removeProduct: {
        id: '',
        code: '',
        name: '',
        in: '0',
        out: '',
      },
      removeProductMode: !state.removeProductMode,
      loading: !state.loading,
    }));
    get().getProducts();
    getOpenSnackbar();
  },
  deleteRemoveProductNew: () => {
    const removeProductDelete = get().products;
    removeProductDelete.pop();
    set((state) => ({ removeProductMode: !state.removeProductMode }));
  },
  setRemoveProductMode: () => {
    set((state) => ({
      removeProductMode: !state.removeProductMode,
      products: [
        ...state.products,
        {
          id: state.removeProduct.id,
          code: state.removeProduct.code,
          name: state.removeProduct.name,
          in: state.removeProduct.in,
          out: state.removeProduct.out,
        },
      ],
    }));
  },
  getField: async () => {
    set(() => ({ listName: [] }));
    await onSnapshot(collection(db, 'codeProducts'), (configsData) => {
      configsData.forEach((config) => {
        set((state) => ({
          listName: [
            ...state.listName,
            {
              code: config.data().code,
              label: config.data().name,
            },
          ],
        }));
      });
    });
  },
  getProducts: async () => {
    const name = get().nameSelect;
    await onSnapshot(query(collection(db, 'listProducts'), orderBy('stock')), (codeProduct) => {
      set(() => ({ products: [] }));
      codeProduct.forEach(async (product) => {
        product.data().history.forEach((item) => {
          if (name !== '' && name === product.data().name) {
            set((state) => ({
              products: [
                ...state.products,
                {
                  id: `${product.id}|${item.timeStamp.seconds.toString()}`,
                  code: product.data().code,
                  name: product.data().name,
                  stock: item.stock,
                  detail: item.detail,
                  in: item.in,
                  out: item.out,
                  total: item.out !== '0' ? item.total : '',
                  nameCustomer: item.out !== '0' ? item.nameCustomer : '',
                  lastInput: `${new Date(item.timeStamp.seconds * 1000).toLocaleDateString('in-in', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })} Pada Jam ${new Date(item.timeStamp.seconds * 1000).toLocaleTimeString('in-in')} Oleh ${
                    item.lastInput.split('@', 1)[0].charAt(0).toUpperCase() + item.lastInput.split('@', 1)[0].slice(1)
                  }`,
                },
              ],
            }));
          }
          if (name === '') {
            set((state) => ({
              products: [
                ...state.products,
                {
                  id: `${product.id}|${item.timeStamp.seconds.toString()}`,
                  code: product.data().code,
                  name: product.data().name,
                  detail: item.detail,
                  in: item.in,
                  out: item.out,
                  total: item.out !== '0' ? item.total : '',
                  nameCustomer: item.out !== '0' ? item.nameCustomer : '',
                  stock: item.stock,
                  lastInput: `${new Date(item.timeStamp.seconds * 1000).toLocaleDateString('in-in', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })} Pada Jam ${new Date(item.timeStamp.seconds * 1000).toLocaleTimeString('in-in')} Oleh ${
                    item.lastInput.split('@', 1)[0].charAt(0).toUpperCase() + item.lastInput.split('@', 1)[0].slice(1)
                  }`,
                },
              ],
            }));
          }
        });
      });
    });
    await delay(2000);
    set(() => ({ loading: false }));
  },
}));
