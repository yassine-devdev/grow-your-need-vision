import pb from '../lib/pocketbase';

export interface ServiceOffering {
  id: string;
  title: string;
  provider_name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviews_count: number;
  location: string;
  image?: string;
  created: string;
}

export const professionalService = {
  async getServices(category?: string) {
    try {
      let filter = '';
      if (category) {
        filter = `category = "${category}"`;
      }
      const records = await pb.collection('services').getList<ServiceOffering>(1, 50, {
        sort: '-created',
        filter,
      });
      return records;
    } catch (error) {
      console.error('Error fetching services:', error);
      
      return { 
          page: 1,
          perPage: 50,
          totalItems: 0,
          totalPages: 0,
          items: [] 
      };
    }
  },

  async createService(data: Partial<ServiceOffering>) {
    try {
      return await pb.collection('services').create<ServiceOffering>(data);
    } catch (error) {
      console.error('Error creating service:', error);
      return null;
    }
  },

  async updateService(id: string, data: Partial<ServiceOffering>) {
    try {
      return await pb.collection('services').update<ServiceOffering>(id, data);
    } catch (error) {
      console.error('Error updating service:', error);
      return null;
    }
  },

  async deleteService(id: string) {
    try {
      return await pb.collection('services').delete(id);
    } catch (error) {
      console.error('Error deleting service:', error);
      return false;
    }
  }
};
