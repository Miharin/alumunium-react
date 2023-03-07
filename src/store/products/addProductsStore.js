import { create } from 'zustand';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  updateDoc,
  where,
  limit,
  doc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'config/firebaseConfig';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const addProductStore = create((set, get) => ({
  loading: true,
  openSnackbar: false,
  snackbarMessage: '',
  listName: [],
  editProductId: '',
  listProducts: [],
  configs: {},
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
  setOpenSnackbar: () => set((state) => ({ openSnackbar: !state.openSnackbar })),
  setName: (nameChoose, id) => {
    const getProduct = get().listProducts;
    set(() => ({ listProducts: [] }));
    if (nameChoose) {
      getProduct.forEach((product) => {
        if (product.id === id) {
          product.name = nameChoose.label;
          product.code = nameChoose.code;
          product.categories = nameChoose.categories;
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
        set(() =>
          product.code !== '' &&
          product.categories !== '' &&
          product.merk !== '' &&
          product.name !== '' &&
          product.price_1 !== '' &&
          product.price_1.length >= 2 &&
          product.price_2 !== '' &&
          product.price_2.length >= 2 &&
          product.price_3 !== '' &&
          product.price_3.length >= 2 &&
          product.stock !== '' &&
          product.stock.length >= 2
            ? { addProductIcon: true }
            : { addProductIcon: false }
        );
      }
      set((state) => ({ listProducts: [...state.listProducts, product] }));
    });
    get().getProductName();
  },
  setFinalAddProduct: async () => {
    set((state) => ({
      loading: !state.loading,
    }));
    const productAddFinal = get().listProducts;
    // eslint-disable-next-line
    productAddFinal.forEach((product) => {
      product.timeStamp = serverTimestamp();
      product.lastInput = getAuth().currentUser.email;
    });
    const getOpenSnackbar = get().setOpenSnackbar;
    await onSnapshot(collection(db, 'listProducts'), (docId) => {
      const docIdEdit = [];
      docId.forEach((item) => {
        docIdEdit.push({ id: item.id, code: item.data().code, stock: item.data().stock });
      });
      const filter = productAddFinal.filter((product) =>
        // eslint-disable-next-line
        docIdEdit.some((Id) =>
          product.code === Id.code ? (product.stock = (Number(product.stock) + Number(Id.stock)).toString()) : null
        )
      );
      const filterAddData = productAddFinal.filter((product) => docIdEdit.every((Id) => product.code !== Id.code));
      if (filter.length > 0) {
        filter.forEach((product) => {
          const filterData = {
            price_1: product.price_1,
            price_2: product.price_2,
            price_3: product.price_3,
            stock: product.stock,
            lastInput: product.lastInput,
            timeStamp: product.timeStamp,
          };
          console.log(filterData);
        });
      }
      if (filterAddData.length > 0) {
        filterAddData.forEach((product) => {
          const filterAddDataNew = {
            code: product.code,
            categories: product.categories,
            merk: product.merk,
            name: product.name,
            price_1: product.price_1,
            price_2: product.price_2,
            price_3: product.price_3,
            stock: product.stock,
            lastInput: product.lastInput,
            timeStamp: product.timeStamp,
          };
          console.log(filterAddDataNew);
        });
      }
    });

    // await addDoc(collection(db, 'listProducts'), {
    //   code: product.code,
    //   merk: product.merk,
    //   categories: product.categories,
    //   name: product.name,
    //   price_1: product.price_1,
    //   price_2: product.price_2,
    //   price_3: product.price_3,
    //   stock: product.stock,
    //   timeStamp: product.timeStamp,
    //   lastInput: product.lastInput,
    // });
    set(() => ({ snackbarMessage: `${productAddFinal.length} Produk Berhasil Ditambahkan !` }));
    getOpenSnackbar();
    set((state) => ({
      loading: !state.loading,
    }));
  },
  deleteAddProductNew: (id) => {
    const getProduct = get().listProducts;
    set(() => ({ listProducts: [] }));
    const deleteProduct = getProduct.filter((product) => product.id !== id);
    set(() => ({ listProducts: deleteProduct }));
    get().getProductName();
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
        price_1: '',
        price_2: '',
        price_3: '',
        stock: '',
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
  getProductName: async () => {
    await delay(2000);
    // eslint-disable-next-line
    const listProducts = get().listProducts;
    const listCodeProduct = [];
    await onSnapshot(query(collection(db, 'codeProducts'), orderBy('categories')), (codeProducts) => {
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
              label: codes.name,
              merk: codes.merk,
              categories: codes.categories,
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
        ...state.listProducts,
        {
          id: state.editProductId,
          code: state.addProduct.code,
          categories: state.addProduct.categories,
          merk: state.addProduct.merk,
          name: state.addProduct.name,
          price_1: state.addProduct.price_1,
          price_2: state.addProduct.price_2,
          price_3: state.addProduct.price_3,
          stock: state.addProduct.stock,
        },
      ],
    }));
    get().getProductName();
  },
}));
