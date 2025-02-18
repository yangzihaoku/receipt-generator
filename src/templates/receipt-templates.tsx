import { ReceiptData } from '@/types/receipt';
import { 
  generateOrderNumber, 
  generateLastFourDigits, 
  generateAuthCode, 
  generateTerminalId, 
  generateStaffId, 
  generateReceiptBarcode, 
  generateDepartmentCode 
} from '@/utils/receipt-helpers';

export interface TemplateType {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'retail' | 'restaurant' | 'service';
  defaultItems?: Array<{
    name: string;
    priceRange: [number, number];
    typical: number;
  }>;
  render: (data: ReceiptData) => React.ReactNode;
}

export const receiptTemplates: Record<string, TemplateType> = {
  retail: {
    id: 'retail',
    name: 'Retail Receipt',
    description: 'Standard retail store receipt format',
    preview: '/previews/retail.png',
    category: 'retail',
    defaultItems: [
      { name: 'T-Shirt', priceRange: [15.99, 29.99], typical: 19.99 },
      { name: 'Jeans', priceRange: [39.99, 79.99], typical: 49.99 },
      { name: 'Socks', priceRange: [5.99, 12.99], typical: 8.99 },
    ],
    render: (data: ReceiptData) => (
      <div className="p-6 bg-white font-mono text-sm" suppressHydrationWarning>
        <div className="text-center mb-4">
          {data.hasLogo && <img src="/images/logos/retail-logo.png" alt="Logo" className="h-12 mx-auto mb-2" />}
          <div className="text-lg font-bold uppercase">{data.merchant}</div>
          <div>{data.address}</div>
          <div>{data.phone}</div>
        </div>
        <div className="text-xs mb-4">
          <div>Date: {data.date}</div>
          <div>Time: {data.time || new Date().toLocaleTimeString()}</div>
          {data.showOrderNumber && (
            <div>Order #: {data.orderNumber || generateOrderNumber()}</div>
          )}
          <div>Cashier: {data.cashier || `STAFF ${generateStaffId()}`}</div>
        </div>
        
        {data.showItems && data.items && data.items.length > 0 && (
          <div className="border-t border-b border-dashed py-2 mb-4">
            {data.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-1 text-sm mb-1">
                <div className="col-span-6">{item.name}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">${item.price.toFixed(2)}</div>
                <div className="col-span-2 text-right">${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
        </div>

        <div className="border-t border-dashed pt-2 mb-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${data.amount}</span>
          </div>
        </div>

        {data.showPaymentDetails && (
          <div className="text-sm mb-4">
            <div>Payment Method: {data.paymentMethod || 'Credit Card'}</div>
            <div>Card: {data.cardNumber || '**** **** **** ' + generateLastFourDigits()}</div>
            <div>Auth Code: {data.authCode || generateAuthCode()}</div>
            <div>Terminal ID: {data.terminal || generateTerminalId()}</div>
          </div>
        )}

        <div className="text-center text-xs mt-4">
          <div>Thank you for your business!</div>
          <div className="mt-1">Please keep this receipt for your records</div>
          {generateReceiptBarcode()}
        </div>
      </div>
    )
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant Receipt',
    description: 'Restaurant-style receipt with table and server details',
    preview: '/previews/restaurant.png',
    category: 'restaurant',
    defaultItems: [
      { name: 'Burger & Fries', priceRange: [12.99, 18.99], typical: 15.99 },
      { name: 'Caesar Salad', priceRange: [9.99, 14.99], typical: 11.99 },
      { name: 'Pasta Dish', priceRange: [14.99, 24.99], typical: 18.99 },
      { name: 'Soft Drink', priceRange: [2.99, 4.99], typical: 3.99 },
      { name: 'Dessert', priceRange: [5.99, 9.99], typical: 7.99 },
    ],
    render: (data: ReceiptData) => (
      <div className="p-6 bg-white font-sans" suppressHydrationWarning>
        <div className="text-center mb-4">
          {data.hasLogo && <img src="/images/logos/restaurant-logo.png" alt="Logo" className="h-16 mx-auto mb-2" />}
          <div className="text-xl font-bold">{data.merchant}</div>
          <div className="text-gray-600 whitespace-pre-line">{data.address}</div>
          <div className="text-gray-600">{data.phone}</div>
        </div>
        <div className="border-t border-b border-gray-200 py-2 my-4">
          <div className="flex justify-between">
            <span>Order #:</span>
            <span>{data.orderNumber || generateOrderNumber()}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{data.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Table:</span>
            <span>{Math.floor(Math.random() * 30) + 1}</span>
          </div>
          <div className="flex justify-between">
            <span>Server:</span>
            <span>STAFF {generateStaffId()}</span>
          </div>
        </div>

        {data.showItems && data.items && data.items.length > 0 && (
          <div className="space-y-2 mb-4">
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 ml-2">x{item.quantity}</span>
                </div>
                <div className="text-right">${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 my-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${data.amount}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-2 mt-4">
          <div className="text-sm">
            <div className="text-center mb-2">Suggested Gratuity</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div>15%</div>
                <div>${(parseFloat(data.subtotal) * 0.15).toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div>18%</div>
                <div>${(parseFloat(data.subtotal) * 0.18).toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div>20%</div>
                <div>${(parseFloat(data.subtotal) * 0.20).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {data.showPaymentDetails && (
          <div className="mt-4 text-sm text-gray-600">
            <div>Payment Method: Credit Card</div>
            <div>Card #: **** **** **** {generateLastFourDigits()}</div>
            <div>Auth Code: {generateAuthCode()}</div>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-500">
          <div>Thank you for dining with us!</div>
          <div className="mt-1">Please come again</div>
          {generateReceiptBarcode()}
        </div>
      </div>
    )
  },
  cafe: {
    id: 'cafe',
    name: 'Cafe Receipt',
    description: 'Quick service cafe receipt with order number',
    preview: '/previews/cafe.png',
    category: 'service',
    defaultItems: [
      { name: 'Latte', priceRange: [3.99, 5.99], typical: 4.99 },
      { name: 'Cappuccino', priceRange: [3.99, 5.99], typical: 4.99 },
      { name: 'Croissant', priceRange: [2.99, 4.99], typical: 3.99 },
      { name: 'Muffin', priceRange: [2.49, 3.99], typical: 2.99 },
      { name: 'Sandwich', priceRange: [7.99, 12.99], typical: 9.99 },
      { name: 'Cookie', priceRange: [1.99, 3.99], typical: 2.49 },
    ],
    render: (data: ReceiptData) => (
      <div className="p-6 bg-white font-mono text-sm" suppressHydrationWarning>
        <div className="text-center mb-4">
          {data.hasLogo && <img src="/images/logos/cafe-logo.png" alt="Logo" className="h-14 mx-auto mb-2" />}
          <div className="text-lg font-bold">{data.merchant}</div>
          <div>{data.address}</div>
          <div>{data.phone}</div>
        </div>

        {data.showItems && data.items && data.items.length > 0 && (
          <div className="border-t border-dashed py-2">
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm mb-1">
                <div>
                  {item.name} x{item.quantity}
                </div>
                <div>${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dashed py-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
        </div>

        <div className="border-t border-dashed pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${data.amount}</span>
          </div>
        </div>

        {data.showPaymentDetails && (
          <div className="mt-4 text-xs text-center">
            <div>Member #: **** {generateLastFourDigits()}</div>
            <div>Points Earned: {Math.floor(parseFloat(data.amount) * 10)}</div>
          </div>
        )}

        <div className="mt-4 text-center text-xs">
          <div>Thank you for your visit!</div>
          <div className="mt-1">See you again soon</div>
          {generateReceiptBarcode()}
        </div>
      </div>
    )
  },
  convenience: {
    id: 'convenience',
    name: 'Convenience Store',
    description: 'Quick stop convenience store receipt',
    preview: '/previews/convenience.png',
    category: 'retail',
    defaultItems: [
      { name: 'Snacks', priceRange: [1.99, 4.99], typical: 2.99 },
      { name: 'Soft Drinks', priceRange: [1.49, 2.99], typical: 1.99 },
      { name: 'Candy Bar', priceRange: [0.99, 1.99], typical: 1.49 },
      { name: 'Energy Drink', priceRange: [2.99, 4.99], typical: 3.99 },
      { name: 'Chips', priceRange: [1.99, 4.99], typical: 2.99 },
    ],
    render: (data: ReceiptData) => (
      <div className="p-6 bg-white font-mono text-sm" suppressHydrationWarning>
        <div className="text-center mb-4">
          {data.hasLogo && <img src="/images/logos/convenience-logo.png" alt="Logo" className="h-12 mx-auto mb-2" />}
          <div className="text-lg font-bold">{data.merchant}</div>
          <div>{data.address}</div>
          <div>{data.phone}</div>
        </div>

        {data.showItems && data.items && data.items.length > 0 && (
          <div className="border-t border-dashed py-2">
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm mb-1">
                <div>
                  {item.name} x{item.quantity}
                </div>
                <div>${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dashed py-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
        </div>

        <div className="border-t border-dashed pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${data.amount}</span>
          </div>
        </div>

        {data.showPaymentDetails && (
          <div className="mt-4 text-xs text-center">
            <div>Member #: **** {generateLastFourDigits()}</div>
            <div>Points Earned: {Math.floor(parseFloat(data.amount) * 10)}</div>
          </div>
        )}

        <div className="mt-4 text-center text-xs">
          <div>Thank you for your visit!</div>
          <div className="mt-1">See you again soon</div>
          {generateReceiptBarcode()}
        </div>
      </div>
    )
  },
  fastfood: {
    id: 'fastfood',
    name: 'Fast Food',
    description: 'Quick service restaurant receipt',
    preview: '/previews/fastfood.png',
    category: 'restaurant',
    defaultItems: [
      { name: 'Combo Meal', priceRange: [7.99, 12.99], typical: 9.99 },
      { name: 'Cheeseburger', priceRange: [3.99, 6.99], typical: 4.99 },
      { name: 'French Fries', priceRange: [2.49, 4.99], typical: 2.99 },
      { name: 'Chicken Nuggets', priceRange: [4.99, 7.99], typical: 5.99 },
      { name: 'Soft Drink', priceRange: [1.49, 2.99], typical: 1.99 },
      { name: 'Ice Cream', priceRange: [0.99, 2.99], typical: 1.99 },
    ],
    render: (data: ReceiptData) => (
      <div className="p-6 bg-white font-mono text-sm" suppressHydrationWarning>
        <div className="text-center mb-4">
          {data.hasLogo && <img src="/images/logos/fastfood-logo.png" alt="Logo" className="h-12 mx-auto mb-2" />}
          <div className="text-lg font-bold">{data.merchant}</div>
          <div>{data.address}</div>
          <div>{data.phone}</div>
        </div>

        {data.showItems && data.items && data.items.length > 0 && (
          <div className="border-t border-dashed py-2">
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm mb-1">
                <div>
                  {item.name} x{item.quantity}
                </div>
                <div>${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dashed py-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
        </div>

        <div className="border-t border-dashed pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${data.amount}</span>
          </div>
        </div>

        {data.showPaymentDetails && (
          <div className="mt-4 text-xs text-center">
            <div>Member #: **** {generateLastFourDigits()}</div>
            <div>Points Earned: {Math.floor(parseFloat(data.amount) * 10)}</div>
          </div>
        )}

        <div className="mt-4 text-center text-xs">
          <div>Thank you for your visit!</div>
          <div className="mt-1">See you again soon</div>
          {generateReceiptBarcode()}
        </div>
      </div>
    )
  },
  pizzeria: {
    id: 'pizzeria',
    name: 'Pizzeria',
    description: 'Pizza restaurant receipt with delivery info',
    preview: '/previews/pizzeria.png',
    category: 'restaurant',
    defaultItems: [
      { name: 'Large Pizza', priceRange: [14.99, 24.99], typical: 18.99 },
      { name: 'Medium Pizza', priceRange: [12.99, 20.99], typical: 15.99 },
      { name: 'Garlic Knots', priceRange: [4.99, 7.99], typical: 5.99 },
      { name: 'Caesar Salad', priceRange: [7.99, 11.99], typical: 8.99 },
      { name: 'Soft Drink', priceRange: [1.99, 3.99], typical: 2.99 },
      { name: 'Wings', priceRange: [9.99, 15.99], typical: 12.99 },
    ],
    render: (data: ReceiptData) => (
      <div className="p-6 bg-white font-mono text-sm" suppressHydrationWarning>
        <div className="text-center mb-4">
          {data.hasLogo && <img src="/images/logos/pizzeria-logo.png" alt="Logo" className="h-14 mx-auto mb-2" />}
          <div className="text-lg font-bold">{data.merchant}</div>
          <div>{data.address}</div>
          <div>{data.phone}</div>
        </div>

        <div className="text-xs mb-4">
          <div className="flex justify-between">
            <span>Order #:</span>
            <span>{data.orderNumber || generateOrderNumber()}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{data.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{data.time || new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Server:</span>
            <span>STAFF {generateStaffId()}</span>
          </div>
          <div className="flex justify-between">
            <span>Order Type:</span>
            <span>{Math.random() > 0.5 ? 'DELIVERY' : 'PICKUP'}</span>
          </div>
        </div>

        {data.showItems && data.items && data.items.length > 0 && (
          <div className="border-t border-dashed py-2">
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm mb-1">
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 ml-2">x{item.quantity}</span>
                </div>
                <div className="text-right">${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dashed py-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>${(3.99).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-dashed pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${data.amount}</span>
          </div>
        </div>

        {data.showPaymentDetails && (
          <div className="mt-4 text-xs">
            <div>Payment: {data.paymentMethod || 'Credit Card'}</div>
            <div>Card #: {data.cardNumber || '**** **** **** ' + generateLastFourDigits()}</div>
            <div>Auth: {data.authCode || generateAuthCode()}</div>
          </div>
        )}

        <div className="border-t border-dashed pt-2 mt-4">
          <div className="text-sm">
            <div className="text-center mb-2">Suggested Gratuity</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div>15%</div>
                <div>${(parseFloat(data.subtotal) * 0.15).toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div>18%</div>
                <div>${(parseFloat(data.subtotal) * 0.18).toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div>20%</div>
                <div>${(parseFloat(data.subtotal) * 0.20).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs">
          <div>Thank you for choosing us!</div>
          <div className="mt-1">Hot & Fresh, Delivered to Your Door</div>
          {generateReceiptBarcode()}
        </div>
      </div>
    )
  },
  supermarket: {
    id: 'supermarket',
    name: 'Supermarket',
    description: 'Grocery store receipt with department codes',
    preview: '/previews/supermarket.png',
    category: 'retail',
    defaultItems: [
      { name: 'Fresh Produce', priceRange: [2.99, 8.99], typical: 4.99 },
      { name: 'Dairy Products', priceRange: [3.49, 6.99], typical: 4.99 },
      { name: 'Bread & Bakery', priceRange: [2.99, 5.99], typical: 3.99 },
      { name: 'Meat & Seafood', priceRange: [8.99, 25.99], typical: 15.99 },
      { name: 'Frozen Foods', priceRange: [3.99, 9.99], typical: 6.99 },
    ],
    render: (data: ReceiptData) => (
      <div className="p-6 bg-white font-mono text-sm" suppressHydrationWarning>
        <div className="text-center mb-4">
          {data.hasLogo && <img src="/images/logos/supermarket-logo.png" alt="Logo" className="h-12 mx-auto mb-2" />}
          <div className="text-lg font-bold">{data.merchant}</div>
          <div>{data.address}</div>
          <div>{data.phone}</div>
        </div>

        <div className="text-xs mb-4">
          <div>Store: {data.storeNumber || '0123'}</div>
          <div>Register: {data.registerNumber || '01'}</div>
          <div>Date: {data.date}</div>
          <div>Time: {data.time || new Date().toLocaleTimeString()}</div>
          <div>Cashier: {data.cashier || `STAFF ${generateStaffId()}`}</div>
        </div>

        {data.showItems && data.items && data.items.length > 0 && (
          <div className="border-t border-dashed py-2">
            {data.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-1 text-sm mb-1">
                <div className="col-span-1 text-gray-500">{generateDepartmentCode()}</div>
                <div className="col-span-7">{item.name}</div>
                <div className="col-span-2 text-right">{item.quantity} @ ${item.price.toFixed(2)}</div>
                <div className="col-span-2 text-right">${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dashed py-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
        </div>

        <div className="border-t border-dashed pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${data.amount}</span>
          </div>
        </div>

        {data.showPaymentDetails && (
          <div className="mt-4 text-xs">
            <div>Payment: {data.paymentMethod || 'Credit Card'}</div>
            <div>Card #: {data.cardNumber || '**** **** **** ' + generateLastFourDigits()}</div>
            <div>Auth: {data.authCode || generateAuthCode()}</div>
            <div>Terminal: {data.terminal || generateTerminalId()}</div>
          </div>
        )}

        {data.customerInfo && (
          <div className="mt-4 text-xs text-center">
            <div>Member #: {data.customerInfo.memberNumber || '**** ' + generateLastFourDigits()}</div>
            <div>Points Earned: {data.customerInfo.pointsEarned || Math.floor(parseFloat(data.amount) * 10)}</div>
            <div>Balance: {data.customerInfo.pointsBalance || Math.floor(Math.random() * 10000)}</div>
          </div>
        )}

        <div className="mt-4 text-center text-xs">
          <div>Thank you for shopping with us!</div>
          <div className="mt-1">Please keep your receipt</div>
          {generateReceiptBarcode()}
        </div>
      </div>
    )
  }
}; 