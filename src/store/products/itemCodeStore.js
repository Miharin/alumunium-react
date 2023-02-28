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
  where,
} from 'firebase/firestore';
import { db } from 'config/firebaseConfig';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const itemCodeStore = create((set, get) => ({
  loading: true,
  listCategories: ['Hollow', 'Hollow Tiang', 'Hollow Kepala'],
  listMerk: ['Indal', 'SAA'],
  merk: '',
  categories: '',
  editCodeProductId: '',
  codeProducts: [],
  configs: {},
  page: 0,
  rowsPerPage: 10,
  order: '',
  orderBy: '',
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
  setEditCodeProduct: (id) => {
    const getCodeProducts = get().codeProducts;
    const editCodeProductFinal = get().editCodeProduct;
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
        set((state) => ({ loading: !state.loading, editMode: !state.editMode, editCodeProduct: {} }));
      }
    });
  },
  setEdit: (event) => {
    set((state) =>
      event.name === 'name' &&
      state.editCodeProduct.name.toString().toLowerCase().includes(state.merk.toString().toLowerCase()) &&
      state.editCodeProduct.name.toString().toLowerCase().includes(state.categories.toString().toLowerCase())
        ? { editCodeProduct: { ...state.editCodeProduct, [event.name]: event.value }, editCodeProductIcon: true }
        : { editCodeProduct: { ...state.editCodeProduct, [event.name]: event.value }, editCodeProductIcon: false }
    );
    set((state) =>
      event.name === 'code' ? { editCodeProduct: { ...state.editCodeProduct, [event.name]: event.value } } : null
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
    set((state) =>
      state.addCodeProduct.code === '' || state.addCodeProduct.name === ''
        ? { addCodeProductIcon: false }
        : state.addCodeProduct.name.toString().toLowerCase().includes(state.merk.toString().toLowerCase()) &&
          state.addCodeProduct.name.toString().toLowerCase().includes(state.categories.toString().toLowerCase())
        ? {
            addCodeProductIcon: true,
            addCodeProduct: { ...state.addCodeProduct, merk: state.merk, categories: state.categories },
          }
        : { addCodeProductIcon: false }
    );
  },
  setFinalAddCodeProduct: async () => {
    const codeProductAddFinal = get().addCodeProduct;
    delete codeProductAddFinal.id;
    set((state) => ({
      addCodeProduct: { ...state.addCodeProduct, timeStamp: serverTimestamp() },
      loading: !state.loading,
    }));
    await addDoc(collection(db, 'codeProducts'), codeProductAddFinal);
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
  setDeleteCodeProduct: async (id) => {
    await deleteDoc(doc(db, 'codeProducts', id));
  },
  getCodeProducts: async () => {
    const merks = get().merk;
    const categorieses = get().categories;
    if (merks === '' && categorieses === '') {
      await onSnapshot(collection(db, 'codeProducts'), (codeProduct) => {
        set(() => ({ codeProducts: [] }));
        codeProduct.forEach(async (codeData) => {
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
        });
      });
      await delay(2000);
      set((state) => ({ loading: !state.loading }));
    } else if (merks === '') {
      await onSnapshot(
        query(collection(db, 'codeProducts'), where('categories', '==', categorieses)),
        (codeProduct) => {
          set(() => ({ codeProducts: [] }));
          codeProduct.forEach(async (codeData) => {
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
          });
        }
      );
      await delay(2000);
      set((state) => ({ loading: !state.loading }));
    } else if (categorieses === '') {
      await onSnapshot(query(collection(db, 'codeProducts'), where('merk', '==', merks)), (codeProduct) => {
        set(() => ({ codeProducts: [] }));
        codeProduct.forEach(async (codeData) => {
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
        });
      });
      set((state) => ({ loading: !state.loading }));
    } else {
      await onSnapshot(
        query(collection(db, 'codeProducts'), where('merk', '==', merks), where('categories', '==', categorieses)),
        (codeProduct) => {
          set(() => ({ codeProducts: [] }));
          codeProduct.forEach(async (codeData) => {
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
          });
        }
      );
      await delay(2000);
      set((state) => ({ loading: !state.loading }));
    }
  },
}));
