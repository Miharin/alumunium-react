import { create } from 'zustand';
import {
  collection,
  onSnapshot,
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

export const returnStore = create((set, get) => ({
  loading: true,
  openSnackbar: false,
  snackbarMessage: '',
  listName: [],
  editProductId: '',
  selectedName: '',
  selectedTime: '',
  nameCus: '',
  listProducts: [],
  listNameCustomer: [],
  listTimeCustomer: [],
  selectedPrice: '',
  configs: {},
  total: 0,
  transaction: {
    id: '',
    nameCustomer: '',
    code: '',
    categories: '',
    merk: '',
    disc: '10',
    name: '',
    qty: '',
    price: '',
    subtotal: '0',
  },
  helperCode: '',
  helperCodeName: '',
  transactionMode: false,
  transactionIcon: false,
  setPriceSelection: async (nameSelect) => {
    if (nameSelect !== '' || null || undefined) {
      set(() => ({ selectedName: nameSelect.label }));
    }
    get().getProductName();
  },
  setTimeSelection: async (timeSelect) => {
    if (timeSelect !== '' || null || undefined) {
      set(() => ({ selectedTime: timeSelect.label }));
    }
    get().getProductName();
  },
  setOpenSnackbar: () => set((state) => ({ openSnackbar: !state.openSnackbar })),
  setName: (nameChoose, id) => {
    const getProduct = get().listProducts;
    // const selectedPriceValue = get().selectedPrice;
    set(() => ({ listProducts: [] }));
    if (nameChoose) {
      getProduct.forEach(async (product) => {
        if (product.id === id) {
          product.name = nameChoose.label;
          product.code = nameChoose.code;
          product.categories = nameChoose.categories;
          product.merk = nameChoose.merk;
        }
        get().listName.forEach((list) => {
          if (product.code === list.code) {
            product.priceSelect = list.priceSelect;
          }
        });
        await onSnapshot(query(collection(db, 'listProducts'), orderBy('categories')), (listProducts) => {
          listProducts.forEach((priceValue) => {
            if (product.code === priceValue.data().code) {
              priceValue.data().history.forEach((history) => {
                const time = `${new Date(history.timeStamp.seconds * 1000).toLocaleDateString('in-in', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} Pada Jam ${new Date(history.timeStamp.seconds * 1000).toLocaleTimeString('in-in')} Oleh ${
                  history.lastInput.split('@', 1)[0].charAt(0).toUpperCase() +
                  history.lastInput.split('@', 1)[0].slice(1)
                }`;
                if (history.nameCustomer === get().selectedName && time === get().selectedTime) {
                  product.price = priceValue.data()[product.priceSelect] * history.out;
                  product.discPrice = priceValue.data()[product.priceSelect];
                  product.qtyMax = history.out;
                }
              });
            }
          });
        });
        set((state) => ({ listProducts: [...state.listProducts, product] }));
        get().getProductName();
      });
    } else {
      const productFinal = getProduct.filter((product) => product.id !== id);
      set(() => ({ listProducts: productFinal }));
      get().getProducts();
    }
  },
  setTransaction: (event, id) => {
    set(() => ({ total: 0 }));
    const getProduct = get().listProducts;
    let totalPrice = get().total;
    set(() => ({ listProducts: [] }));
    getProduct.forEach((product) => {
      if (event.name === 'nameCustomer') {
        product[event.name] = event.value;
        set(() => ({ nameCus: event.value }));
      }
      if (product.id === id) {
        product.nameCustomer = get().selectedName;
        product[event.name] = event.value;
        if (event.name === 'qty' || event.name === 'disc') {
          if (event.name === 'qty' && event.value > product.qtyMax) {
            product.qty = product.qtyMax;
          } else {
            product.qty = event.value;
          }
          product.subtotal =
            product.qty * product.discPrice * (product.disc === '0' ? 0.1 : Number(product.disc) / 100);
          totalPrice += product.subtotal;
        }
      }
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
              detail: 'Retur',
              nameCustomer: product.nameCustomer,
              total: product.subtotal,
              out: '0',
              stock: (Number(Id.stock) + Number(product.qty)).toString(),
              in: product.qty,
              return: `${product.disc}%`,
              lastInput: product.lastInput,
              timeStamp: product.timeStamp,
            }),
            (product.stock = (Number(Id.stock) + Number(product.qty)).toString()),
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
    set(() => ({ snackbarMessage: `${TotalProduct} Produk Berhasil Ditambahkan !` }));
    getOpenSnackbar();
    get().getProducts();
  },
  deletetransactionNew: (id) => {
    const getProduct = get().listProducts;
    set(() => ({ listProducts: [] }));
    const deleteProduct = getProduct.filter((product) => product.id !== id);
    deleteProduct.forEach((product) => {
      const productRules =
        product.nameCustomer !== '' &&
        product.code !== '' &&
        product.categories !== '' &&
        product.merk !== '' &&
        product.name !== '' &&
        product.stock !== '';
      set(() => (productRules ? { transactionIcon: true } : { transactionIcon: false }));
    });
    set(() => ({ listProducts: deleteProduct }));
  },
  setTransactionMode: () => {
    set((state) => ({
      editProductId: state.listProducts.length,
      transactionIcon: false,
    }));
    set(() => ({
      transaction: {
        id: '',
        nameCustomer: '',
        code: '',
        categories: '',
        merk: '',
        name: '',
        qty: '',
        disc: '10',
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
          disc: state.transaction.disc,
          price: state.transaction.price,
          subtotal: state.transaction.subtotal,
        },
      ],
    }));
  },
  getProductName: async () => {
    /* eslint-disable */
    const selectedTime = get().selectedTime;
    const selectedName = get().selectedName;
    const listProduct = get().listProducts;
    /* eslint-disable */
    const listCodeProduct = [];
    await onSnapshot(query(collection(db, 'listProducts'), orderBy('categories')), (codeProducts) => {
      codeProducts.forEach((codeProduct) => {
        listCodeProduct.push(codeProduct.data());
      });
      const CodeProductFinal = listCodeProduct.filter((codes) => listProduct.every((list) => list.code !== codes.code));
      set(() => ({ listName: [], listNameCustomer: [], listTimeCustomer: [] }));
      CodeProductFinal.forEach((codes) => {
        codes.history.forEach((code) => {
          if (code.detail === 'Penjualan Kasir') {
            if (get().listNameCustomer.length > 0) {
              get().listNameCustomer.forEach((list) => {
                if (list.label !== code.nameCustomer) {
                  set((state) => ({
                    listNameCustomer: [
                      ...state.listNameCustomer,
                      { key: codes.code + code.timeStamp.seconds, label: code.nameCustomer },
                    ],
                  }));
                }
              });
            } else {
              set((state) => ({
                listNameCustomer: [
                  ...state.listNameCustomer,
                  { key: codes.code + code.timeStamp.seconds, label: code.nameCustomer },
                ],
              }));
            }
            if (selectedTime !== '' && selectedName !== '') {
              const time = `${new Date(code.timeStamp.seconds * 1000).toLocaleDateString('in-in', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} Pada Jam ${new Date(code.timeStamp.seconds * 1000).toLocaleTimeString('in-in')} Oleh ${
                code.lastInput.split('@', 1)[0].charAt(0).toUpperCase() + code.lastInput.split('@', 1)[0].slice(1)
              }`;
              if (time === selectedTime && code.nameCustomer === selectedName) {
                set((state) => ({
                  listName: [
                    ...state.listName,
                    {
                      code: codes.code,
                      label: codes.name,
                      merk: codes.merk,
                      categories: codes.categories,
                      priceSelect: code.priceSelect,
                      total: code.total,
                    },
                  ],
                }));
              }
            }
            set((state) => ({
              listTimeCustomer: [
                ...state.listTimeCustomer,
                {
                  key: codes.code + code.timeStamp.seconds,
                  label: `${new Date(code.timeStamp.seconds * 1000).toLocaleDateString('in-in', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })} Pada Jam ${new Date(code.timeStamp.seconds * 1000).toLocaleTimeString('in-in')} Oleh ${
                    code.lastInput.split('@', 1)[0].charAt(0).toUpperCase() + code.lastInput.split('@', 1)[0].slice(1)
                  }`,
                },
              ],
            }));
          }
        });
      });
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
          disc: state.transaction.disc,
          price: state.transaction.price,
          subtotal: state.transaction.subtotal,
        },
      ],
    }));
    get().getProductName();
  },
}));
