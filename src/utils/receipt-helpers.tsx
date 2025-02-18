import React from 'react';
import { TemplateType } from '@/templates/receipt-templates';

// 生成随机数和格式化函数
const generateOrderNumber = () => Math.random().toString(36).substr(2, 8).toUpperCase();
const generateLastFourDigits = () => Math.floor(1000 + Math.random() * 9000).toString();
const generateAuthCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();
const generateTerminalId = () => 'TERM' + Math.floor(100 + Math.random() * 900);
const generateStaffId = () => Math.floor(100 + Math.random() * 900);
const generateDepartmentCode = () => Math.floor(Math.random() * 99).toString().padStart(2, '0');

// 添加回 generateReceiptBarcode 函数定义
const generateReceiptBarcode = () => (
  <div className="mt-2 text-center">
    <div className="font-mono text-xs">
      {Array(12).fill(0).map(() => Math.floor(Math.random() * 10)).join('')}
    </div>
  </div>
);

// 添加新的辅助函数
const getRandomPrice = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// 扩展 BusinessCategory 类型以包含所有可能的类别
type BusinessCategory = 'restaurant' | 'cafe' | 'pizzeria' | 'fastfood' | 'retail' | 'service';

type BusinessHours = {
  [key in BusinessCategory]: {
    open: number;
    close: number;
  };
};

// 修改函数定义，添加类型注解
const generateReceiptTime = (category: string) => {
  const now = new Date();
  const currentHour = now.getHours();
  
  // 根据商户类型调整营业时间
  const businessHours: BusinessHours = {
    restaurant: { open: 11, close: 23 },
    cafe: { open: 6, close: 21 },      // 咖啡店早开门
    pizzeria: { open: 11, close: 23 }, // 披萨店晚关门
    fastfood: { open: 10, close: 22 },  // 快餐店
    retail: { open: 9, close: 18 },      // 零售店
    service: { open: 9, close: 18 }      // 服务店
  };

  // 使用类型断言来告诉 TypeScript category 是有效的键
  const storeHours = businessHours[category as BusinessCategory] || { open: 9, close: 21 };
  
  if (currentHour < storeHours.open || currentHour > storeHours.close) {
    now.setHours(Math.floor(Math.random() * (storeHours.close - storeHours.open) + storeHours.open));
    now.setMinutes(Math.floor(Math.random() * 60));
  }

  return {
    time: now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    isRushHour: (currentHour >= 11 && currentHour <= 14) || (currentHour >= 17 && currentHour <= 19)
  };
};

// 修改 generatePaymentInfo
const generatePaymentInfo = (amount: number, category: BusinessCategory) => {
  const methods = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'];
  const method = methods[Math.floor(Math.random() * methods.length)];
  const isDebit = Math.random() > 0.7;
  
  return {
    method,
    cardNumber: `**** **** **** ${generateLastFourDigits()}`,
    authCode: generateAuthCode(),
    entryMethod: Math.random() > 0.3 ? 'CHIP' : 'SWIPE',
    approvalCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
    cardType: isDebit ? 'DEBIT' : 'CREDIT',
    // 根据商户类型添加额外信息
    ...(category === 'restaurant' && {
      tipAmount: (amount * 0.15).toFixed(2),
      tipPercentage: '15%'
    }),
    ...(category === 'retail' && {
      cashback: '0.00',
      rewardsEarned: Math.floor(amount)
    }),
    ...(category === 'service' && {
      gratuityOptions: {
        fifteen: (amount * 0.15).toFixed(2),
        eighteen: (amount * 0.18).toFixed(2),
        twenty: (amount * 0.20).toFixed(2)
      }
    })
  };
};

// 添加商品描述生成器
const generateItemDescription = (item: { name: string, price: number }) => {
  const brands = {
    retail: ['Store Brand', 'Premium', 'Luxury', 'Basic'],
    restaurant: ['House Special', 'Chef\'s Choice', 'Classic'],
    service: ['Standard', 'Premium', 'Express']
  };

  const sizes = ['Small', 'Medium', 'Large', 'Regular'];
  const modifiers = ['Fresh', 'New', 'Special', 'Limited'];

  // 修复这里的逻辑
  const brandCategory = item.price > 20 ? 'retail' : 'service';
  const brandList = brands[brandCategory];
  const brand = brandList[Math.floor(Math.random() * brandList.length)];
  
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];

  return `${modifier} ${size} ${brand} ${item.name}`;
};

// 添加商品分类功能
const categorizeItems = (items: Array<any>) => {
  const categories = {
    food: ['Burger', 'Salad', 'Fries', 'Drink', 'Coffee', 'Sandwich', 'Pizza', 'Pasta'],
    grocery: ['Produce', 'Dairy', 'Bread', 'Meat', 'Frozen'],
    beverage: ['Coffee', 'Tea', 'Juice', 'Soda', 'Water']
  };

  return items.map(item => {
    let category = 'other';
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => item.name.toLowerCase().includes(keyword.toLowerCase()))) {
        category = cat;
        break;
      }
    }
    return { ...item, category };
  });
};

const generateSerialNumber = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

