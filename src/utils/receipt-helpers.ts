// 生成随机数和格式化函数
export const generateOrderNumber = () => Math.random().toString(36).substr(2, 8).toUpperCase();
export const generateLastFourDigits = () => Math.floor(1000 + Math.random() * 9000).toString();
export const generateAuthCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();
export const generateTerminalId = () => 'TERM' + Math.floor(100 + Math.random() * 900);
export const generateStaffId = () => Math.floor(100 + Math.random() * 900);

export const generateReceiptBarcode = () => (
  <div className="mt-2 text-center">
    <div className="font-mono text-xs">
      {Array(12).fill(0).map(() => Math.floor(Math.random() * 10)).join('')}
    </div>
  </div>
);

// 根据商户类型和总金额生成合理的消费条目
export const generateDefaultItems = (
  template: TemplateType,
  totalAmount: number
): Array<{name: string; quantity: number; price: number; total: number}> => {
  const items = template.defaultItems || [];
  const result = [];
  let remainingAmount = totalAmount;
  
  while (remainingAmount > 0 && items.length > 0) {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const price = randomItem.typical;
    const maxQuantity = Math.floor(remainingAmount / price);
    const quantity = Math.max(1, Math.min(maxQuantity, 3)); // 限制单个商品最大数量为3
    
    result.push({
      name: randomItem.name,
      quantity,
      price,
      total: price * quantity
    });
    
    remainingAmount -= price * quantity;
  }
  
  // 调整最后一个商品的价格以匹配总金额
  if (result.length > 0) {
    const totalGenerated = result.reduce((sum, item) => sum + item.total, 0);
    const difference = totalAmount - totalGenerated;
    
    if (Math.abs(difference) < 10) { // 如果差额不太大
      const lastItem = result[result.length - 1];
      const newPrice = (lastItem.total + difference) / lastItem.quantity;
      lastItem.price = parseFloat(newPrice.toFixed(2));
      lastItem.total = parseFloat((lastItem.price * lastItem.quantity).toFixed(2));
    }
  }
  
  return result;
}; 