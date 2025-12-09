/**
 * Market Slice
 * Manages marketplace state including products, cart, and orders
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../services/marketService';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variant?: string;
  addedAt: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface MarketState {
  // Products
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  
  // Categories
  categories: string[];
  activeCategory: string;
  
  // Cart
  cart: CartItem[];
  cartOpen: boolean;
  cartTotal: number;
  cartItemCount: number;
  
  // Orders
  orders: Order[];
  currentOrder: Order | null;
  
  // Filters and search
  searchQuery: string;
  priceRange: [number, number];
  sortBy: 'created' | 'name' | 'price' | 'rating';
  sortOrder: 'asc' | 'desc';
  inStockOnly: boolean;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasMore: boolean;
  
  // Checkout
  checkoutStep: 'cart' | 'shipping' | 'payment' | 'review' | 'confirmation';
  shippingAddress: Address | null;
  paymentMethod: string | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  
  // Wishlist
  wishlist: string[];
}

const initialState: MarketState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  categories: [],
  activeCategory: '',
  cart: [],
  cartOpen: false,
  cartTotal: 0,
  cartItemCount: 0,
  orders: [],
  currentOrder: null,
  searchQuery: '',
  priceRange: [0, 10000],
  sortBy: 'created',
  sortOrder: 'desc',
  inStockOnly: false,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  hasMore: false,
  checkoutStep: 'cart',
  shippingAddress: null,
  paymentMethod: null,
  loading: false,
  error: null,
  viewMode: 'grid',
  wishlist: [],
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    // Products
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    
    appendProducts: (state, action: PayloadAction<Product[]>) => {
      state.products.push(...action.payload);
    },
    
    setFeaturedProducts: (state, action: PayloadAction<Product[]>) => {
      state.featuredProducts = action.payload;
    },
    
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    
    // Categories
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload;
      state.currentPage = 1; // Reset pagination
    },
    
    // Cart management
    addToCart: (state, action: PayloadAction<{
      product: Product;
      quantity: number;
      variant?: string;
    }>) => {
      const { product, quantity, variant } = action.payload;
      const existingItemIndex = state.cart.findIndex(
        item => item.product.id === product.id && item.variant === variant
      );
      
      if (existingItemIndex > -1) {
        // Update existing item quantity
        state.cart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        state.cart.push({
          id: `${product.id}-${variant || 'default'}`,
          product,
          quantity,
          variant,
          addedAt: new Date().toISOString(),
        });
      }
      
      marketSlice.caseReducers.updateCartTotals(state);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(item => item.id !== action.payload);
      marketSlice.caseReducers.updateCartTotals(state);
    },
    
    updateCartItemQuantity: (state, action: PayloadAction<{
      itemId: string;
      quantity: number;
    }>) => {
      const { itemId, quantity } = action.payload;
      const item = state.cart.find(item => item.id === itemId);
      
      if (item) {
        if (quantity <= 0) {
          state.cart = state.cart.filter(cartItem => cartItem.id !== itemId);
        } else {
          item.quantity = quantity;
        }
        marketSlice.caseReducers.updateCartTotals(state);
      }
    },
    
    clearCart: (state) => {
      state.cart = [];
      marketSlice.caseReducers.updateCartTotals(state);
    },
    
    updateCartTotals: (state) => {
      state.cartItemCount = state.cart.reduce((total, item) => total + item.quantity, 0);
      state.cartTotal = state.cart.reduce((total, item) => {
        const price = item.product.variants?.[0]?.prices?.[0]?.amount || 0;
        return total + (price * item.quantity) / 100; // Convert from cents
      }, 0);
    },
    
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.cartOpen = action.payload;
    },
    
    // Orders
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    
    updateOrderStatus: (state, action: PayloadAction<{
      orderId: string;
      status: Order['status'];
    }>) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
      }
    },
    
    // Filters and search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset pagination
    },
    
    setPriceRange: (state, action: PayloadAction<[number, number]>) => {
      state.priceRange = action.payload;
      state.currentPage = 1; // Reset pagination
    },
    
    setSortBy: (state, action: PayloadAction<MarketState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    
    toggleInStockOnly: (state) => {
      state.inStockOnly = !state.inStockOnly;
      state.currentPage = 1; // Reset pagination
    },
    
    setInStockOnly: (state, action: PayloadAction<boolean>) => {
      state.inStockOnly = action.payload;
      state.currentPage = 1; // Reset pagination
    },
    
    clearFilters: (state) => {
      state.searchQuery = '';
      state.priceRange = [0, 10000];
      state.activeCategory = '';
      state.inStockOnly = false;
      state.currentPage = 1;
    },
    
    // Pagination
    setPagination: (state, action: PayloadAction<{
      page: number;
      totalPages: number;
      totalProducts: number;
      hasMore: boolean;
    }>) => {
      state.currentPage = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.totalProducts = action.payload.totalProducts;
      state.hasMore = action.payload.hasMore;
    },
    
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // Checkout
    setCheckoutStep: (state, action: PayloadAction<MarketState['checkoutStep']>) => {
      state.checkoutStep = action.payload;
    },
    
    setShippingAddress: (state, action: PayloadAction<Address>) => {
      state.shippingAddress = action.payload;
    },
    
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
    
    // UI state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    
    // Wishlist
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const index = state.wishlist.indexOf(productId);
      if (index > -1) {
        state.wishlist.splice(index, 1);
      } else {
        state.wishlist.push(productId);
      }
    },
    
    addToWishlist: (state, action: PayloadAction<string>) => {
      if (!state.wishlist.includes(action.payload)) {
        state.wishlist.push(action.payload);
      }
    },
    
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter(id => id !== action.payload);
    },
    
    // Reset state
    resetMarketState: () => initialState,
  },
});

export const {
  setProducts,
  appendProducts,
  setFeaturedProducts,
  setCurrentProduct,
  setCategories,
  setActiveCategory,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
  setOrders,
  addOrder,
  setCurrentOrder,
  updateOrderStatus,
  setSearchQuery,
  setPriceRange,
  setSortBy,
  setSortOrder,
  toggleInStockOnly,
  setInStockOnly,
  clearFilters,
  setPagination,
  setCurrentPage,
  setCheckoutStep,
  setShippingAddress,
  setPaymentMethod,
  setLoading,
  setError,
  setViewMode,
  toggleWishlist,
  addToWishlist,
  removeFromWishlist,
  resetMarketState,
} = marketSlice.actions;

// Selectors
export const selectMarket = (state: { market: MarketState }) => state.market;
export const selectProducts = (state: { market: MarketState }) => state.market.products;
export const selectFeaturedProducts = (state: { market: MarketState }) => state.market.featuredProducts;
export const selectCurrentProduct = (state: { market: MarketState }) => state.market.currentProduct;
export const selectCategories = (state: { market: MarketState }) => state.market.categories;
export const selectActiveCategory = (state: { market: MarketState }) => state.market.activeCategory;
export const selectCart = (state: { market: MarketState }) => state.market.cart;
export const selectCartOpen = (state: { market: MarketState }) => state.market.cartOpen;
export const selectCartTotals = (state: { market: MarketState }) => ({
  total: state.market.cartTotal,
  itemCount: state.market.cartItemCount,
});
export const selectOrders = (state: { market: MarketState }) => state.market.orders;
export const selectCurrentOrder = (state: { market: MarketState }) => state.market.currentOrder;
export const selectMarketFilters = (state: { market: MarketState }) => ({
  search: state.market.searchQuery,
  category: state.market.activeCategory,
  priceRange: state.market.priceRange,
  sortBy: state.market.sortBy,
  sortOrder: state.market.sortOrder,
  inStockOnly: state.market.inStockOnly,
});
export const selectMarketPagination = (state: { market: MarketState }) => ({
  page: state.market.currentPage,
  totalPages: state.market.totalPages,
  totalProducts: state.market.totalProducts,
  hasMore: state.market.hasMore,
});
export const selectCheckoutState = (state: { market: MarketState }) => ({
  step: state.market.checkoutStep,
  shippingAddress: state.market.shippingAddress,
  paymentMethod: state.market.paymentMethod,
});
export const selectMarketLoading = (state: { market: MarketState }) => state.market.loading;
export const selectMarketError = (state: { market: MarketState }) => state.market.error;
export const selectViewMode = (state: { market: MarketState }) => state.market.viewMode;
export const selectWishlist = (state: { market: MarketState }) => state.market.wishlist;

// Memoized selectors
export const selectFilteredProducts = (state: { market: MarketState }) => {
  const { products, activeCategory, searchQuery, priceRange, inStockOnly } = state.market;
  
  return products.filter(product => {
    const matchesCategory = !activeCategory || product.category === activeCategory;
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriceRange = product.variants?.some(variant => 
      variant.prices?.some(price => 
        price.amount >= priceRange[0] * 100 && price.amount <= priceRange[1] * 100
      )
    );
    const matchesStock = !inStockOnly || (product.variants?.some(variant => 
      variant.inventory?.quantity && variant.inventory.quantity > 0
    ) ?? false);
    
    return matchesCategory && matchesSearch && matchesPriceRange && matchesStock;
  });
};

export const selectIsInWishlist = (productId: string) => (state: { market: MarketState }) => 
  state.market.wishlist.includes(productId);

export const selectIsInCart = (productId: string) => (state: { market: MarketState }) => 
  state.market.cart.some(item => item.product.id === productId);

export default marketSlice.reducer;