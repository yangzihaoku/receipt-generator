"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TemplateType, receiptTemplates } from '@/templates/receipt-templates';
import { generateDefaultItems } from '@/utils/receipt-helpers';

// 定义票据数据的接口
interface ReceiptData {
  merchant: string;
  address: string;
  phone: string;
  date: string;
  time?: string;
  amount: string;
  taxRate: number;
  tipRate: number;
  subtotal: string;
  tax: string;
  tip: string;
  orderNumber?: string;
  cashier?: string;
  terminal?: string;
  paymentMethod?: string;
  cardNumber?: string;
  authCode?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  // 可选项
  hasLogo?: boolean;
  showItems?: boolean;
  showPaymentDetails?: boolean;
  showOrderNumber?: boolean;
}

// 辅助函数
const generateReceiptBarcode = () => (
  <div className="mt-2 text-center">
    <div className="font-mono text-xs">
      {Array(12).fill(0).map(() => Math.floor(Math.random() * 10)).join('')}
    </div>
  </div>
);

// 添加模板预览组件
const TemplatePreview: React.FC<{
  template: TemplateType;
  selected: boolean;
  onSelect: () => void;
}> = ({ template, selected, onSelect }) => (
  <div
    className={`border rounded-lg p-4 cursor-pointer transition-all ${
      selected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
    }`}
    onClick={onSelect}
  >
    <img
      src={template.preview}
      alt={template.name}
      className="w-full h-40 object-contain mb-2"
    />
    <h3 className="font-medium">{template.name}</h3>
    <p className="text-sm text-gray-600">{template.description}</p>
  </div>
);

// 在 ReceiptGenerator 组件中添加模板选择部分
const TemplateSelector: React.FC<{
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ selectedId, onSelect }) => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    {Object.values(receiptTemplates).map(template => (
      <TemplatePreview
        key={template.id}
        template={template}
        selected={template.id === selectedId}
        onSelect={() => onSelect(template.id)}
      />
    ))}
  </div>
);

