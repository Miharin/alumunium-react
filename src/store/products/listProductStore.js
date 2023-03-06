import { create } from 'zustand';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'config/firebaseConfig';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const listProductStore = create((set, get) => ({
  loading: true,
  openSnackbar: false,
  snackbarMessage: '',
  listCategories: [],
  listMerk: [],
  listName: [],
  codeNew: '',
  name: '',
  merk: '',
  categories: '',
  editProductId: '',
  listProducts: [],
  configs: {},
  search: '',
  editProduct: {},
  addProduct: {
    id: '',
    code: '',
    categories: '',
    merk: '',
    name: '',
    price_1: '',
    price_2: '',
    price_3: '',
    stock: '',
    lastInput: '',
    timeStamp: '',
  },
  helperCode: '',
  helperCodeName: '',
  addProductMode: false,
  addProductIcon: false,
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
  setName: (nameChoose) => {
    const categorieses = get().categories;
    const merks = get().merk.toUpperCase();
    if (nameChoose !== undefined || null || '') {
      set((state) => ({
        name: nameChoose.label,
        codeNew: nameChoose.code,
        addProduct: {
          ...state.addProduct,
          name: nameChoose.label,
          code: nameChoose.code,
          categories: categorieses,
          merk: merks,
        },
      }));
    } else {
      set(() => ({ name: '' }));
    }
  },
  setAddProduct: (event) => {
    set((state) => ({ addProduct: { ...state.addProduct, [event.name]: event.value } }));
    console.log(get().addProduct);
    set((state) =>
      state.addProduct.code !== '' &&
      state.addProduct.categories !== '' &&
      state.addProduct.merk !== '' &&
      state.addProduct.name !== '' &&
      state.addProduct.price_1 !== '' &&
      state.addProduct.price_2 !== '' &&
      state.addProduct.price_3 !== '' &&
      state.addProduct.stock !== ''
        ? { addProductIcon: true }
        : { addProductIcon: false }
    );
  },
  setFinalAddProduct: async () => {
    set((state) => ({
      addProduct: { ...state.addProduct, timeStamp: serverTimestamp(), lastInput: getAuth().currentUser.email },
      loading: !state.loading,
    }));
    const productAddFinal = get().addProduct;
    const listProduct = get().listProducts;
    const getOpenSnackbar = get().setOpenSnackbar;
    delete productAddFinal.id;
    listProduct.forEach((product) => {
      /* eslint-disable */
      if (product.name === productAddFinal.name && product.code === productAddFinal.code) {
        set(() => ({ helperCodeName: product.name + ' Sudah Ada !', helperCode: product.code + ' Sudah Ada !' }));
      } else if (product.code === productAddFinal.code) {
        set(() => ({ helperCode: product.code + ' Sudah Ada !' }));
      } else if (product.name === productAddFinal.name) {
        set(() => ({ helperCodeName: product.name + ' Sudah Ada !' }));
      }
    });
    /* eslint-disable */
    const helperCodeName = get().helperCodeName;
    const helperCode = get().helperCode;
    if (helperCode === '' || helperCodeName === '' || (helperCode === '' && helperCodeName === '')) {
      await addDoc(collection(db, 'listProducts'), productAddFinal);
      set(() => ({ snackbarMessage: `${productAddFinal.name} Berhasil Ditambahkan !` }));
      set((state) => ({
        addProduct: {
          id: '',
          code: '',
          categories: '',
          merk: '',
          name: '',
          price_1: '',
          price_2: '',
          price_3: '',
          stock: '',
          timeStamp: '',
          lastInput: '',
        },
        addProductMode: !state.addProductMode,
        loading: !state.loading,
      }));
      getOpenSnackbar();
    }
  },
  setProductId: (id) =>
    set((state) => ({
      editProductId: id,
      editProductMode: !state.editProductMode,
      editMode: !state.editMode,
    })),
  deleteAddProductNew: () => {
    const productDelete = get().listProduct;
    productDelete.pop();
    set((state) => ({ addCodeProductMode: !state.addCodeProductMode }));
  },
  setAddProductMode: () => {
    set((state) => ({
      addProductMode: !state.addProductMode,
      editProductId: state.addProduct.id,
      listProducts: [
        ...state.listProducts,
        {
          id: state.addProduct.id,
          code: state.addProduct.code,
          categories: state.addProduct.categories,
          merk: state.addProduct.merk,
          name: state.addProduct.name,
          price_1: state.addProduct.price_1,
          price_2: state.addProduct.price_2,
          price_3: state.addProduct.price_3,
          stock: state.addProduct.stock,
          timeStamp: state.addProduct.timeStamp,
          lastInput: state.addProduct.lastInput,
        },
      ],
    }));
  },
  setDeleteProduct: async (id) => {
    const getOpenSnackbar = get().setOpenSnackbar;
    await deleteDoc(doc(db, 'listProducts', id));
    set(() => ({ snackbarMessage: `Barang dengan id ${id} Berhasil Dihapus !` }));
    getOpenSnackbar();
  },
  getField: async () => {
    const merks = get().merk.toUpperCase();
    const categorieses = get().categories;
    await onSnapshot(collection(db, 'configs'), (configsData) => {
      configsData.forEach((config) => {
        if (config.id === 'ProductCode') {
          const dataCategories = config.data().categories;
          const dataMerk = [];
          for (let a = 0; a < config.data().merk.length; a++) {
            const merks = config.data().merk[a];
            dataMerk.push(merks[0].toUpperCase() + merks.slice(1).toString().toLowerCase());
          }
          set(() => ({
            listCategories: dataCategories,
            listMerk: dataMerk,
          }));
        }
      });
    });
  },
  getProductName: async () => {
    const merks = get().merk.toUpperCase();
    const categorieses = get().categories;
    const codename = get().name;
    await delay(2000);
    let listProducts = get().listProducts;
    let listCodeProduct = [];
    await onSnapshot(query(collection(db, 'codeProducts'), orderBy('categories')), (codeProducts) => {
      codeProducts.forEach((codeProduct) => {
        listCodeProduct.push(codeProduct.data());
      });
      const CodeProductFinal = listCodeProduct.filter((code) => listProducts.every((list) => list.code !== code.code));
      set((state) => ({ listName: [] }));
      CodeProductFinal.forEach((codes) => {
        if (merks !== '' && categorieses !== '' && merks === codes.merk && categorieses === codes.categories) {
          set((state) => ({
            listName: [
              ...state.listName,
              {
                code: codes.code,
                label: codes.name,
              },
            ],
          }));
        }
        if (categorieses !== '' && categorieses === codes.categories && merks === '') {
          set((state) => ({
            listName: [
              ...state.listName,
              {
                code: codes.code,
                label: codes.name,
              },
            ],
          }));
        }
        if (merks !== '' && merks === codes.merk && categorieses === '') {
          set((state) => ({
            listName: [
              ...state.listName,
              {
                code: codes.code,
                label: codes.name,
              },
            ],
          }));
        }
        if (merks === '' && categorieses === '') {
          set((state) => ({
            listName: [
              ...state.listName,
              {
                code: codes.code,
                label: codes.name,
              },
            ],
          }));
        }
      });
    });
  },
  getProducts: async () => {
    const merks = get().merk.toUpperCase();
    const categorieses = get().categories;
    await onSnapshot(query(collection(db, 'listProducts'), orderBy('categories')), (listProduct) => {
      set(() => ({ listProducts: [] }));
      listProduct.forEach(async (productData) => {
        if (productData.data().timeStamp !== null) {
          if (
            merks !== '' &&
            categorieses !== '' &&
            merks === productData.data().merk &&
            categorieses === productData.data().categories
          ) {
            set((state) => ({
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
          if (categorieses !== '' && categorieses === productData.data().categories && merks === '') {
            set((state) => ({
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
          if (merks !== '' && merks === productData.data().merk && categorieses === '') {
            set((state) => ({
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
          if (merks === '' && categorieses === '') {
            set((state) => ({
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
        }
      });
    });
    get().getProductName();
    await delay(1000);
    set((state) => ({ loading: !state.loading }));
  },
}));
