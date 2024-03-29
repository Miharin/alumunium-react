import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  collection,
  // onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  query,
  orderBy,
  getDocs,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'config/firebaseConfig';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const listProductStore = create(
  persist(
    (set, get) => ({
      loading: true,
      openSnackbar: false,
      snackbarMessage: '',
      latestTime: '',
      listCategories: [],
      listMerk: [],
      listName: [],
      merk: '',
      categories: '',
      editProductId: '',
      listProducts: [],
      configs: {},
      search: '',
      editProduct: {},
      helperCode: '',
      helperCodeName: '',
      editMode: false,
      editProductIcon: false,
      showSearch: false,
      setOpenSnackbar: () => set((state) => ({ openSnackbar: !state.openSnackbar })),
      setEditProduct: (id) => {
        set((state) => ({
          editProduct: { ...state.editProduct, timeStamp: serverTimestamp(), lastInput: getAuth().currentUser.email },
        }));
        const getProducts = get().listProducts;
        const editProductFinal = get().editProduct;
        const getOpenSnackbar = get().setOpenSnackbar;
        getProducts.forEach(async (product) => {
          if (product.id === id) {
            if (editProductFinal.merk === '') {
              delete editProductFinal.merk;
            }
            if (editProductFinal.categories === '') {
              delete editProductFinal.categories;
            }
            if (editProductFinal.code === '') {
              delete editProductFinal.code;
            }
            if (editProductFinal.name === '') {
              delete editProductFinal.name;
            }
            const updateDocument = doc(db, 'listProducts', id);
            set((state) => ({ loading: !state.loading }));
            await updateDoc(updateDocument, editProductFinal);
            set(() => ({ snackbarMessage: `${product.name} Berhasil di Ubah !` }));
            set((state) => ({ loading: !state.loading, editMode: !state.editMode, editProduct: {} }));
            getOpenSnackbar();
          }
        });
      },
      setEdit: (event) =>
        event.name === 'name'
          ? set((state) =>
              event.value.toString().toLowerCase().includes(state.merk.toString().toLowerCase()) &&
              event.value.toString().toLowerCase().includes(state.categories.toString().toLowerCase())
                ? { editProduct: { ...state.editProduct, [event.name]: event.value }, editProductIcon: true }
                : { editProduct: { ...state.editProduct, [event.name]: event.value }, editProductIcon: false }
            )
          : set((state) =>
              event.value !== ''
                ? { editProduct: { ...state.editProduct, [event.name]: event.value }, editProductIcon: true }
                : { editProduct: { ...state.editProduct, [event.name]: event.value }, editProductIcon: false }
            ),
      setCategories: (category) =>
        category !== undefined || null || ''
          ? set((state) => ({ categories: category, loading: !state.loading }))
          : set((state) => ({ categories: '', loading: !state.loading })),
      setMerk: (merkChoose) =>
        merkChoose !== undefined || null || ''
          ? set((state) => ({ merk: merkChoose, loading: !state.loading }))
          : set((state) => ({ merk: '', loading: !state.loading })),
      setProductId: (id) =>
        set((state) => ({
          editProductId: id,
          editProductMode: !state.editProductMode,
          editMode: !state.editMode,
        })),
      setDeleteProduct: async (id) => {
        const getOpenSnackbar = get().setOpenSnackbar;
        await deleteDoc(doc(db, 'listProducts', id));
        set(() => ({ snackbarMessage: `Barang dengan id ${id} Berhasil Dihapus !` }));
        getOpenSnackbar();
      },
      getField: async () => {
        const getData = await getDocs(collection(db, 'configs'));
        if (get().listMerk.length === 0 && get().listCategories.length === 0) {
          getData.forEach((config) => {
            if (config.id === 'ProductCode') {
              const dataCategories = config.data().categories;
              const dataMerk = [];
              for (let a = 0; a < config.data().merk.length; a++) {
                const merks = config.data().merk[a];
                if (merks !== undefined && merks !== '' && merks !== null) {
                  dataMerk.push(merks[0].toUpperCase() + merks.slice(1).toString().toLowerCase());
                }
              }
              set(() => ({
                listCategories: dataCategories,
                listMerk: dataMerk,
              }));
            }
          });
        }
      },
      reset: () => set(() => ({ merk: '', categories: '' })),
      getProducts: async () => {
        const merks = get().merk.toUpperCase();
        const categorieses = get().categories;
        if (get().listProducts.length === 0) {
          const getData = await getDocs(query(collection(db, 'listProducts'), orderBy('timeStamp', 'desc')));
          set(() => ({ listProducts: [] }));
          getData.forEach(async (productData) => {
            set(() => ({
              latestTime: getData.docs[0].data().timeStamp.seconds + 1,
            }));
            if (productData.data().timeStamp !== null) {
              set((state) => ({
                listProductsIndex: [
                  ...state.listProducts,
                  {
                    id: productData.id,
                    code: productData.data().code,
                    categories: productData.data().categories,
                    merk: productData.data().merk,
                    name: productData.data().name,
                    price_1: productData.data().price_1,
                    price_2: productData.data().price_2,
                    price_3: productData.data().price_3,
                    stock: productData.data().stock,
                    stockWarning: productData.data().stockWarning,
                    lastInput: `${new Date(productData.data().timeStamp.seconds * 1000).toLocaleDateString('in-in', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} Pada Jam ${new Date(productData.data().timeStamp.seconds * 1000).toLocaleTimeString(
                      'in-in'
                    )} Oleh ${
                      productData.data().lastInput.split('@', 1)[0].charAt(0).toUpperCase() +
                      productData.data().lastInput.split('@', 1)[0].slice(1)
                    }`,
                  },
                ],
                listProducts: [
                  ...state.listProducts,
                  {
                    id: productData.id,
                    code: productData.data().code,
                    categories: productData.data().categories,
                    merk: productData.data().merk,
                    name: productData.data().name,
                    price_1: productData.data().price_1,
                    price_2: productData.data().price_2,
                    price_3: productData.data().price_3,
                    stock: productData.data().stock,
                    stockWarning: productData.data().stockWarning,
                    lastInput: `${new Date(productData.data().timeStamp.seconds * 1000).toLocaleDateString('in-in', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} Pada Jam ${new Date(productData.data().timeStamp.seconds * 1000).toLocaleTimeString(
                      'in-in'
                    )} Oleh ${
                      productData.data().lastInput.split('@', 1)[0].charAt(0).toUpperCase() +
                      productData.data().lastInput.split('@', 1)[0].slice(1)
                    }`,
                  },
                ],
              }));
            }
          });
        } else {
          const getDataRealTime = await getDocs(
            query(
              collection(db, 'listProducts'),
              where('timeStamp', '>', Timestamp.fromDate(new Date(get().latestTime * 1000)))
            )
          );
          if (getDataRealTime.length > 0) {
            getDataRealTime.forEach((productData) => {
              set((state) => ({
                latestTime: getDataRealTime.docs[0].data().timeStamp.seconds + 1,
                listProductsIndex: [
                  ...state.listProducts,
                  {
                    id: productData.id,
                    code: productData.data().code,
                    categories: productData.data().categories,
                    merk: productData.data().merk,
                    name: productData.data().name,
                    price_1: productData.data().price_1,
                    price_2: productData.data().price_2,
                    price_3: productData.data().price_3,
                    stock: productData.data().stock,
                    stockWarning: productData.data().stockWarning,
                    lastInput: `${new Date(productData.data().timeStamp.seconds * 1000).toLocaleDateString('in-in', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} Pada Jam ${new Date(productData.data().timeStamp.seconds * 1000).toLocaleTimeString(
                      'in-in'
                    )} Oleh ${
                      productData.data().lastInput.split('@', 1)[0].charAt(0).toUpperCase() +
                      productData.data().lastInput.split('@', 1)[0].slice(1)
                    }`,
                  },
                ],
                listProducts: [
                  ...state.listProducts,
                  {
                    id: productData.id,
                    code: productData.data().code,
                    categories: productData.data().categories,
                    merk: productData.data().merk,
                    name: productData.data().name,
                    price_1: productData.data().price_1,
                    price_2: productData.data().price_2,
                    price_3: productData.data().price_3,
                    stock: productData.data().stock,
                    stockWarning: productData.data().stockWarning,
                    lastInput: `${new Date(productData.data().timeStamp.seconds * 1000).toLocaleDateString('in-in', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} Pada Jam ${new Date(productData.data().timeStamp.seconds * 1000).toLocaleTimeString(
                      'in-in'
                    )} Oleh ${
                      productData.data().lastInput.split('@', 1)[0].charAt(0).toUpperCase() +
                      productData.data().lastInput.split('@', 1)[0].slice(1)
                    }`,
                  },
                ],
              }));
            });
          }
          const productList = get().listProductsIndex;
          set(() => ({ listProducts: [] }));
          productList.forEach((productData) => {
            if (
              merks !== '' &&
              categorieses !== '' &&
              merks.toUpperCase() === productData.merk.toUpperCase() &&
              categorieses.toUpperCase() === productData.categories.toUpperCase()
            ) {
              set((state) => ({
                listProducts: [
                  ...state.listProducts,
                  {
                    id: productData.id,
                    code: productData.code,
                    categories: productData.categories,
                    merk: productData.merk,
                    name: productData.name,
                    price_1: productData.price_1,
                    price_2: productData.price_2,
                    price_3: productData.price_3,
                    stock: productData.stock,
                    stockWarning: productData.stockWarning,
                    lastInput: productData.lastInput,
                  },
                ],
              }));
            }
            if (
              categorieses !== '' &&
              categorieses.toUpperCase() === productData.categories.toUpperCase() &&
              merks === ''
            ) {
              set((state) => ({
                listProducts: [
                  ...state.listProducts,
                  {
                    id: productData.id,
                    code: productData.code,
                    categories: productData.categories,
                    merk: productData.merk,
                    name: productData.name,
                    price_1: productData.price_1,
                    price_2: productData.price_2,
                    price_3: productData.price_3,
                    stock: productData.stock,
                    stockWarning: productData.stockWarning,
                    lastInput: productData.lastInput,
                  },
                ],
              }));
            }
            if (merks !== '' && merks.toUpperCase() === productData.merk.toUpperCase() && categorieses === '') {
              set((state) => ({
                listProducts: [
                  ...state.listProducts,
                  {
                    id: productData.id,
                    code: productData.code,
                    categories: productData.categories,
                    merk: productData.merk,
                    name: productData.name,
                    price_1: productData.price_1,
                    price_2: productData.price_2,
                    price_3: productData.price_3,
                    stock: productData.stock,
                    stockWarning: productData.stockWarning,
                    lastInput: productData.lastInput,
                  },
                ],
              }));
            }
            if (merks === '' && categorieses === '') {
              set((state) => ({
                listProducts: [
                  ...state.listProducts,
                  {
                    id: productData.id,
                    code: productData.code,
                    categories: productData.categories,
                    merk: productData.merk,
                    name: productData.name,
                    price_1: productData.price_1,
                    price_2: productData.price_2,
                    price_3: productData.price_3,
                    stock: productData.stock,
                    stockWarning: productData.stockWarning,
                    lastInput: productData.lastInput,
                  },
                ],
              }));
            }
          });
        }
        await delay(1000);
        set(() => ({ loading: false }));
      },
    }),
    {
      name: 'listStorage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
