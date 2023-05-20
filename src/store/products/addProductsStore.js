import { create } from 'zustand';
import {
  collection,
  // onSnapshot,
  addDoc,
  query,
  // orderBy,
  getDocs,
  updateDoc,
  Timestamp,
  arrayUnion,
  doc,
  // limit,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'config/firebaseConfig';
import { orderBy } from 'lodash';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const addProductStore = create((set, get) => ({
  loading: true,
  openSnackbar: false,
  snackbarMessage: '',
  listName: [],
  editProductId: '',
  listProducts: [],
  listCodeProducts: [],
  nameValue: '',
  configs: {},
  date: '',
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
    stockWarning: '',
    lastInput: '',
    timeStamp: '',
  },
  helperCode: '',
  helperCodeName: '',
  addProductMode: false,
  addProductIcon: false,
  setOpenSnackbar: () => set((state) => ({ openSnackbar: !state.openSnackbar })),
  setDate: (event) => set(() => ({ date: event.value })),
  setName: (nameChoose, id) => {
    const getProduct = get().listProducts;
    let name = '';
    if (nameChoose !== null || undefined) {
      // eslint-disable-next-line
      name = nameChoose.name;
    }
    set(() => ({ listProducts: [], nameValue: name }));
    if (nameChoose) {
      getProduct.forEach((product) => {
        if (product.id === id) {
          if (nameChoose === null) {
            console.log(product);
          }
          product.name = nameChoose.label.split(' - ')[1];
          product.code = nameChoose.code;
          product.categories = nameChoose.categories;
          product.merk = nameChoose.merk;
        }
        set((state) => ({ listProducts: [...state.listProducts, product] }));
      });
    } else {
      getProduct.forEach((product) => {
        if (product.id === id) {
          product.name = '';
          product.code = '';
          product.categories = '';
          product.merk = '';
        }
        // console.log(product, id);
        set((state) => ({ listProducts: [...state.listProducts, product] }));
      });
    }
    get().getProductName();
  },
  setAddProduct: (event, id) => {
    const getProduct = get().listProducts;
    getProduct.forEach((product) => {
      if (product.id === id) {
        product[event.name] = event.value;
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
    });
    set(() => ({ listProducts: getProduct }));
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
    const dateFinal = get().date;
    const docId = await getDocs(collection(db, 'listProducts'));
    docId.forEach((item) => {
      docIdEdit.push({ id: item.id, code: item.data().code, stock: item.data().stock });
    });
    const filter = productAddFinal.filter((product) =>
      // eslint-disable-next-line
      docIdEdit.some((Id) =>
        product.code === Id.code
          ? ((product.history = {
              detail: 'Item Masuk',
              date: dateFinal,
              in: product.stock,
              stock: (Number(product.stock) + Number(Id.stock)).toString(),
              out: '0',
              lastInput: product.lastInput,
              timeStamp: product.timeStamp,
            }),
            (product.stock = (Number(product.stock) + Number(Id.stock)).toString()),
            (product.id = Id.id))
          : null
      )
    );
    const filterAddData = productAddFinal.filter((product) => docIdEdit.every((Id) => product.code !== Id.code));
    let TotalProduct = 0;
    if (filter.length > 0) {
      filter.forEach(async (product) => {
        const updateDocument = doc(db, 'listProducts', product.id);
        let filterData = {};
        filterData = {
          ...filterData,
          stock: product.stock,
          stockWarning: product.stockWarning,
          lastInput: product.lastInput,
          timeStamp: product.timeStamp,
          history: arrayUnion(product.history),
        };
        await updateDoc(updateDocument, filterData);
        TotalProduct += 1;
      });
    }
    if (filterAddData.length > 0) {
      filterAddData.forEach(async (product) => {
        if (product.stockWarning !== '') {
          const filterAddDataNew = {
            code: product.code,
            categories: product.categories,
            merk: product.merk,
            name: product.name,
            price_1: product.price_1,
            price_2: product.price_2,
            price_3: product.price_3,
            stock: product.stock,
            stockWarning: product.stockWarning,
            lastInput: product.lastInput,
            timeStamp: product.timeStamp,
            history: [
              {
                in: product.stock,
                lastInput: product.lastInput,
                date: dateFinal,
                timeStamp: product.timeStamp,
                out: '0',
                stock: product.stock,
                detail: 'Item Masuk',
              },
            ],
          };
          await addDoc(collection(db, 'listProducts'), filterAddDataNew);
          TotalProduct += 1;
        } else {
          alert(`Harap isi Peringatan Stock pada ${product.name}`);
        }
      });
    }
    await delay(1000);
    set(() => ({ snackbarMessage: `${TotalProduct} Produk Berhasil Ditambahkan !` }));
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
        price_1: '',
        price_2: '',
        price_3: '',
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
          price_1: state.addProduct.price_1,
          price_2: state.addProduct.price_2,
          price_3: state.addProduct.price_3,
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

    const listCodeProduct = get().listCodeProducts;
    console.log();
    const CodeProductFinal = listCodeProduct.filter((codes) => listProducts.every((list) => list.code !== codes.code));
    set(() => ({ listName: [] }));
    CodeProductFinal.forEach((codes) => {
      set((state) => ({
        listName: [
          ...state.listName,
          {
            code: codes.code,
            label: `${codes.code} - ${codes.name}`,
            merk: codes.merk,
            categories: codes.categories,
            price_1: codes.price_1,
            price_2: codes.price_2,
            price_3: codes.price_3,
          },
        ],
      }));
    });
  },
  getDataCode: async () => {
    const getData = await getDocs(query(collection(db, 'codeProducts')), orderBy('timeStamp', 'desc'));
    getData.forEach((codeProduct) => {
      set((state) => ({ listCodeProducts: [...state.listCodeProducts, codeProduct.data()] }));
    });
    get().getProductName();
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
          price_1: state.addProduct.price_1,
          price_2: state.addProduct.price_2,
          price_3: state.addProduct.price_3,
          stock: state.addProduct.stock,
          stockWarning: state.addProduct.stockWarning,
        },
      ],
    }));
  },
}));
