import { create } from 'zustand';
import { collection, query, getDocs, updateDoc, Timestamp, arrayUnion, doc, where, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'config/firebaseConfig';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const mutationStore = create((set, get) => ({
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
    codeBox: '',
    codePack: '',
    nameBox: '',
    namePack: '',
    qtyBox: '0',
    qtyBoxPack: '0',
    totalPackConvert: '',
    totalPackIn: '',
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
  setName: (nameChoose, id, name) => {
    const getProduct = get().listProducts;
    if (nameChoose) {
      set(() => ({ listProducts: [] }));
      getProduct.forEach(async (product) => {
        if (product.id === id) {
          if (name === 'nameBox') {
            product.codeBox = nameChoose.code;
            product.nameBox = nameChoose.label.split(' - ')[1];
          } else if (name === 'namePack') {
            product.codePack = nameChoose.code;
            product.namePack = nameChoose.label.split(' - ')[1];
          }
        }
        set((state) => ({ listProducts: [...state.listProducts, product] }));
        get().getProductName();
      });
    } else {
      set(() => ({ listProducts: [] }));
      getProduct.forEach(async (product) => {
        if (product.id === id) {
          product.codeBox = '';
          product.codePack = '';
          product.nameBox = '';
          product.codePack = '';
          set((state) => ({ listProducts: [...state.listProducts, product] }));
          get().getProductName();
        }
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
    const getProduct = get().listProducts;
    set(() => ({ listProducts: [] }));
    getProduct.forEach(async (product) => {
      if (product.id === id) {
        product[event.name] = event.value;
        if (product.qtyBox !== '0' || product.qtyBoxPack !== '0') {
          const total = product.qtyBox * product.qtyBoxPack;
          product.totalPackConvert = total;
          product.totalPackIn = total;
        }
      }
      const productRules =
        product.codeBox !== '' &&
        product.codePack !== '' &&
        product.nameBox !== '' &&
        product.namePack !== '' &&
        product.qtyBox !== '0' &&
        product.qtyBoxPack !== '0' &&
        product.totalPackConvert !== '' &&
        product.totalPackIn !== '';
      set(() => (productRules ? { transactionIcon: true } : { transactionIcon: false }));
      set((state) => ({ listProducts: [...state.listProducts, product] }));
    });
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
    productAddFinal.forEach(async (product) => {
      const getDocBox = await getDocs(
        query(collection(db, 'listProducts'), where('name', '==', product.nameBox), limit(1))
      );
      console.log(getDocBox);
    });
    // const docIdEdit = [];
    // const docId = await getDocs(collection(db, 'listProducts'));
    // docId.forEach((item) => {
    //   docIdEdit.push({ id: item.id, code: item.data().code, stock: item.data().stock });
    // });
    // const filter = productAddFinal.filter((product) =>
    //   // eslint-disable-next-line
    //   docIdEdit.some((Id) =>
    //     product.code === Id.code
    //       ? ((product.history = {
    //           detail: 'Barang Keluar',
    //           date: dateFinal,
    //           nameCustomer: product.nameCustomer,
    //           total: product.subtotal,
    //           out: product.qty,
    //           stock: (Number(Id.stock) - Number(product.qty)).toString(),
    //           in: '0',
    //           disc: product.disc,
    //           priceSelect: product.priceSelect,
    //           lastInput: product.lastInput,
    //           timeStamp: product.timeStamp,
    //         }),
    //         (product.stock = (Number(Id.stock) - Number(product.qty)).toString()),
    //         (product.id = Id.id))
    //       : null
    //   )
    // );
    // let TotalProduct = 0;
    // if (filter.length > 0) {
    //   filter.forEach(async (product) => {
    //     const updateDocument = doc(db, 'listProducts', product.id);
    //     let filterData = {};
    //     filterData = {
    //       stock: product.stock,
    //       lastInput: product.lastInput,
    //       timeStamp: product.timeStamp,
    //       history: arrayUnion(product.history),
    //     };
    //     await updateDoc(updateDocument, filterData);
    //     TotalProduct += 1;
    //   });
    // }
    await delay(1000);
    set(() => ({ snackbarMessage: ` Produk Berhasil Transaksi !` }));
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
        codeBox: '',
        codePack: '',
        nameBox: '',
        namePack: '',
        qtyBox: '0',
        qtyBoxPack: '',
        totalPackConvert: '',
        totalPackIn: '',
      },
    }));
    set((state) => ({
      listProducts: [
        ...state.listProducts,
        {
          id: state.editProductId,
          codeBox: state.transaction.codeBox,
          codePack: state.transaction.codePack,
          nameBox: state.transaction.nameBox,
          namePack: state.transaction.namePack,
          qtyBox: state.transaction.qtyBox,
          qtyBoxPack: state.transaction.qtyBox,
          totalPackConvert: state.transaction.totalPackConvert,
          totalPackIn: state.transaction.totalPackIn,
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
          codeBox: state.transaction.codeBox,
          codePack: state.transaction.codePack,
          nameBox: state.transaction.nameBox,
          namePack: state.transaction.namePack,
          qtyBox: state.transaction.qtyBox,
          qtyBoxPack: state.transaction.qtyBox,
          totalPackConvert: state.transaction.totalPackConvert,
          totalPackIn: state.transaction.totalPackIn,
        },
      ],
    }));
  },
}));
