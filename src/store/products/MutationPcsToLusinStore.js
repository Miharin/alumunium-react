import { create } from 'zustand';
import { collection, query, getDocs, updateDoc, Timestamp, arrayUnion, doc, where, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'config/firebaseConfig';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const mutationPcsToLusinStore = create((set, get) => ({
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
    SelectLusin: '',
    Total1Lusin: '',
    Total2Lusin: '',
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
          } else if (name === 'SelectLusin') {
            product.SelectLusin = nameChoose.label;
            if (product.qtyBox !== '0' && product.SelectLusin !== '') {
              const divide = product.SelectLusin === 'Lusin 1' ? 12 : 24;
              const total = Number(product.qtyBox) / divide;
              if (product.SelectLusin === 'Lusin 1') {
                product.Total1Lusin = total;
                product.Total2Lusin = '';
              } else {
                product.Total1Lusin = '';
                product.Total2Lusin = total;
              }
              const productRules =
                product.codeBox !== '' &&
                product.codePack !== '' &&
                product.nameBox !== '' &&
                product.namePack !== '' &&
                product.qtyBox !== '0' &&
                product.SelectLusin !== '' &&
                (product.Total1Lusin !== '' || product.Total2Lusin !== '');
              set(() => (productRules ? { transactionIcon: true } : { transactionIcon: false }));
            }
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
          product.SelectLusin = '';
          product.namePack = '';
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
        if (product.qtyBox !== '0' && product.SelectLusin !== '') {
          const divide = product.SelectLusin === 'Lusin 1' ? 12 : 24;
          const total = Number(product.qtyBox) / divide;
          if (product.SelectLusin === 'Lusin 1') {
            product.Total1Lusin = total;
            product.Total2Lusin = '';
          } else {
            product.Total1Lusin = '';
            product.Total2Lusin = total;
          }
        }
      }
      const productRules =
        product.codeBox !== '' &&
        product.codePack !== '' &&
        product.nameBox !== '' &&
        product.namePack !== '' &&
        product.qtyBox !== '0' &&
        product.SelectLusin !== '' &&
        (product.Total1Lusin !== '' || product.Total2Lusin !== '');
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    productAddFinal.forEach(async (product) => {
      let productBox;
      let productPack;
      let boxID;
      let PackID;
      // Box
      const getDocBox = await getDocs(
        query(collection(db, 'listProducts'), where('name', '==', product.nameBox), limit(1))
      );
      getDocBox.forEach((item) => {
        boxID = item.id;
        productBox = {
          history: arrayUnion({
            date: new Date().toLocaleDateString('in-in', options),
            detail: 'Mutasi Barang',
            in: '0',
            timeStamp: product.timeStamp,
            out: product.qtyBox,
            stock: (Number(item.data().stock) - Number(product.qtyBox)).toString(),
          }),
          stock: (Number(item.data().stock) - Number(product.qtyBox)).toString(),
        };
      });
      // Pack
      const getDocPack = await getDocs(
        query(collection(db, 'listProducts'), where('name', '==', product.namePack), limit(1))
      );
      getDocPack.forEach((item) => {
        PackID = item.id;
        const In =
          product.Total1Lusin.toString() !== '' ? product.Total1Lusin.toString() : product.Total2Lusin.toString();
        productPack = {
          history: arrayUnion({
            date: new Date().toLocaleDateString('in-in', options),
            detail: 'Mutasi Barang',
            in: In,
            timeStamp: product.timeStamp,
            out: '0',
            stock: (Number(item.data().stock) + Number(In)).toString(),
          }),
          stock: (Number(item.data().stock) + Number(In)).toString(),
        };
      });
      const packData = doc(db, 'listProducts', PackID);
      const boxData = doc(db, 'listProducts', boxID);
      console.log(productBox, productPack);
      await updateDoc(packData, productBox);
      await updateDoc(boxData, productPack);
    });
    await delay(1000);
    set(() => ({ snackbarMessage: `Mutasi Berhasil !` }));
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
        product.codeBox !== '' &&
        product.codePack !== '' &&
        product.nameBox !== '' &&
        product.namePack !== '' &&
        product.qtyBox !== '0' &&
        product.SelectLusin !== '' &&
        (product.Total1Lusin !== '' || product.Total2Lusin !== '');
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
        SelectLusin: '',
        Total1Lusin: '',
        Total2Lusin: '',
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
          SelectLusin: state.transaction.SelectLusin,
          Total1Lusin: state.transaction.Total1Lusin,
          Total2Lusin: state.transaction.Total2Lusin,
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
      transactionIcon: false,
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
          SelectLusin: state.transaction.SelectLusin,
          Total1Lusin: state.transaction.Total1Lusin,
          Total2Lusin: state.transaction.Total2Lusin,
        },
      ],
    }));
  },
}));
