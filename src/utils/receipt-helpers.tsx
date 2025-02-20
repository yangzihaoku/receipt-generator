import React from 'react';
import type { TemplateType } from '@/templates/receipt-templates';

// 定义本地的 BusinessCategory 类型
type BusinessCategory = 'restaurant' | 'retail' | 'service' | 'cafe' | 'pizzeria' | 'fastfood';

// 生成随机数和格式化函数
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `${year}${month}${day}-${random}`;
};

const generateLastFourDigits = () => Math.floor(1000 + Math.random() * 9000).toString();
const generateAuthCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();
const generateTerminalId = () => {
  const storeNum = Math.floor(1000 + Math.random() * 9000);
  const termNum = Math.floor(1 + Math.random() * 9);
  return `${storeNum}-${termNum}`;
};

// 添加员工ID生成逻辑
const generateStaffId = () => {
  const prefix = ['S', 'W', 'M'][Math.floor(Math.random() * 3)]; // Server, Waiter, Manager
  const id = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${id}`;
};

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

// 修改函数定义，添加类型注解
const generateReceiptTime = (category: string) => {
  const now = new Date();
  const currentHour = now.getHours();
  
  // 使用 Record 和字符串字面量类型
  type BusinessHours = Record<string, { open: number; close: number }>;
  
  const businessHours: BusinessHours = {
    'restaurant': { open: 11, close: 23 },
    'retail': { open: 9, close: 18 },
    'service': { open: 9, close: 18 },
    'cafe': { open: 6, close: 21 },
    'pizzeria': { open: 11, close: 23 },
    'fastfood': { open: 10, close: 22 }
  };

  // 使用类型断言来确保类型安全
  const storeHours = businessHours[category as keyof BusinessHours] || { open: 9, close: 21 };
  
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

// 添加更多支付方式选项
const PaymentMethods = {
  CREDIT: {
    types: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'],
    entryMethods: ['CHIP', 'SWIPE', 'TAP', 'MANUAL'],
    prefix: 'xxxx-xxxx-xxxx-'
  },
  DEBIT: {
    types: ['VISA DEBIT', 'MASTERCARD DEBIT', 'INTERAC'],
    entryMethods: ['CHIP', 'SWIPE', 'TAP'],
    prefix: 'xxxx-xxxx-xxxx-'
  },
  MOBILE: {
    types: ['APPLE PAY', 'GOOGLE PAY', 'SAMSUNG PAY'],
    entryMethods: ['TAP', 'QR'],
    prefix: 'MOBILE-'
  }
};

// 改进支付信息生成
const generatePaymentInfo = (amount: number, category: string) => {
  // 随机选择支付方式
  const paymentType = Math.random() > 0.3 ? 'CREDIT' : 
    Math.random() > 0.5 ? 'DEBIT' : 'MOBILE';
  const paymentMethod = PaymentMethods[paymentType];
  
  // 生成基本支付信息
  const baseInfo = {
    method: paymentMethod.types[Math.floor(Math.random() * paymentMethod.types.length)],
    entryMethod: paymentMethod.entryMethods[Math.floor(Math.random() * paymentMethod.entryMethods.length)],
    cardNumber: paymentType === 'MOBILE' ? 
      `${paymentMethod.prefix}${generateAuthCode()}` :
      `${paymentMethod.prefix}${generateLastFourDigits()}`,
    authCode: generateAuthCode(),
    approvalCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
    transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
    paymentStatus: 'APPROVED',
    processingFee: (amount * 0.029 + 0.30).toFixed(2)
  };

  // 修改商户类型特定信息的判断
  const categorySpecificInfo: Record<string, any> = {
    restaurant: {
      tipSuggestions: {
        '15%': (amount * 0.15).toFixed(2),
        '18%': (amount * 0.18).toFixed(2),
        '20%': (amount * 0.20).toFixed(2)
      },
      tableService: true
    },
    retail: {
      cashback: '0.00',
      rewardsEarned: Math.floor(amount * 10),
      membershipTier: Math.random() > 0.7 ? 'GOLD' : 'REGULAR'
    },
    service: {
      appointmentId: `APT-${generateAuthCode()}`,
      serviceType: 'STANDARD'
    }
  };

  return {
    ...baseInfo,
    ...(categorySpecificInfo[category] || {})
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
const generateRestaurantPaymentInfo = (amount: number, category: string) => {
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
const generateOrderInfo = (category: string) => {
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

// 修改 generateDefaultItems 函数
const generateDefaultItems = (
  template: TemplateType,
  totalAmount: number
): Array<{name: string; quantity: number; price: number; total: number}> => {
  const items = template.defaultItems || [];
  const result = [];
  let remainingAmount = totalAmount;
  const usedItems = new Set<number>();

  // 根据类别确定最大数量
  const getMaxQuantityByCategory = (category: string): number => {
    switch (category) {
      case 'restaurant':
        return 2;
      case 'retail':
        return 3;
      default:
        return 4;
    }
  };

  while (remainingAmount > 5 && usedItems.size < items.length) {
    let availableItems = items.filter((_: any, index: number) => !usedItems.has(index));
    const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    const itemIndex = items.indexOf(randomItem);
    usedItems.add(itemIndex);

    const price = getRandomPrice(randomItem.priceRange[0], randomItem.priceRange[1]);
    const maxQuantity = Math.floor(remainingAmount / price);
    const quantity = Math.max(1, Math.min(
      maxQuantity,
      getMaxQuantityByCategory(template.category)
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

// 修改 calculateTax 函数的类型定义
const calculateTax = (amount: number, location: string = 'NY') => {
  type TaxRates = Record<string, number>;
  
  const taxRates: TaxRates = {
    'NY': 8.875,
    'CA': 7.25,
    'TX': 6.25,
    'FL': 6.0,
  };

  // 使用类型断言
  const taxRate = taxRates[location as keyof TaxRates] || 8.0;
  const taxAmount = parseFloat((amount * (taxRate / 100)).toFixed(2));

  return {
    taxRate,
    taxAmount,
    breakdown: {
      stateTax: parseFloat((taxAmount * 0.7).toFixed(2)),
      localTax: parseFloat((taxAmount * 0.3).toFixed(2))
    }
  };
};

// 添加小费计算辅助函数
const calculateTip = (amount: number, percentage: number = 15) => {
  const tipAmount = parseFloat((amount * (percentage / 100)).toFixed(2));
  const totalWithTip = parseFloat((amount + tipAmount).toFixed(2));

  return {
    tipPercentage: percentage,
    tipAmount,
    totalWithTip,
    perPerson: (guests: number) => ({
      tip: parseFloat((tipAmount / guests).toFixed(2)),
      total: parseFloat((totalWithTip / guests).toFixed(2))
    })
  };
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