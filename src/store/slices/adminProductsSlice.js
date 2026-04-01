import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi } from '../../api/productApi';

// ── Thunks ──────────────────────────────────────────────────────

export const fetchAdminProducts = createAsyncThunk(
    'adminProducts/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            return await productApi.getProducts();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchAdminCategories = createAsyncThunk(
    'adminProducts/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            return await productApi.getCategories();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchAdminTags = createAsyncThunk(
    'adminProducts/fetchTags',
    async (_, { rejectWithValue }) => {
        try {
            return await productApi.getOrgTags();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchAdminProductsAll = createAsyncThunk(
    'adminProducts/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const [products, categories, tags] = await Promise.all([
                productApi.getProducts(),
                productApi.getCategories(),
                productApi.getOrgTags(),
            ]);
            return { products, categories, tags };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const createAdminProduct = createAsyncThunk(
    'adminProducts/createProduct',
    async (payload, { rejectWithValue }) => {
        try {
            return await productApi.createProductWithTags(payload);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateAdminProduct = createAsyncThunk(
    'adminProducts/updateProduct',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            await productApi.updateProduct(id, payload);
            return { id, payload };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteAdminProduct = createAsyncThunk(
    'adminProducts/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await productApi.deleteProduct(id);
            return id;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const createAdminCategory = createAsyncThunk(
    'adminProducts/createCategory',
    async (data, { rejectWithValue }) => {
        try {
            return await productApi.createCategory(data);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateAdminCategory = createAsyncThunk(
    'adminProducts/updateCategory',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            await productApi.updateCategory(id, data);
            return { id, data };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteAdminCategory = createAsyncThunk(
    'adminProducts/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await productApi.deleteCategory(id);
            return id;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const createAdminTag = createAsyncThunk(
    'adminProducts/createTag',
    async (data, { rejectWithValue }) => {
        try {
            return await productApi.createTag(data);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// ── Slice ────────────────────────────────────────────────────────

const adminProductsSlice = createSlice({
    name: 'adminProducts',
    initialState: {
        products: [],
        categories: [],
        tags: [],
        loading: false,
        error: null,
    },
    reducers: {
        // Optimistic local mutations for instant UI feedback
        localUpdateProduct: (state, action) => {
            const updated = action.payload;
            const idx = state.products.findIndex(p => p.product_id === updated.product_id);
            if (idx !== -1) state.products[idx] = updated;
        },
        localDeleteProduct: (state, action) => {
            state.products = state.products.filter(p => p.product_id !== action.payload);
        },
        localUpdateCategory: (state, action) => {
            const updated = action.payload;
            const idx = state.categories.findIndex(c => c.category_id === updated.category_id);
            if (idx !== -1) state.categories[idx] = updated;
        },
        localDeleteCategory: (state, action) => {
            state.categories = state.categories.filter(c => c.category_id !== action.payload);
        },
        clearAdminProductsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchAll (Products page uses this to load everything at once)
        builder
            .addCase(fetchAdminProductsAll.pending, (state) => {
                state.loading = true; state.error = null;
            })
            .addCase(fetchAdminProductsAll.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products;
                state.categories = action.payload.categories;
                state.tags = action.payload.tags;
            })
            .addCase(fetchAdminProductsAll.rejected, (state, action) => {
                state.loading = false; state.error = action.payload;
            });

        // fetchAdminProducts
        builder
            .addCase(fetchAdminProducts.pending, (state) => {
                state.loading = true; state.error = null;
            })
            .addCase(fetchAdminProducts.fulfilled, (state, action) => {
                state.loading = false; state.products = action.payload;
            })
            .addCase(fetchAdminProducts.rejected, (state, action) => {
                state.loading = false; state.error = action.payload;
            });

        // fetchAdminCategories
        builder
            .addCase(fetchAdminCategories.pending, (state) => {
                state.loading = true; state.error = null;
            })
            .addCase(fetchAdminCategories.fulfilled, (state, action) => {
                state.loading = false; state.categories = action.payload;
            })
            .addCase(fetchAdminCategories.rejected, (state, action) => {
                state.loading = false; state.error = action.payload;
            });

        // fetchAdminTags
        builder
            .addCase(fetchAdminTags.pending, (state) => {
                state.loading = true; state.error = null;
            })
            .addCase(fetchAdminTags.fulfilled, (state, action) => {
                state.loading = false; state.tags = action.payload;
            })
            .addCase(fetchAdminTags.rejected, (state, action) => {
                state.loading = false; state.error = action.payload;
            });

        // createAdminProduct — re-fetch full product list after creation
        builder
            .addCase(createAdminProduct.fulfilled, (state, action) => {
                // Backend may return the new product; append it
                if (action.payload?.product_id) {
                    state.products.push(action.payload);
                }
            });

        // updateAdminProduct — optimistic update
        builder
            .addCase(updateAdminProduct.fulfilled, (state, action) => {
                const { id, payload } = action.payload;
                const idx = state.products.findIndex(p => p.product_id === id);
                if (idx !== -1) {
                    state.products[idx] = { ...state.products[idx], ...payload };
                }
            });

        // deleteAdminProduct
        builder
            .addCase(deleteAdminProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p.product_id !== action.payload);
            });

        // createAdminCategory — append returned category
        builder
            .addCase(createAdminCategory.fulfilled, (state, action) => {
                if (action.payload?.category_id) {
                    state.categories.push(action.payload);
                }
            });

        // updateAdminCategory
        builder
            .addCase(updateAdminCategory.fulfilled, (state, action) => {
                const { id, data } = action.payload;
                const idx = state.categories.findIndex(c => c.category_id === id);
                if (idx !== -1) {
                    state.categories[idx] = { ...state.categories[idx], ...data };
                }
            });

        // deleteAdminCategory
        builder
            .addCase(deleteAdminCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c.category_id !== action.payload);
            });

        // createAdminTag — append
        builder
            .addCase(createAdminTag.fulfilled, (state, action) => {
                if (action.payload?.tag_id) {
                    state.tags.push(action.payload);
                }
            });
    },
});

export const {
    localUpdateProduct, localDeleteProduct,
    localUpdateCategory, localDeleteCategory,
    clearAdminProductsError,
} = adminProductsSlice.actions;

// ── Selectors ────────────────────────────────────────────────────
export const selectAdminProducts = (state) => state.adminProducts.products;
export const selectAdminCategories = (state) => state.adminProducts.categories;
export const selectAdminTags = (state) => state.adminProducts.tags;
export const selectAdminProductsLoading = (state) => state.adminProducts.loading;
export const selectAdminProductsError = (state) => state.adminProducts.error;

export default adminProductsSlice.reducer;
