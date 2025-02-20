import React from 'react';
import { templatePreviews } from './template-previews';
import { generateDepartmentCode, generateStaffId, generateOrderNumber, generateLastFourDigits, generateAuthCode, generateTerminalId, generateReceiptBarcode } from '@/utils/receipt-helpers';

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
  options?: string[];  // 可选的选项列表
  extras?: Array<{     // 可选的额外项目
    name: string;
    price: number;
  }>;
  includes?: string[];  // 可选的包含项目列表
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
  config?: {
    showLogo?: boolean;
    showBarcode?: boolean;
    showMemberInfo?: boolean;
    showPromotions?: boolean;
    dateFormat?: 'short' | 'medium' | 'long';
    timeFormat?: '12' | '24';
    currencySymbol?: string;
    language?: 'en' | 'es' | 'fr';
    fontSize?: 'small' | 'medium' | 'large';
    paperSize?: 'standard' | 'wide' | 'narrow';
  };
}

export const receiptTemplates: Record<string, TemplateType> = {
  classic: {
    id: 'classic',
    name: 'Classic Receipt',
    description: 'Traditional receipt layout',
    preview: 'https://placehold.co/400x300/e5e7eb/a3a3a3?text=Classic+Template',
    category: BusinessCategory.Restaurant,
    defaultItems: [
      { 
        name: 'Coffee',
        priceRange: [2.99, 4.99],
        options: ['Regular', 'Decaf'],
        extras: [
          { name: 'Extra Shot', price: 0.99 },
          { name: 'Flavor Shot', price: 0.75 }
        ]
      },
      { 
        name: 'Pancakes',
        priceRange: [11.99, 15.99],
        options: ['Regular', 'Blueberry', 'Chocolate Chip'],
        extras: [
          { name: 'Whipped Cream', price: 1.50 },
          { name: 'Extra Syrup', price: 1.00 }
        ]
      },
      { 
        name: 'Eggs/CFS',
        priceRange: [15.99, 18.99],
        options: ['Sunny Side Up', 'Over Easy', 'Scrambled'],
        extras: [
          { name: 'Extra Egg', price: 2.49 },
          { name: 'Cheese', price: 1.50 }
        ]
      },
      { 
        name: 'Hashbrowns',
        priceRange: [3.99, 5.99],
        options: ['Regular', 'Extra Crispy', 'Well Done'],
        extras: [
          { name: 'Cheese', price: 1.50 },
          { name: 'Onions', price: 0.99 }
        ]
      },
      { 
        name: 'Bacon',
        priceRange: [4.99, 6.99],
        options: ['Regular', 'Crispy', 'Extra Crispy']
      },
      { 
        name: 'Sausage Links',
        priceRange: [1.99, 3.99],
        options: ['Regular', 'Turkey']
      },
      { 
        name: 'Grand Slam',
        priceRange: [13.99, 16.99],
        options: ['Classic', 'Build Your Own'],
        extras: [
          { name: 'Extra Pancake', price: 2.99 },
          { name: 'Premium Bacon', price: 2.49 },
          { name: 'Add Avocado', price: 1.99 }
        ],
        includes: ['2 Eggs', 'Bacon/Sausage', '2 Pancakes', 'Hashbrowns']
      },
      { 
        name: 'Breakfast Combo',
        priceRange: [11.99, 14.99],
        options: ['American', 'Fit Fare', 'Value'],
        extras: [
          { name: 'Add Toast', price: 1.99 },
          { name: 'Substitute Fruit', price: 1.50 }
        ],
        includes: ['Eggs', 'Choice of Meat', 'Side']
      },
      {
        name: 'Omelette',
        priceRange: [12.99, 15.99],
        options: ['Cheese', 'Western', 'Veggie'],
        extras: [
          { name: 'Extra Cheese', price: 1.50 },
          { name: 'Add Mushrooms', price: 1.25 },
          { name: 'Add Spinach', price: 1.25 }
        ],
        includes: ['Toast', 'Hashbrowns']
      }
    ],
    render: (data) => {
      const orderTime = new Date();
      return (
        <div className="font-mono text-sm">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold">{data.merchant}</h1>
            <div>Dine In</div>
            <div>SALE</div>
            <div>Restaurant #{generateDepartmentCode()}</div>
            <div>{data.address}</div>
            <div>Reg {generateStaffId()} (Server)</div>
            <div>Employee: {data.serverName || 'Server ' + generateStaffId()}</div>
            <div>
              {orderTime.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
              })}
              {' '}
              {orderTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <div>Order # {generateOrderNumber()}</div>
            <div>Table: {Math.floor(Math.random() * 100) + 1}</div>
            <div className="text-xs mt-2">
              <div>Open 24 Hours</div>
              <div>Free WiFi Available</div>
              {Math.random() > 0.7 && (
                <div>*** Happy Hour 3PM-6PM ***</div>
              )}
            </div>
          </div>
          
          <div className="border-t border-b border-dashed py-2 mb-4">
            <div className="grid grid-cols-12 font-bold">
              <div className="col-span-6">ITEM</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-4 text-right">PRICE</div>
            </div>
            {data.items?.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-12">
                <div className="col-span-6">{item.name}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-4 text-right">${item.total.toFixed(2)}</div>
                {item.options?.map((option: string, i: number) => (
                  <div key={i} className="col-span-12 pl-4 text-sm">{option}</div>
                ))}
              </div>
            ))}
          </div>

          <div className="text-right space-y-1">
            <div>Subtotal ${data.subtotal}</div>
            <div>Tax ${data.tax}</div>
            <div className="text-lg font-bold">Total ${data.amount}</div>
            <div>Tip ${data.tip}</div>
            <div className="font-bold">CREDIT ${(parseFloat(data.amount) + parseFloat(data.tip)).toFixed(2)}</div>
          </div>

          <div className="mt-4 text-center">
            <div>ORDER IS PAID</div>
            <div>Account #: {`${generateLastFourDigits()}******${generateLastFourDigits()}`}</div>
            <div>Authorization: {generateAuthCode()}</div>
            <div>Terminal ID: {generateTerminalId()}</div>
            <div>Trace No: {Math.floor(Math.random() * 1000000)}</div>
            
            {Math.random() > 0.7 && (
              <div className="mt-2 text-sm">
                <div>*** MEMBER REWARDS ***</div>
                <div>Points Earned: {Math.floor(parseFloat(data.amount) * 10)}</div>
                <div>Current Balance: {Math.floor(Math.random() * 10000)} pts</div>
                {Math.random() > 0.5 && (
                  <div>Special Offer: 20% off next visit!</div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-xs">
            <div>Join our rewards program!</div>
            <div>Download our app for exclusive offers</div>
            <div>Follow us on social media @{data.merchant.toLowerCase()}</div>
            {Math.random() > 0.8 && (
              <div className="mt-2">
                <div>*** SPECIAL OFFER ***</div>
                <div>Free dessert with any entree</div>
                <div>Valid: {new Date().toLocaleDateString()}</div>
              </div>
            )}
          </div>

          {generateReceiptBarcode()}
        </div>
      );
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
      return (
        <div className="font-sans text-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">{data.merchant}</h1>
            <div className="text-gray-600">{data.address}</div>
            <div className="text-gray-600">{data.phone}</div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-gray-600 text-xs mb-2">
              <div>Order #{generateOrderNumber()}</div>
              <div>{data.date} {data.time}</div>
            </div>
            <div className="flex justify-between text-gray-600 text-xs">
              <div>Cashier: {generateStaffId()}</div>
              <div>Terminal: {generateTerminalId()}</div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-4 mb-6">
            {/* 商品列表会在这里渲染 */}
          </div>

          <div className="space-y-2 text-right">
            <div className="text-gray-600">Subtotal: ${data.subtotal}</div>
            <div className="text-gray-600">Tax ({(data.taxRate).toFixed(1)}%): ${data.tax}</div>
            <div className="text-xl font-bold">Total: ${data.amount}</div>
            {data.tip && (
              <div className="text-gray-600">Tip ({data.tipRate}%): ${data.tip}</div>
            )}
          </div>

          <div className="mt-6 text-center text-gray-600 text-sm">
            <div>Thank you for shopping with us!</div>
            <div>Your satisfaction is our priority</div>
            <div className="mt-2">
              <div>Member points earned: {Math.floor(parseFloat(data.amount) * 10)}</div>
              <div>Current balance: {Math.floor(parseFloat(data.amount) * 100)}</div>
            </div>
          </div>

          {generateReceiptBarcode()}
        </div>
      );
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
      return (
        <div className="font-mono text-xs p-2">
          <div className="mb-4">
            <div className="text-lg font-bold">{data.merchant}</div>
            <div>{data.address}</div>
            <div>{data.phone}</div>
            <div className="text-sm mt-2">
              <span>Date: {data.date}</span>
              <span className="ml-4">Time: {data.time}</span>
            </div>
            <div>Service Provider: #{generateStaffId()}</div>
          </div>

          <div className="border-t border-b border-dotted py-2 mb-4">
            <div className="flex justify-between font-bold">
              <div>Service</div>
              <div>Amount</div>
            </div>
            {/* 服务项目列表会在这里渲染 */}
          </div>

          <div className="text-right mb-4">
            <div>Service Total: ${data.subtotal}</div>
            <div>Tax: ${data.tax}</div>
            <div className="font-bold">Total Due: ${data.amount}</div>
            {data.tip && (
              <div>Gratuity: ${data.tip}</div>
            )}
          </div>

          <div className="text-center text-[10px] mt-4">
            <div>Thank you for choosing our service</div>
            <div>For appointments call: {data.phone}</div>
            <div className="mt-2">
              <div>Invoice #: {generateOrderNumber()}</div>
              <div>Auth: {generateAuthCode()}</div>
            </div>
          </div>

          {generateReceiptBarcode()}
        </div>
      );
    }
  },
}; 