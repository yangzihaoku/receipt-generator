"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// 定义票据数据的接口
interface ReceiptData {
  merchant: string;
  address: string;
  phone: string;
  date: string;
  amount: string;
  taxRate: number;
  tipRate: number;
  subtotal: string;
  tax: string;
  tip: string;
}

// 定义模板类型
type TemplateType = 'thermal' | 'pos' | 'modern';

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

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('thermal');
  const [receiptContent, setReceiptContent] = useState<React.ReactNode | null>(null);

  // 模板定义
  const templates = useMemo(() => ({
    thermal: (data: ReceiptData) => (
      <div className="p-6 bg-white font-mono text-sm">
        <div className="text-center mb-4">
          <div className="text-lg font-bold">{data.merchant}</div>
          <div>{data.address}</div>
          <div>{data.phone}</div>
        </div>
        <div className="border-t border-b border-dashed py-2 my-2">
          <div>Date: {data.date}</div>
        </div>
        <div className="space-y-1 my-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
          <div className="flex justify-between">
            <span>Tip ({data.tipRate}%)</span>
            <span>${data.tip}</span>
          </div>
        </div>
        <div className="border-t border-dashed pt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${data.amount}</span>
          </div>
        </div>
        <div className="text-center mt-4 text-xs">
          <div>Thank you for your business!</div>
        </div>
      </div>
    ),
    pos: (data: ReceiptData) => (
      <div className="p-6 bg-white font-sans">
        <div className="text-center mb-4">
          <div className="text-xl font-bold">{data.merchant}</div>
          <div className="text-gray-600">{data.address}</div>
          <div className="text-gray-600">{data.phone}</div>
        </div>
        <div className="border-t border-gray-200 py-2">
          <div className="text-gray-600">Date: {data.date}</div>
        </div>
        <div className="space-y-2 my-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tip ({data.tipRate}%)</span>
            <span>${data.tip}</span>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${data.amount}</span>
          </div>
        </div>
        <div className="text-center mt-4 text-gray-500">
          <div>Thank you for your business!</div>
        </div>
      </div>
    ),
    modern: (data: ReceiptData) => (
      <div className="p-6 bg-white border rounded-lg shadow-sm font-sans">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-gray-800">{data.merchant}</div>
          <div className="text-gray-600">{data.address}</div>
          <div className="text-gray-600">{data.phone}</div>
        </div>
        <div className="border-t border-gray-200 py-4">
          <div className="flex justify-between text-gray-600">
            <span>Date:</span>
            <span>{data.date}</span>
          </div>
        </div>
        <div className="space-y-2 my-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-lg">${data.subtotal}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Tax ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Tip ({data.tipRate}%)</span>
            <span>${data.tip}</span>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Total</span>
            <span className="text-2xl font-bold">${data.amount}</span>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500">
          <div>Thank you for your business!</div>
          <div className="text-sm mt-2">www.example.com</div>
        </div>
      </div>
    )
  }), []);

  // 商户搜索函数
  const searchMerchant = useCallback(async (query: string) => {
    if (!query || query.length < 3) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(query)}&t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results?.length > 0) {
        const place = data.results[0];
        
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
        toast({
          title: "No Results",
          description: `No information found for "${query}"`,
          variant: "destructive",
        });
      }
    } catch (error) {
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

  // 导出为PDF
  const exportToPDF = async () => {
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

  // 处理商户名称输入
  const handleMerchantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTransaction(prev => ({ ...prev, merchant: value }));
    searchMerchant(value);
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

  // 处理模板变更
  const handleTemplateChange = (value: TemplateType) => {
    setSelectedTemplate(value);
  };

  useEffect(() => {
    if (transaction.amount) {
      calculateAmounts(transaction.amount, transaction.taxRate, transaction.tipRate);
    }
  }, [transaction.amount, transaction.taxRate, transaction.tipRate, calculateAmounts]);

  useEffect(() => {
    if (selectedTemplate && transaction) {
      setReceiptContent(templates[selectedTemplate as keyof typeof templates](transaction));
    }
  }, [selectedTemplate, transaction, templates]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Receipt Details</h2>
            
            <div className="relative">
              <Input
                placeholder="Merchant Name"
                value={transaction.merchant}
                onChange={handleMerchantChange}
                className="w-full"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
            
            <Input
              placeholder="Address (123 Main St, City, State ZIP)"
              value={transaction.address}
              onChange={(e) => setTransaction(prev => ({ ...prev, address: e.target.value }))}
              className="w-full"
            />
            
            <Input
              placeholder="Phone (+1 123-456-7890)"
              value={transaction.phone}
              onChange={(e) => setTransaction(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full"
            />
            
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                value={transaction.date}
                onChange={(e) => setTransaction({...transaction, date: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                value={transaction.amount}
                onChange={(e) => setTransaction({...transaction, amount: e.target.value})}
                placeholder="Enter total amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
              <Input
                type="number"
                step="0.001"
                value={transaction.taxRate}
                onChange={handleTaxRateChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tip Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={transaction.tipRate}
                onChange={handleTipRateChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Receipt Style</label>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">Thermal Printer Style</SelectItem>
                  <SelectItem value="pos">POS Terminal Style</SelectItem>
                  <SelectItem value="modern">Modern Style</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={exportToPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <div className="border rounded bg-gray-50 p-4">
              <div ref={receiptRef}>
                {receiptContent}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptGenerator;