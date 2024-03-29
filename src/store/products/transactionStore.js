import { create } from 'zustand';
import { collection, query, getDocs, updateDoc, Timestamp, arrayUnion, doc, where, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'config/firebaseConfig';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const transactionStore = create((set, get) => ({
  loading: true,
  openSnackbar: false,
  snackbarMessage: '',
  listName: [],
  editProductId: '',
  nameCus: '',
  listProducts: [],
  listCodeProducts: [],
  selectedPrice: '',
  configs: {},
  total: 0,
  date: '',
  transaction: {
    id: '',
    nameCustomer: '',
    code: '',
    categories: '',
    merk: '',
    disc: '0',
    priceSelect: '',
    name: '',
    qty: '0',
    price: '',
    subtotal: '0',
  },
  helperCode: '',
  helperCodeName: '',
  transactionMode: false,
  transactionIcon: false,
  setDate: (event) => set(() => ({ date: event.value })),
  setPriceSelection: (id, value) => {
    const getProduct = get().listProducts;
    set(() => ({ listProducts: [] }));
    getProduct.forEach(async (product) => {
      if (product.id === id) {
        product.priceSelect = value.id;
        product.labelPrice = value.label;
        product.price = product[product.priceSelect];
      }
      set((state) => ({ listProducts: [...state.listProducts, product] }));
    });
  },
  setOpenSnackbar: () => set((state) => ({ openSnackbar: !state.openSnackbar })),
  setName: (nameChoose, id) => {
    const getProduct = get().listProducts;
    if (nameChoose) {
      set(() => ({ listProducts: [] }));
      getProduct.forEach(async (product) => {
        if (product.id === id) {
          product.nameCustomer = get().nameCus;
          product.name = nameChoose.label.split(' - ')[1];
          product.code = nameChoose.code;
          product.categories = nameChoose.categories;
          product.merk = nameChoose.merk;
          product.price_1 = nameChoose.price_1;
          product.price_2 = nameChoose.price_2;
          product.price_3 = nameChoose.price_3;
        }
        set((state) => ({ listProducts: [...state.listProducts, product] }));
        get().getProductName();
      });
    } else {
      set(() => ({ listProducts: [] }));
      getProduct.forEach(async (product) => {
        if (product.id === id) {
          product.nameCustomer = '';
          product.name = '';
          product.code = '';
          product.categories = '';
          product.merk = '';
        }
        set((state) => ({ listProducts: [...state.listProducts, product] }));
        get().getProductName();
      });
    }
  },
  getDataCode: async (nameChoose) => {
    let getData = {};
    const getFromName = await getDocs(
      query(
        collection(db, 'listProducts'),
        where('name', '>=', nameChoose),
        where('name', '<', `${nameChoose}z`),
        limit(10)
      )
    );
    const getFromCode = await getDocs(
      query(
        collection(db, 'listProducts'),
        where('code', '>=', nameChoose),
        where('code', '<', `${nameChoose}z`),
        limit(10)
      )
    );
    if (getFromName.docs.length === 0) {
      getData = getFromCode;
    } else {
      getData = getFromName;
    }
    set(() => ({ listCodeProducts: [] }));
    getData.forEach((codeProduct) => {
      set((state) => ({ listCodeProducts: [...state.listCodeProducts, codeProduct.data()] }));
    });
    get().getProductName();
  },
  setTransaction: (event, id) => {
    set(() => ({ total: 0 }));
    let totalPrice = 0;
    const getProduct = get().listProducts;
    set(() => ({ listProducts: [] }));
    getProduct.forEach(async (product) => {
      if (event.name === 'nameCustomer') {
        product[event.name] = event.value;
        set(() => ({ nameCus: event.value }));
      }
      if (product.id === id) {
        product[event.name] = event.value;
        if (event.name === 'qty' || event.name === 'disc') {
          product.subtotal =
            (event.name === 'qty' ? event.value : product.qty) * (product.price - Number(product.disc));
        }
        if (event.name === 'disc2') {
          product.subtotal -= Number(event.value);
        }
      }
      totalPrice +=
        event.name === 'disc2' && event.value !== ''
          ? product.subtotal - Number(event.value)
          : Number(product.subtotal);
      const productRules =
        product.nameCustomer !== '' &&
        product.code !== '' &&
        product.categories !== '' &&
        product.merk !== '' &&
        product.name !== '' &&
        product.qty !== '';
      set(() => (productRules ? { transactionIcon: true } : { transactionIcon: false }));
      set((state) => ({ listProducts: [...state.listProducts, product] }));
    });
    set(() => ({ total: totalPrice }));
  },
  setFinalTransaction: async () => {
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
    const dateFinal = get().date;
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
              detail: 'Barang Keluar',
              date: dateFinal,
              nameCustomer: product.nameCustomer,
              total: product.subtotal,
              out: product.qty,
              stock: (Number(Id.stock) - Number(product.qty)).toString(),
              in: '0',
              disc: product.disc,
              priceSelect: product.priceSelect,
              lastInput: product.lastInput,
              timeStamp: product.timeStamp,
            }),
            (product.stock = (Number(Id.stock) - Number(product.qty)).toString()),
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
          stock: product.stock,
          lastInput: product.lastInput,
          timeStamp: product.timeStamp,
          history: arrayUnion(product.history),
        };
        await updateDoc(updateDocument, filterData);
        TotalProduct += 1;
      });
    }
    await delay(1000);
    set(() => ({ snackbarMessage: `${TotalProduct} Produk Berhasil Transaksi !` }));
    getOpenSnackbar();
    get().getProducts();
  },
  deleteTransactionNew: (id) => {
    const getProduct = get().listProducts;
    set(() => ({ listProducts: [] }));
    const deleteProduct = getProduct.filter((product) => product.id !== id);
    let totalPrice = 0;
    deleteProduct.forEach((product) => {
      totalPrice += product.subtotal;
      const productRules =
        product.nameCustomer !== '' &&
        product.code !== '' &&
        product.categories !== '' &&
        product.merk !== '' &&
        product.name !== '' &&
        product.stock !== '';
      set(() => (productRules ? { transactionIcon: true } : { transactionIcon: false }));
    });
    set(() => ({ total: totalPrice }));
    set(() => ({ listProducts: deleteProduct }));
    get().getProductName();
  },
  setTransactionMode: () => {
    const getProduct = get().listProducts[get().listProducts.length - 1];
    set(() => ({
      editProductId: getProduct.id + 1,
      transactionIcon: false,
    }));
    set(() => ({
      transaction: {
        id: '',
        nameCustomer: '',
        code: '',
        categories: '',
        merk: '',
        priceSelect: '',
        name: '',
        qty: '0',
        disc: '0',
        price: '',
        subtotal: '0',
      },
    }));
    set((state) => ({
      listProducts: [
        ...state.listProducts,
        {
          id: state.editProductId,
          nameCustomer: state.transaction.nameCustomer,
          code: state.transaction.code,
          categories: state.transaction.categories,
          merk: state.transaction.merk,
          name: state.transaction.name,
          qty: state.transaction.qty,
          priceSelect: state.transaction.priceSelect,
          disc: state.transaction.disc,
          price: state.transaction.price,
          subtotal: state.transaction.subtotal,
        },
      ],
    }));
  },
  getProductName: async () => {
    // eslint-disable-next-line
    const listProduct = get().listProducts;
    const listCodeProduct = get().listCodeProducts;
    const CodeProductFinal = listCodeProduct.filter((codes) => listProduct.every((list) => list.code !== codes.code));
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
  getProducts: async () => {
    set((state) => ({
      editProductId: state.listProducts.length,
    }));
    set((state) => ({
      transactionMode: true,
      loading: false,
      listProducts: [
        {
          id: state.editProductId,
          nameCustomer: state.transaction.name,
          code: state.transaction.code,
          categories: state.transaction.categories,
          merk: state.transaction.merk,
          name: state.transaction.name,
          qty: state.transaction.qty,
          priceSelect: state.transaction.priceSelect,
          disc: state.transaction.disc,
          price: state.transaction.price,
          subtotal: state.transaction.subtotal,
        },
      ],
    }));
  },
}));
