import { create } from 'zustand';
import {
  collection,
  // onSnapshot,
  updateDoc,
  doc,
  getDocs,
  arrayUnion,
  Timestamp,
  serverTimestamp,
  query,
  //   orderBy,
  limit,
  where,
  arrayRemove,
} from 'firebase/firestore';
import { db } from 'config/firebaseConfig';
import { getAuth } from 'firebase/auth';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const rankStore = create((set, get) => ({
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
  monthSelect: '',
  helperAddCategory: '',
  products: [],
  productsIndex: [],
  search: '',
  test: [],
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
          nameSelect: name.label.split(' - ')[1],
          removeProduct: { ...state.removeProduct, code: name.code, name: name.label },
          loading: !state.loading,
        }))
      : (set((state) => ({ nameSelect: '', loading: !state.loading })), get().deleteRemoveProductNew()),
  setMonthSelect: (month) =>
    month !== undefined || null || ''
      ? set((state) => ({
          monthSelect: month,
          loading: !state.loading,
        }))
      : (set((state) => ({ monthSelect: '', loading: !state.loading })), get().deleteRemoveProductNew()),
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
  setDeleteProduct: async (data) => {
    const id = data.code;
    const deleteProd = await getDocs(query(collection(db, 'listProducts'), where('code', '==', id), limit(1)));
    const prodNew = get().products;
    deleteProd.forEach((prod) => {
      prod.data().history.forEach((historyProd) => {
        const date = `${new Date(historyProd.timeStamp.seconds * 1000).toLocaleDateString('in-in', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} Pada Jam ${new Date(historyProd.timeStamp.seconds * 1000).toLocaleTimeString('in-in')} Oleh ${
          historyProd.lastInput.split('@', 1)[0].charAt(0).toUpperCase() +
          historyProd.lastInput.split('@', 1)[0].slice(1)
        }`;
        if (data.lastInput === date) {
          const update = doc(db, 'listProducts', data.id.split('|')[0]);
          // update stock
          const stockUp =
            data.detail === 'Item Masuk'
              ? Number(prod.data().stock) - Number(data.in)
              : Number(prod.data().stock) + Number(data.out);
          // delete from data history
          updateDoc(update, { stock: stockUp, history: arrayRemove(historyProd) });
          // change in local
          set(() => ({ products: [] }));
          prodNew.forEach((product) => {
            if (product.lastInput !== date && product.code !== id) {
              set((state) => ({ products: [...state.products, product] }));
            }
          });
        }
      });
    });
  },
  getField: async () => {
    if (get().listName.length === 0) {
      set(() => ({ listName: [] }));
      const getData = await getDocs(collection(db, 'codeProducts'));
      getData.forEach((config) => {
        set((state) => ({
          listName: [
            ...state.listName,
            {
              code: config.data().code,
              label: `${config.data().code} - ${config.data().name}`,
            },
          ],
        }));
      });
    }
  },
  getProducts: async () => {
    const name = get().nameSelect;
    const month = get().monthSelect;
    const year = new Date().getFullYear();
    const yearPrev = new Date().getFullYear() - 1;
    if (get().productsIndex.length === 0) {
      set(() => ({ productsIndex: [] }));
      const getData = await getDocs(query(collection(db, 'listProducts')));
      getData.forEach((product) => {
        let stockOutVal = 0;
        product.data().history.forEach((item) => {
          // eslint-disable-next-line
          stockOutVal = stockOutVal + Number(item.out);
        });
        set((state) => ({
          productsIndex: [
            ...state.productsIndex,
            {
              id: product.id,
              code: product.data().code,
              name: product.data().name,
              stockOut: stockOutVal,
              lastInput: `${new Date(product.data().timeStamp.seconds * 1000).toLocaleDateString('in-in', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} Pada Jam ${new Date(product.data().timeStamp.seconds * 1000).toLocaleTimeString('in-in')} Oleh ${
                product.data().lastInput.split('@', 1)[0].charAt(0).toUpperCase() +
                product.data().lastInput.split('@', 1)[0].slice(1)
              }`,
            },
          ],
        }));
      });
    }
    set(() => ({ products: [] }));
    get().productsIndex.forEach(async (product) => {
      if (
        (name !== '' && name === product.data().name) ||
        (name === '' &&
          month !== '' &&
          product.lastInput.toString().toLowerCase().includes(month.toString().toLowerCase()) &&
          product.lastInput
            .toString()
            .toLowerCase()
            .includes(year || yearPrev))
      ) {
        set((state) => ({
          products: [
            ...state.products,
            {
              id: product.id,
              code: product.code,
              name: product.name,
              stockOut: product.stockOut,
              lastInput: product.lastInput,
            },
          ],
        }));
      }
      if (name === '' && month === '') {
        set((state) => ({
          products: [
            ...state.products,
            {
              id: product.id,
              code: product.code,
              name: product.name,
              stockOut: product.stockOut,
              lastInput: product.lastInput,
            },
          ],
        }));
      }
    });
    await delay(2000);
    set(() => ({ loading: false }));
  },
}));
