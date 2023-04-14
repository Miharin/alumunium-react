import { create } from 'zustand';
import {
  collection,
  onSnapshot,
  //   addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  Timestamp,
  arrayUnion,
  doc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'config/firebaseConfig';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const stockOpnameStore = create((set, get) => ({
  loading: true,
  openSnackbar: false,
  snackbarMessage: '',
  listName: [],
  editProductId: '',
  listProducts: [],
  nameValue: '',
  configs: {},
  addProduct: {
    id: '',
    code: '',
    categories: '',
    merk: '',
    name: '',
    stock: '',
    stockWarning: '',
    lastInput: '',
    timeStamp: '',
  },
  helperCode: '',
  helperCodeName: '',
  addProductMode: false,
  addProductIcon: false,
  setOpenSnackbar: () => set((state) => ({ openSnackbar: !state.openSnackbar })),
  setName: (nameChoose, id) => {
    const getProduct = get().listProducts;
    set(() => ({ listProducts: [], nameValue: nameChoose.name }));
    if (nameChoose) {
      getProduct.forEach((product) => {
        if (product.id === id) {
          product.name = nameChoose.name;
          product.code = nameChoose.code;
          product.categories = nameChoose.categories;
          product.stock = nameChoose.stock;
          product.merk = nameChoose.merk;
        }
        set((state) => ({ listProducts: [...state.listProducts, product] }));
      });
      get().getProductName();
    } else {
      const productFinal = getProduct.filter((product) => product.id !== id);
      set(() => ({ listProducts: productFinal }));
      get().getProducts();
    }
  },
  setAddProduct: (event, id) => {
    const getProduct = get().listProducts;
    set(() => ({ listProducts: [] }));
    getProduct.forEach((product) => {
      if (product.id === id) {
        product[event.name] = event.value;
        const diff = product.stock - product.stockWarning;
        product.diff = diff < 0 ? `+${Math.abs(diff)}` : `-${diff}`;
        const productRules =
          product.code !== '' &&
          product.categories !== '' &&
          product.merk !== '' &&
          product.name !== '' &&
          product.stock !== '';
        set(() =>
          productRules ||
          (productRules && product.price_1 !== '' && product.price_1.length >= 2) ||
          (productRules && product.price_2 !== '' && product.price_2.length >= 2) ||
          (productRules && product.price_3 !== '' && product.price_3.length >= 2)
            ? { addProductIcon: true }
            : { addProductIcon: false }
        );
      }
      set((state) => ({ listProducts: [...state.listProducts, product] }));
    });
  },
  setFinalAddProduct: async () => {
    set((state) => ({
      loading: !state.loading,
    }));
    const timestamp = Timestamp.now();
    const productAddFinal = get().listProducts;
    // eslint-disable-next-line
    productAddFinal.forEach((product) => {
      product.timeStamp = timestamp;
      product.lastInput = getAuth().currentUser.email;
    });
    const getOpenSnackbar = get().setOpenSnackbar;
    const docIdEdit = [];
    const docId = await getDocs(collection(db, 'listProducts'));
    docId.forEach((item) => {
      docIdEdit.push({ id: item.id, code: item.data().code, stock: item.data().stock });
    });
    const filter = productAddFinal.filter((product) =>
      // eslint-disable-next-line
      docIdEdit.some((Id) =>
        product.code === Id.code
          ? ((product.history = {
              detail: 'Stok Opname',
              out: product.diff < 0 ? product.diff.toString().split('-')[1] : '0',
              in: product.diff < 0 ? '0' : product.diff.toString().split('+')[1],
              stock: product.stockWarning,
              lastInput: product.lastInput,
              timeStamp: product.timeStamp,
            }),
            (product.stock = product.stockWarning),
            (product.id = Id.id))
          : null
      )
    );
    let TotalProduct = 0;
    if (filter.length > 0) {
      filter.forEach(async (product) => {
        const updateDocument = doc(db, 'listProducts', product.id);
        let filterData = {};
        filterData = {
          ...filterData,
          stock: product.stock,
          lastInput: product.lastInput,
          timeStamp: product.timeStamp,
          history: arrayUnion(product.history),
        };
        console.log(filterData);
        await updateDoc(updateDocument, filterData);
        TotalProduct += 1;
      });
    }
    await delay(1000);
    set(() => ({
      snackbarMessage: `${TotalProduct} Produk Berhasil Ditambahkan !`,
      nameValue: '',
      addProductIcon: false,
    }));
    getOpenSnackbar();
    get().getProducts();
  },
  deleteAddProductNew: (id) => {
    const getProduct = get().listProducts;
    set(() => ({ listProducts: [] }));
    const deleteProduct = getProduct.filter((product) => product.id !== id);
    deleteProduct.forEach((product) => {
      const productRules =
        product.code !== '' &&
        product.categories !== '' &&
        product.merk !== '' &&
        product.name !== '' &&
        product.stock !== '';
      set(() =>
        productRules ||
        (productRules && product.price_1 !== '' && product.price_1.length >= 2) ||
        (productRules && product.price_2 !== '' && product.price_2.length >= 2) ||
        (productRules && product.price_3 !== '' && product.price_3.length >= 2)
          ? { addProductIcon: true }
          : { addProductIcon: false }
      );
    });
    set(() => ({ listProducts: deleteProduct, nameValue: '' }));
  },
  setAddProductMode: () => {
    set((state) => ({
      editProductId: state.listProducts.length,
      addProductIcon: false,
    }));
    set(() => ({
      addProduct: {
        id: '',
        code: '',
        categories: '',
        merk: '',
        name: '',
        stock: '',
        stockWarning: '',
        timeStamp: '',
        lastInput: '',
      },
    }));
    set((state) => ({
      listProducts: [
        ...state.listProducts,
        {
          id: state.editProductId,
          code: state.addProduct.code,
          categories: state.addProduct.categories,
          merk: state.addProduct.merk,
          name: state.addProduct.name,
          stock: state.addProduct.stock,
          stockWarning: state.addProduct.stockWarning,
          timeStamp: state.addProduct.timeStamp,
          lastInput: state.addProduct.lastInput,
        },
      ],
    }));
  },
  getProductName: async () => {
    // eslint-disable-next-line
    const listProducts = get().listProducts;
    const listCodeProduct = [];
    await onSnapshot(query(collection(db, 'listProducts'), orderBy('categories')), (codeProducts) => {
      codeProducts.forEach((codeProduct) => {
        listCodeProduct.push(codeProduct.data());
      });
      const CodeProductFinal = listCodeProduct.filter((code) => listProducts.every((list) => list.code !== code.code));
      set(() => ({ listName: [] }));
      CodeProductFinal.forEach((codes) => {
        set((state) => ({
          listName: [
            ...state.listName,
            {
              code: codes.code,
              name: codes.name,
              label: `${codes.code} - ${codes.name}`,
              merk: codes.merk,
              categories: codes.categories,
              stock: codes.stock,
            },
          ],
        }));
      });
    });
  },
  getProducts: async () => {
    set((state) => ({
      editProductId: state.listProducts.length,
    }));
    set((state) => ({
      addProductMode: true,
      loading: false,
      listProducts: [
        {
          id: state.editProductId,
          code: state.addProduct.code,
          categories: state.addProduct.categories,
          merk: state.addProduct.merk,
          name: state.addProduct.name,
          stock: state.addProduct.stock,
          stockWarning: state.addProduct.stockWarning,
        },
      ],
    }));
    get().getProductName();
  },
}));
