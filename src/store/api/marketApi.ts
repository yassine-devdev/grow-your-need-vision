/**
 * Market API Slice
 * RTK Query API for marketplace operations
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { marketService, Product } from '../../services/marketService';
import { AppError } from '../../services/errorHandler';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface OrderData {
  items: CartItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

export const marketApi = createApi({
  reducerPath: 'marketApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Product', 'Cart', 'Order'],
  endpoints: (builder) => ({
    // Get products
    getProducts: builder.query<Product[], {
      page?: number;
      limit?: number;
      filter?: string;
      sort?: string;
      category?: string;
    }>({
      queryFn: async (params) => {
        try {
          const products = await marketService.getProducts(params);
          return { data: products };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Product'],
    }),

    // Get featured products
    getFeaturedProducts: builder.query<Product[], { limit?: number }>({
      queryFn: async ({ limit = 10 }) => {
        try {
          const products = await marketService.getFeaturedProducts(limit);
          return { data: products };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Product'],
    }),

    // Get product by ID
    getProduct: builder.query<Product, string>({
      queryFn: async (id) => {
        try {
          const product = await marketService.getOne(id);
          return { data: product };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Search products
    searchProducts: builder.query<Product[], {
      query: string;
      params?: {
        page?: number;
        limit?: number;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
      };
    }>({
      queryFn: async ({ query, params }) => {
        try {
          const products = await marketService.searchProducts(query, params);
          return { data: products };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Product'],
    }),

    // Get products by category
    getProductsByCategory: builder.query<Product[], {
      category: string;
      params?: {
        page?: number;
        limit?: number;
        sort?: string;
      };
    }>({
      queryFn: async ({ category, params }) => {
        try {
          const products = await marketService.getProductsByCategory(category, params);
          return { data: products };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Product'],
    }),

    // Create product
    createProduct: builder.mutation<Product, {
      data: Partial<Product>;
      files?: Record<string, File>;
    }>({
      queryFn: async ({ data, files }) => {
        try {
          const product = await marketService.create({ data, files });
          return { data: product };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['Product'],
    }),

    // Update product
    updateProduct: builder.mutation<Product, {
      id: string;
      data: Partial<Product>;
      files?: Record<string, File>;
    }>({
      queryFn: async ({ id, data, files }) => {
        try {
          const product = await marketService.update({ id, data, files });
          return { data: product };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        'Product',
      ],
    }),

    // Delete product
    deleteProduct: builder.mutation<boolean, string>({
      queryFn: async (id) => {
        try {
          const success = await marketService.delete(id);
          return { data: success };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        'Product',
      ],
    }),

    // Cart operations
    getCart: builder.query<CartItem[], void>({
      queryFn: async () => {
        try {
          const cart = await marketService.getCart();
          return { data: cart };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<CartItem, {
      productId: string;
      quantity: number;
      variantId?: string;
    }>({
      queryFn: async ({ productId, quantity, variantId }) => {
        try {
          const cartItem = await marketService.addToCart(productId, quantity, variantId);
          return { data: cartItem };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['Cart'],
    }),

    updateCartItem: builder.mutation<CartItem, {
      itemId: string;
      quantity: number;
    }>({
      queryFn: async ({ itemId, quantity }) => {
        try {
          const cartItem = await marketService.updateCartItem(itemId, quantity);
          return { data: cartItem };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['Cart'],
    }),

    removeFromCart: builder.mutation<boolean, string>({
      queryFn: async (itemId) => {
        try {
          const success = await marketService.removeFromCart(itemId);
          return { data: success };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation<boolean, void>({
      queryFn: async () => {
        try {
          const success = await marketService.clearCart();
          return { data: success };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['Cart'],
    }),

    // Order operations
    createOrder: builder.mutation<any, OrderData>({
      queryFn: async (orderData) => {
        try {
          const order = await marketService.createOrder(orderData);
          return { data: order };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      invalidatesTags: ['Cart'],
    }),

    getOrders: builder.query<any[], {
      page?: number;
      limit?: number;
      status?: string;
    }>({
      queryFn: async (params) => {
        try {
          const orders = await marketService.getOrders(params);
          return { data: orders };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Order'],
    }),

    getOrder: builder.query<any, string>({
      queryFn: async (orderId) => {
        try {
          const order = await marketService.getOrder(orderId);
          return { data: order };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Categories
    getCategories: builder.query<string[], void>({
      queryFn: async () => {
        try {
          const categories = await marketService.getCategories();
          return { data: categories };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    // Product statistics
    getProductStats: builder.query<{
      total: number;
      byCategory: Record<string, number>;
      featured: number;
      outOfStock: number;
    }, void>({
      queryFn: async () => {
        try {
          const stats = await marketService.getProductStats();
          return { data: stats };
        } catch (error) {
          return { error: error as AppError };
        }
      },
      providesTags: ['Product'],
    }),

    // Wishlist operations
    getWishlist: builder.query<string[], void>({
      queryFn: async () => {
        try {
          const wishlist = await marketService.getWishlist();
          return { data: wishlist };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    addToWishlist: builder.mutation<boolean, string>({
      queryFn: async (productId) => {
        try {
          const success = await marketService.addToWishlist(productId);
          return { data: success };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),

    removeFromWishlist: builder.mutation<boolean, string>({
      queryFn: async (productId) => {
        try {
          const success = await marketService.removeFromWishlist(productId);
          return { data: success };
        } catch (error) {
          return { error: error as AppError };
        }
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetProductQuery,
  useSearchProductsQuery,
  useGetProductsByCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetCategoriesQuery,
  useGetProductStatsQuery,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = marketApi;

export default marketApi;