const ReceiptGenerator = () => {
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [transaction, setTransaction] = useState<ReceiptData>({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    merchant: '',
    address: '',
    phone: '',
    taxRate: 8.875,
    tipRate: 15,
    subtotal: '',
    tax: '',
    tip: ''
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(Object.keys(receiptTemplates)[0]);
  const [receiptContent, setReceiptContent] = useState<React.ReactNode | null>(null);

  // 在 ReceiptGenerator 组件中添加配置选项
  const [receiptOptions, setReceiptOptions] = useState({
    hasLogo: true,
    showItems: true,
    showPaymentDetails: true,
    showOrderNumber: true,
  });

  // 在 ReceiptGenerator 组件中添加商品管理
  const [items, setItems] = useState<Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>>([]);

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    price: 0
  });

  // 商户搜索函数
  const searchMerchant = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      console.log('Query too short, skipping search');
      return;
    }
    
    console.log('Starting merchant search for:', query);
    setIsSearching(true);
    try {
      const url = `/api/places/search?query=${encodeURIComponent(query)}&t=${Date.now()}`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url);
      console.log('Search response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      
      if (data.results?.length > 0) {
        const place = data.results[0];
        console.log('Found place:', place);
        
        setTransaction(prev => ({
          ...prev,
          merchant: place.name || query,
          address: place.formatted_address || '',
          phone: place.formatted_phone_number || ''
        }));

        toast({
          title: "Success",
          description: "Merchant information found and filled",
        });
      } else {
        console.log('No results found');
        toast({
          title: "No Results",
          description: `No information found for "${query}"`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch merchant information",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // 计算金额
  const calculateAmounts = useCallback((total: string, taxRate: number, tipRate: number) => {
    const totalAmount = parseFloat(total);
    if (isNaN(totalAmount)) return;

    const taxMultiplier = 1 + (taxRate / 100);
    const subtotal = (totalAmount / taxMultiplier).toFixed(2);
    const tax = (totalAmount - parseFloat(subtotal)).toFixed(2);
    const tip = ((parseFloat(subtotal) * tipRate) / 100).toFixed(2);

    setTransaction(prev => ({
      ...prev,
      subtotal,
      tax,
      tip
    }));
  }, []);

  // 将 exportToPDF 重命名为 generatePDF 以保持一致性
  const generatePDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });

      // 设置PDF元数据
      pdf.setProperties({
        title: `Receipt - ${transaction.merchant}`,
        subject: `Receipt for ${transaction.amount} from ${transaction.merchant}`,
        author: 'Receipt Generator',
        keywords: 'receipt, invoice',
        creator: 'Receipt Generator'
      });

      // 计算图像尺寸以适应A4页面
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const aspectRatio = canvas.height / canvas.width;
      
      let imgWidth = pageWidth - 40; // 左右各留20mm边距
      let imgHeight = imgWidth * aspectRatio;
      
      // 如果图像高度超过页面高度，按高度调整
      if (imgHeight > pageHeight - 40) {
        imgHeight = pageHeight - 40;
        imgWidth = imgHeight / aspectRatio;
      }
      
      // 居中放置图像
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // 添加页脚
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      const footerText = `Generated on ${new Date().toLocaleString()}`;
      pdf.text(footerText, pageWidth/2, pageHeight - 10, { align: 'center' });

      pdf.save(`receipt-${transaction.merchant}-${transaction.date}.pdf`);

      toast({
        title: "Success",
        description: "Receipt has been exported to PDF",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  // 修改商户名称输入处理函数
  const handleMerchantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Merchant name changed:', value);
    
    setTransaction(prev => ({ ...prev, merchant: value }));
    
    // 只有当输入长度大于等于3时才触发搜索
    if (value.length >= 3) {
      console.log('Triggering search for:', value);
      searchMerchant(value);
    } else {
      console.log('Input too short, waiting for more characters');
    }
  };

  // 处理税率变化
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTransaction(prev => ({
      ...prev,
      taxRate: isNaN(value) ? 0 : value
    }));
  };

  // 处理小费率变化
  const handleTipRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTransaction(prev => ({
      ...prev,
      tipRate: isNaN(value) ? 0 : value
    }));
  };

  // 更新模板变更处理函数
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  useEffect(() => {
    if (transaction.amount) {
      calculateAmounts(transaction.amount, transaction.taxRate, transaction.tipRate);
    }
  }, [transaction.amount, transaction.taxRate, transaction.tipRate, calculateAmounts]);

  // 更新 useEffect
  useEffect(() => {
    if (selectedTemplateId && transaction) {
      const template = receiptTemplates[selectedTemplateId];
      if (template) {
        setReceiptContent(template.render({
          ...transaction,
          items: items,
          ...receiptOptions
        }));
      }
    }
  }, [selectedTemplateId, transaction, items, receiptOptions]);

  // 修改生成图片功能
  const generateImage = async () => {
    const receiptElement = document.getElementById('receipt');
    if (receiptElement) {
      try {
        const canvas = await html2canvas(receiptElement, {
          scale: 2, // 提高清晰度
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff',
          imageTimeout: 0,
          removeContainer: true,
          allowTaint: true,
        });
        
        // 优化图片质量
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // 使用文件名格式化
        const fileName = `receipt-${transaction.merchant}-${
          new Date().toISOString().split('T')[0]
        }.png`;
        
        const link = document.createElement('a');
        link.href = imgData;
        link.download = fileName;
        link.click();
        
        toast({
          title: "成功",
          description: "小票图片已生成",
        });
      } catch (err) {
        toast({
          title: "错误",
          description: "生成图片时出错",
          variant: "destructive",
        });
      }
    }
  };

  // 添加商品项目编辑UI
  const ItemsEditor = () => (
    <div className="mt-6 border rounded-lg p-4">
      <h3 className="font-medium mb-4">Items</h3>
      
      {/* 添加新商品 */}
      <div className="grid grid-cols-12 gap-2 mb-4">
        <div className="col-span-5">
          <Input
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({
              ...prev,
              name: e.target.value
            }))}
          />
        </div>
        <div className="col-span-2">
          <Input
            type="number"
            min="1"
            placeholder="Qty"
            value={newItem.quantity}
            onChange={(e) => setNewItem(prev => ({
              ...prev,
              quantity: parseInt(e.target.value) || 1
            }))}
          />
        </div>
        <div className="col-span-3">
          <Input
            type="number"
            step="0.01"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem(prev => ({
              ...prev,
              price: parseFloat(e.target.value) || 0
            }))}
          />
        </div>
        <div className="col-span-2">
          <Button
            onClick={() => {
              if (newItem.name && newItem.price > 0) {
                const total = newItem.quantity * newItem.price;
                setItems(prev => [...prev, { ...newItem, total }]);
                setNewItem({ name: '', quantity: 1, price: 0 });
                
                // 更新总金额
                const newTotal = items.reduce((sum, item) => sum + item.total, 0) + total;
                setTransaction(prev => ({
                  ...prev,
                  amount: newTotal.toFixed(2)
                }));
              }
            }}
            className="w-full"
          >
            Add
          </Button>
        </div>
      </div>

      {/* 商品列表 */}
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 text-sm">
              <div className="col-span-5">{item.name}</div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-right">${item.price.toFixed(2)}</div>
              <div className="col-span-2 text-right">${item.total.toFixed(2)}</div>
              <div className="col-span-1">
                <button
                  onClick={() => {
                    setItems(prev => prev.filter((_, i) => i !== index));
                    // 更新总金额
                    const newTotal = items
                      .filter((_, i) => i !== index)
                      .reduce((sum, item) => sum + item.total, 0);
                    setTransaction(prev => ({
                      ...prev,
                      amount: newTotal.toFixed(2)
                    }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 当商户信息更新或总金额更新时，生成默认消费条目
  useEffect(() => {
    if (transaction.merchant && transaction.amount && selectedTemplateId) {
      const template = receiptTemplates[selectedTemplateId];
      const generatedItems = generateDefaultItems(template, parseFloat(transaction.amount));
      setItems(generatedItems);
    }
  }, [transaction.merchant, transaction.amount, selectedTemplateId]);

  return (
    <div className="layout-container">
      <Card className="card-layout">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左侧面板：所有设置选项 */}
            <div className="space-y-6 form-section">
              <div>
                <h2 className="text-2xl font-bold mb-6">Receipt Details</h2>
                
                {/* 商户信息部分 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Name</label>
                    <Input
                      value={transaction.merchant}
                      onChange={handleMerchantChange}
                      placeholder="Enter business name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <Input
                      value={transaction.address}
                      onChange={(e) => setTransaction({...transaction, address: e.target.value})}
                      placeholder="Enter address"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={transaction.phone}
                      onChange={(e) => setTransaction({...transaction, phone: e.target.value})}
                      placeholder="Enter phone number"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* 模板选择部分 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Receipt Template</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.values(receiptTemplates).map(template => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedTemplateId === template.id ? 'border-primary bg-primary/5' : 'hover:border-gray-400'
                      }`}
                      onClick={() => handleTemplateChange(template.id)}
                    >
                      <div className="aspect-[4/3] relative mb-2">
                        <img
                          src={template.preview}
                          alt={template.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 金额和税率设置 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Amount & Tax</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Amount ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={transaction.amount}
                      onChange={(e) => setTransaction({...transaction, amount: e.target.value})}
                      placeholder="Enter total amount"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                    <Input
                      type="number"
                      step="0.001"
                      value={transaction.taxRate}
                      onChange={handleTaxRateChange}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* 选项设置 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Receipt Options</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={receiptOptions.hasLogo}
                      onChange={e => setReceiptOptions(prev => ({ ...prev, hasLogo: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span>Include Logo</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={receiptOptions.showItems}
                      onChange={e => setReceiptOptions(prev => ({ ...prev, showItems: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span>Show Items</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={receiptOptions.showPaymentDetails}
                      onChange={e => setReceiptOptions(prev => ({ ...prev, showPaymentDetails: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span>Payment Details</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={receiptOptions.showOrderNumber}
                      onChange={e => setReceiptOptions(prev => ({ ...prev, showOrderNumber: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span>Order Number</span>
                  </label>
                </div>
              </div>

              {/* 商品管理部分 */}
              {receiptOptions.showItems && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Items Management</h3>
                  <ItemsEditor />
                </div>
              )}
            </div>

            {/* 右侧面板：预览和下载 */}
            <div className="relative">
              <div className="sticky top-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Preview</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={generateImage}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                    <Button
                      onClick={generatePDF}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg bg-gray-50 p-4">
                  <div ref={receiptRef} className="bg-white shadow-lg mx-auto" style={{ maxWidth: '380px' }}>
                    {receiptContent}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptGenerator;