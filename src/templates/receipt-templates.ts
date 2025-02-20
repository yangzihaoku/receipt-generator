import React from 'react';
import { templatePreviews } from './template-previews';

// 定义业务类别枚举
export enum BusinessCategory {
  Restaurant = 'restaurant',
  Retail = 'retail',
  Service = 'service',
  Cafe = 'cafe',
  Pizzeria = 'pizzeria',
  Fastfood = 'fastfood'
}

// 定义默认商品项目接口
interface DefaultItem {
  name: string;
  priceRange: [number, number]; // [最小价格, 最大价格]
}

// 定义模板类型接口
export interface TemplateType {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: BusinessCategory;
  defaultItems: DefaultItem[];  // 添加默认商品列表
  render: (data: any) => React.ReactNode;
}

export const receiptTemplates: Record<string, TemplateType> = {
  classic: {
    id: 'classic',
    name: 'Classic Receipt',
    description: 'Traditional receipt layout',
    preview: 'https://placehold.co/400x300/e5e7eb/a3a3a3?text=Classic+Template',
    category: BusinessCategory.Restaurant,
    defaultItems: [
      { name: 'Burger', priceRange: [8.99, 15.99] },
      { name: 'Fries', priceRange: [3.99, 6.99] },
      { name: 'Drink', priceRange: [2.49, 4.99] },
      { name: 'Salad', priceRange: [7.99, 12.99] }
    ],
    render: (data) => {
      return React.createElement('div', null, 'Classic Template');
    }
  },
  modern: {
    id: 'modern',
    name: 'Modern Style',
    description: 'Contemporary clean design',
    preview: 'https://placehold.co/400x300/e5e7eb/a3a3a3?text=Modern+Template',
    category: BusinessCategory.Retail,
    defaultItems: [
      { name: 'T-Shirt', priceRange: [19.99, 29.99] },
      { name: 'Jeans', priceRange: [39.99, 79.99] },
      { name: 'Socks', priceRange: [5.99, 12.99] },
      { name: 'Hat', priceRange: [14.99, 24.99] }
    ],
    render: (data) => {
      return React.createElement('div', null, 'Modern Template');
    }
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Receipt',
    description: 'Simple and elegant',
    preview: 'https://placehold.co/400x300/e5e7eb/a3a3a3?text=Minimal+Template',
    category: BusinessCategory.Service,
    defaultItems: [
      { name: 'Basic Service', priceRange: [29.99, 49.99] },
      { name: 'Premium Service', priceRange: [59.99, 99.99] },
      { name: 'Express Service', priceRange: [39.99, 69.99] },
      { name: 'Consultation', priceRange: [19.99, 39.99] }
    ],
    render: (data) => {
      return React.createElement('div', null, 'Minimal Template');
    }
  },
}; 