// 添加餐饮相关的描述生成器
const generateFoodDescription = (item: { name: string, price: number }) => {
  const sizes = ['Regular', 'Large', 'Small'];
  const modifiers = ['Fresh', 'Hot', 'Special', 'House'];
  const preparations = ['Grilled', 'Fried', 'Baked', 'Steamed'];
  const extras = ['with Fries', 'with Salad', 'with Drink', 'Combo'];

  const size = sizes[Math.floor(Math.random() * sizes.length)];
  const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
  const preparation = item.name.toLowerCase().includes('pizza') ? '' : 
    preparations[Math.floor(Math.random() * preparations.length)];
  const extra = Math.random() > 0.7 ? extras[Math.floor(Math.random() * extras.length)] : '';

  return `${modifier} ${size} ${preparation} ${item.name} ${extra}`.trim();
};

// 修改 generateRestaurantPaymentInfo
const generateRestaurantPaymentInfo = (amount: number, category: BusinessCategory) => {
  const baseInfo = generatePaymentInfo(amount, category);
  
  // 添加餐饮特定的信息
  if (category === 'restaurant' || category === 'pizzeria') {
    return {
      ...baseInfo,
      tableNumber: Math.floor(Math.random() * 30) + 1,
      serverNumber: generateStaffId(),
      gratuityOptions: {
        fifteen: (amount * 0.15).toFixed(2),
        eighteen: (amount * 0.18).toFixed(2),
        twenty: (amount * 0.20).toFixed(2)
      }
    };
  }
  
  if (category === 'cafe' || category === 'fastfood') {
    return {
      ...baseInfo,
      orderNumber: generateOrderNumber(),
      rewardsPoints: Math.floor(amount * 10),
      memberDiscount: Math.random() > 0.7 ? '10% Member Discount' : null
    };
  }

  return baseInfo;
};

// 修改 generateOrderInfo
const generateOrderInfo = (category: BusinessCategory) => {
  const baseInfo = {
    orderNumber: generateOrderNumber(),
    timestamp: generateReceiptTime(category)
  };

  switch (category) {
    case 'restaurant':
    case 'pizzeria':
      return {
        ...baseInfo,
        tableNumber: Math.floor(Math.random() * 30) + 1,
        serverName: `Server #${generateStaffId()}`,
        guestCount: Math.floor(Math.random() * 4) + 1
      };
    case 'cafe':
      return {
        ...baseInfo,
        barista: `Barista #${generateStaffId()}`,
        orderType: Math.random() > 0.5 ? 'Dine In' : 'To Go'
      };
    case 'fastfood':
      return {
        ...baseInfo,
        orderType: Math.random() > 0.7 ? 'Drive Thru' : 'Counter',
        orderNumber: `#${Math.floor(Math.random() * 100)}`
      };
    case 'retail':
      return {
        ...baseInfo,
        cashier: `Cashier #${generateStaffId()}`
      };
    case 'service':
      return {
        ...baseInfo,
        serviceProvider: `Provider #${generateStaffId()}`
      };
    default:
      return baseInfo;
  }
};

// 修改 generateDefaultItems
const generateDefaultItems = (
  template: TemplateType & { category: BusinessCategory },
  totalAmount: number
): Array<{name: string; quantity: number; price: number; total: number}> => {
  const items = template.defaultItems || [];
  const result = [];
  let remainingAmount = totalAmount;
  const usedItems = new Set<number>();  // 跟踪已使用的商品，避免重复

  while (remainingAmount > 5 && usedItems.size < items.length) {  // 保留至少$5用于最后一个商品
    // 选择一个未使用的随机商品
    let availableItems = items.filter((_, index) => !usedItems.has(index));
    const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    const itemIndex = items.indexOf(randomItem);
    usedItems.add(itemIndex);

    // 根据价格范围生成随机价格
    const price = getRandomPrice(randomItem.priceRange[0], randomItem.priceRange[1]);
    
    // 根据剩余金额决定数量
    const maxQuantity = Math.floor(remainingAmount / price);
    const quantity = Math.max(1, Math.min(maxQuantity, 
      // 根据商品类型限制最大数量
      template.category === 'restaurant' ? 2 : 
      template.category === 'retail' ? 3 : 4
    ));

    const total = parseFloat((price * quantity).toFixed(2));
    
    if (total <= remainingAmount) {
      result.push({
        name: randomItem.name,
        quantity,
        price,
        total
      });
      remainingAmount -= total;
    }
  }

  // 如果还有剩余金额，添加一个最后的商品
  if (remainingAmount > 0 && items.length > 0) {
    const lastItem = items[Math.floor(Math.random() * items.length)];
    const quantity = 1;
    const price = parseFloat(remainingAmount.toFixed(2));
    
    result.push({
      name: lastItem.name,
      quantity,
      price,
      total: price
    });
  }

  return result;
};

// 确保所有需要的函数都在这里导出
export {
  generateOrderNumber,
  generateLastFourDigits,
  generateAuthCode,
  generateTerminalId,
  generateStaffId,
  generateReceiptBarcode,
  generateDepartmentCode,
  generateDefaultItems,
  generateReceiptTime,
  generatePaymentInfo,
  generateItemDescription,
  categorizeItems,
  generateSerialNumber,
  generateFoodDescription,
  generateRestaurantPaymentInfo,
  generateOrderInfo
}; 