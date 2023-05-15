import { create } from 'zustand';
import {
  collection,
  // onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  deleteDoc,
  query,
  where,
  arrayUnion,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from 'config/firebaseConfig';
import { useTableHelper } from 'store/index';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const itemCodeStore = create((set, get) => ({
  loading: true,
  openSnackbar: false,
  snackbarMessage: '',
  listCategories: [],
  helperCode: '',
  helperCodeName: '',
  listMerk: [],
  addCategory: '',
  addCategoryValue: '',
  helperAddCategory: '',
  merk: '',
  categories: '',
  editCodeProductId: '',
  codeProducts: [],
  configs: {},
  search: '',
  editCodeProduct: {},
  addCodeProduct: {
    id: '',
    merk: '',
    categories: '',
    code: '',
    name: '',
  },
  addCodeProductMode: false,
  addCodeProductIcon: false,
  editMode: false,
  editCodeProductIcon: false,
  showSearch: false,
  setOpenSnackbar: () => set((state) => ({ openSnackbar: !state.openSnackbar })),
  setAddCategory: (event) => set(() => ({ addCategory: event.value })),
  setAddCategoryValue: (event) => {
    /* eslint-disable */
    const listMerk = get().listMerk;
    const listCategories = get().listCategories;
    /* eslint-disable */
    set(() => ({ addCategoryValue: event.value }));
    if (event.name === 'merk') {
      if (listMerk.find((merk) => merk.toLowerCase() === event.value.toLowerCase())) {
        set(() => ({ helperAddCategory: `${event.value} Sudah Ada` }));
      } else {
        set(() => ({ helperAddCategory: '' }));
      }
    } else if (event.name === 'category') {
      if (listCategories.find((category) => category.toLowerCase() === event.value.toLowerCase())) {
        set(() => ({ helperAddCategory: `${event.value} Sudah Ada` }));
      } else {
        set(() => ({ helperAddCategory: '' }));
      }
    }
  },
  setAddCategoryFinal: async () => {
    const addCategories = get().addCategory;
    const addCategoriesFinal = get().addCategoryValue;
    const getOpenSnackbar = get().setOpenSnackbar;
    const tempArray = addCategoriesFinal.split(' ');
    let tempArrayFinal = [];
    let addCategoriesNew = '';
    if (addCategories === 'merk') {
      const addCategoriesFinal = get().addCategoryValue.toUpperCase();
    } else {
      for (let i = 0; i < tempArray.length; i++) {
        tempArrayFinal.push(tempArray[i][0].toUpperCase() + tempArray[i].slice(1).toLowerCase());
      }
      addCategoriesNew = tempArrayFinal.join(' ');
    }
    const setOpen = useTableHelper.getState().setOpen;
    const updateDocument = doc(db, 'configs', 'ProductCode');
    set((state) => ({ loading: !state.loading }));
    await updateDoc(updateDocument, {
      [addCategories]: arrayUnion(addCategoriesNew),
    });
    set((state) => ({ snackbarMessage: `${addCategoriesNew} Berhasil Ditambahkan !` }));
    set((state) => ({ loading: !state.loading, addCategory: '', addCategoyValue: '' }));
    get().getField();
    getOpenSnackbar();
    setOpen();
  },
  setEditCodeProduct: (id) => {
    const getCodeProducts = get().codeProducts;
    const editCodeProductFinal = get().editCodeProduct;
    const getOpenSnackbar = get().setOpenSnackbar;
    getCodeProducts.forEach(async (product) => {
      if (product.id === id) {
        if (editCodeProductFinal.merk === '') {
          delete editCodeProductFinal.merk;
        }
        if (editCodeProductFinal.categories === '') {
          delete editCodeProductFinal.categories;
        }
        if (editCodeProductFinal.code === '') {
          delete editCodeProductFinal.code;
        }
        if (editCodeProductFinal.name === '') {
          delete editCodeProductFinal.name;
        }
        const updateDocument = doc(db, 'codeProducts', id);
        set((state) => ({ loading: !state.loading }));
        await updateDoc(updateDocument, editCodeProductFinal);
        set((state) => ({ snackbarMessage: `${product.name} Berhasil di Ubah !` }));
        set((state) => ({ loading: !state.loading, editMode: !state.editMode, editCodeProduct: {} }));
        getOpenSnackbar();
      }
    });
  },
  setEdit: (event) => {
    event.name === 'name'
      ? set((state) =>
          event.value.toString().toLowerCase().includes(state.merk.toString().toLowerCase()) &&
          event.value.toString().toLowerCase().includes(state.categories.toString().toLowerCase())
            ? { editCodeProduct: { ...state.editCodeProduct, [event.name]: event.value }, editCodeProductIcon: true }
            : { editCodeProduct: { ...state.editCodeProduct, [event.name]: event.value }, editCodeProductIcon: false }
        )
      : set((state) =>
          event.value !== ''
            ? { editCodeProduct: { ...state.editCodeProduct, [event.name]: event.value }, editCodeProductIcon: true }
            : { editCodeProduct: { ...state.editCodeProduct, [event.name]: event.value }, editCodeProductIcon: false }
        );
  },
  setCategories: (category) =>
    category !== undefined || null || ''
      ? set((state) => ({ categories: category, loading: !state.loading }))
      : set((state) => ({ categories: '', loading: !state.loading })),
  setMerk: (merkChoose) =>
    merkChoose !== undefined || null || ''
      ? set((state) => ({ merk: merkChoose, loading: !state.loading }))
      : set((state) => ({ merk: '', loading: !state.loading })),
  setAddCodeProduct: (event) => {
    set((state) => ({ addCodeProduct: { ...state.addCodeProduct, [event.name]: event.value } }));
    // set((state) =>
    //   state.addCodeProduct.code === '' || state.addCodeProduct.name === ''
    //     ? { addCodeProductIcon: false }
    //     : state.addCodeProduct.name.toString().toLowerCase().includes(state.merk.toString().toLowerCase()) &&
    //       state.addCodeProduct.name.toString().toLowerCase().includes(state.categories.toString().toLowerCase())
    //     ? {
    //         addCodeProductIcon: true,
    //         addCodeProduct: { ...state.addCodeProduct, merk: state.merk.toUpperCase(), categories: state.categories },
    //       }
    //     : { addCodeProductIcon: false }
    // );
    const codeProductAddFinal = get().addCodeProduct;
    const getOpenSnackbar = get().setOpenSnackbar;
    const getCodeProduct = get().codeProducts;
    const filterCode = getCodeProduct.filter((code) => code.code === codeProductAddFinal.code);
    const filterName = getCodeProduct.filter((code) => code.name === codeProductAddFinal.name);
    if (filterCode.length > 0 && event.name === 'code') {
      set(() => ({ helperCode: `${filterCode[0].code} Sudah Ada !`, addCodeProductIcon: false }));
    }
    if (filterName.length > 0 && event.name === 'name') {
      set(() => ({ helperCodeName: `${filterName[0].name} Sudah Ada !`, addCodeProductIcon: false }));
    } else {
      set(() => ({ helperCodeName: '', addCodeProductIcon: false }));
    }
    if (
      filterName.length === 0 &&
      filterCode.length === 0 &&
      codeProductAddFinal.name.toString().toLowerCase().includes(get().merk.toString().toLowerCase()) &&
      codeProductAddFinal.name.toString().toLowerCase().includes(get().categories.toString().toLowerCase())
    ) {
      set(() => ({ helperCodeName: '', helperCode: '', addCodeProductIcon: true }));
    }
  },
  setFinalAddCodeProduct: async () => {
    set((state) => ({
      addCodeProduct: { ...state.addCodeProduct, timeStamp: serverTimestamp() },
      loading: !state.loading,
    }));
    const codeProductAddFinal = get().addCodeProduct;
    const helperCodeName = get().helperCodeName;
    const helperCode = get().helperCode;
    if (helperCode === '' || helperCodeName === '' || (helperCode === '' && helperCodeName === '')) {
      delete codeProductAddFinal.id;
      codeProductAddFinal.merk = get().merk;
      codeProductAddFinal.categories = get().categories;
      try {
        await addDoc(collection(db, 'codeProducts'), codeProductAddFinal);
      } catch (err) {
        console.log(err);
      }
      set((state) => ({ snackbarMessage: `${codeProductAddFinal.name} Berhasil Ditambahkan !` }));
      set((state) => ({
        addCodeProduct: {
          id: '',
          merk: '',
          categories: '',
          code: '',
          name: '',
        },
        addCodeProductMode: !state.addCodeProductMode,
        loading: !state.loading,
      }));
      get().setOpenSnackbar();
    }
  },
  setCodeProductId: (id) =>
    set((state) => ({
      editCodeProductId: id,
      editCodeProductMode: !state.editCodeProductMode,
      editMode: !state.editMode,
    })),
  deleteAddCodeProductNew: () => {
    const codeProductDelete = get().codeProducts;
    codeProductDelete.pop();
    set((state) => ({ addCodeProductMode: !state.addCodeProductMode }));
  },
  setAddCodeProductMode: () => {
    set((state) => ({
      addCodeProductMode: !state.addCodeProductMode,
      editCodeProductId: state.addCodeProduct.id,
      codeProducts: [
        ...state.codeProducts,
        {
          id: state.addCodeProduct.id,
          merk: state.addCodeProduct.merk,
          categories: state.addCodeProduct.categories,
          code: state.addCodeProduct.code,
          name: state.addCodeProduct.name,
        },
      ],
    }));
  },
  setDeleteCodeProduct: async (id, code) => {
    const deleteProd = await getDocs(query(collection(db, 'listProducts'), where('code', '==', code), limit(1)));
    const getOpenSnackbar = get().setOpenSnackbar;
    if (!deleteProd.empty) {
      deleteProd.forEach(async (prod) => {
        await deleteDoc(doc(db, 'codeProducts', id));
        await deleteDoc(doc(db, 'listProducts', prod.id));
      });
      set((state) => ({ snackbarMessage: `Code Barang dan Barang dengan id ${id} Berhasil Dihapus !` }));
    } else {
      await deleteDoc(doc(db, 'codeProducts', id));
      set((state) => ({ snackbarMessage: `Code Barang dengan id ${id} Berhasil Dihapus !` }));
    }
    getOpenSnackbar();
  },
  getField: async () => {
    set(() => ({ listCategories: [], listMerk: [] }));
    const getData = await getsDocs(collection(db, 'configs'));
    getData.forEach((config) => {
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
  },
  getCodeProducts: async () => {
    const merks = get().merk.toUpperCase();
    const categorieses = get().categories;
    const getData = await getDocs(
      query(collection(db, 'codeProducts'), orderBy('categories'), orderBy('merk'), orderBy('name'))
    );
    set(() => ({ codeProducts: [] }));
    getData.forEach(async (codeData) => {
      if (
        merks !== '' &&
        categorieses !== '' &&
        merks.toString().toLowerCase() === codeData.data().merk.toString().toLowerCase() &&
        categorieses.toString().toLowerCase() === codeData.data().categories.toString().toLowerCase()
      ) {
        set((state) => ({
          codeProducts: [
            ...state.codeProducts,
            {
              id: codeData.id,
              code: codeData.data().code,
              name: codeData.data().name,
              categories: codeData.data().categories,
              merk: codeData.data().merk,
            },
          ],
        }));
      }
      if (
        categorieses !== '' &&
        categorieses.toString().toLowerCase() === codeData.data().categories.toString().toLowerCase() &&
        merks === ''
      ) {
        set((state) => ({
          codeProducts: [
            ...state.codeProducts,
            {
              id: codeData.id,
              code: codeData.data().code,
              name: codeData.data().name,
              categories: codeData.data().categories,
              merk: codeData.data().merk,
            },
          ],
        }));
      }
      if (
        merks !== '' &&
        merks.toString().toLowerCase() === codeData.data().merk.toString().toLowerCase() &&
        categorieses === ''
      ) {
        set((state) => ({
          codeProducts: [
            ...state.codeProducts,
            {
              id: codeData.id,
              code: codeData.data().code,
              name: codeData.data().name,
              categories: codeData.data().categories,
              merk: codeData.data().merk,
            },
          ],
        }));
      }
      if (merks === '' && categorieses === '') {
        set((state) => ({
          codeProducts: [
            ...state.codeProducts,
            {
              id: codeData.id,
              code: codeData.data().code,
              name: codeData.data().name,
              categories: codeData.data().categories,
              merk: codeData.data().merk,
            },
          ],
        }));
      }
    });

    await delay(2000);
    set((state) => ({ loading: !state.loading }));
  },
}));
