import React, { useState, useEffect } from 'react';
import { Icon, Card, Button, Badge } from '../components/shared/ui/CommonUI';
import { marketService, Product } from '../services/marketService';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';
import pb from '../lib/pocketbase';

interface MarketAppProps {
  activeTab: string;
  activeSubNav: string;
}

const MarketApp: React.FC<MarketAppProps> = ({ activeTab, activeSubNav }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await marketService.getProducts();
      setProducts(result || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (product: Product) => {
    try {
      if (!product.variants || product.variants.length === 0) {
        alert('Product out of stock');
        return;
      }

      const variant = product.variants[0];
      const price = variant.prices[0]?.amount ? variant.prices[0].amount / 100 : 0;

      if (confirm(`Purchase ${product.title} for $${price}?`)) {
        // 1. Create Cart
        const cart = await marketService.createCart();
        if (!cart) throw new Error('Failed to create cart');

        // 2. Add Item
        await marketService.addToCart(cart.id, variant.id, 1);

        // 3. Checkout (Simplified for demo)
        await marketService.completeCheckout(cart.id);

        alert('Order placed successfully!');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn text-gray-800 dark:text-white">
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Summer Sale Live!</h2>
          <p className="text-teal-100 mb-4">Up to 50% off on electronics and home goods.</p>
          <Button variant="secondary" className="bg-white text-teal-600 hover:bg-teal-50 border-none">Shop Now</Button>
        </div>
        <Icon name="MarketIcon3D" className="w-32 h-32 opacity-20 absolute right-0 bottom-0 transform translate-x-4 translate-y-4" />
      </div>

      {/* Category Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-4">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{activeTab} - {activeSubNav}</h1>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAIModalOpen(true)}
                className="hidden md:flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
            >
                <Icon name="Sparkles" className="w-4 h-4" />
                Personal Shopper
            </Button>
        </div>
        <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Sort by:</span>
          <select className="border-none bg-transparent font-bold text-gray-800 dark:text-white focus:outline-none cursor-pointer">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">No products found.</div>
        ) : (
          products.map(product => {
            const price = product.variants[0]?.prices[0]?.amount
              ? product.variants[0].prices[0].amount / 100
              : 0;

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group p-0 border border-gray-200 dark:border-slate-700">
                <div className="aspect-square bg-gray-100 dark:bg-slate-800 relative p-4 flex items-center justify-center">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="MarketIcon" className="w-16 h-16 text-gray-300 dark:text-slate-600 group-hover:scale-110 transition-transform" />
                  )}
                  <button className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/50 rounded-full hover:text-red-500 text-gray-400 backdrop-blur-sm transition-colors">
                    <Icon name="Heart" className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1">{product.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">${price.toFixed(2)}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleBuy(product)}
                      className="rounded-lg"
                    >
                      <Icon name="PlusCircleIcon" className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-500">
                    {'★'.repeat(4)}{'☆'.repeat(1)} <span className="text-gray-400 dark:text-gray-500 text-[10px]">({product.variants[0]?.inventory_quantity || 0} in stock)</span>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <AIContentGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSuccess={() => setIsAIModalOpen(false)}
        title="AI Personal Shopper"
        promptTemplate={`I am looking for a gift for [Recipient (e.g., 10 year old boy, teacher)].
        
        Based on the available products:
        ${products.slice(0, 10).map(p => `- ${p.title} ($${p.variants[0]?.prices[0]?.amount/100})`).join('\n')}
        
        Recommend 3 items and explain why they would be good gifts.`}
        contextData={{ products: products.slice(0, 20) }}
      />
    </div>
  );
};

export default MarketApp;
