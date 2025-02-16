"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Search, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { debounce } from 'lodash';

const ReceiptGenerator = () => {
  const { toast } = useToast();
  const receiptRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  const [transaction, setTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    merchant: '',
    address: '',
    phone: '',
    taxRate: 8.375,
    tipRate: 15,
    subtotal: '',
    tax: '',
    tip: ''
  });

  const [selectedTemplate, setSelectedTemplate] = useState('thermal');
  const [previewReceipt, setPreviewReceipt] = useState(null);

  // 票据模板样式
  const receiptStyles = `
    @font-face {
      font-family: 'OCR-A';
      src: url('https://fonts.cdnfonts.com/css/ocr-a-std') format('woff2');
    }
    
    .receipt-font-ocr {
      font-family: 'OCR-A', monospace;
    }
    
    .receipt-font-thermal {
      font-family: 'Courier New', Courier, monospace;
    }
    
    .receipt-paper {
      background: linear-gradient(to right, #f9f9f9 0%, #ffffff 50%, #f9f9f9 100%);
    }
    
    .thermal-effect {
      background: repeating-linear-gradient(
        #fff,
        #fff 1px,
        #f9f9f9 1px,
        #f9f9f9 2px
      );
    }
  `;

  // 票据模板
  const templates = {
    thermal: (data) => (
      <div className="p-6 thermal-effect border rounded shadow-sm receipt-font-thermal text-sm leading-tight">
        <style>{receiptStyles}</style>
        <div className="text-center mb-4">
          <div className="font-bold text-lg tracking-wide">{data.merchant}</div>
          <div className="text-xs">{data.address || '123 Business Street'}</div>
          <div className="text-xs">{data.phone || '(555) 555-5555'}</div>
          <div className="text-xs">Tax ID: XX-XXXXXXX</div>
        </div>
        
        <div className="border-t border-dashed border-b py-2 my-2">
          <div className="flex justify-between">
            <span>ORDER #:</span>
            <span>{Math.floor(Math.random() * 10000)}</span>
          </div>
          <div className="flex justify-between">
            <span>DATE:</span>
            <span>{new Date(data.date).toLocaleDateString('en-US')}</span>
          </div>
          <div className="flex justify-between">
            <span>TIME:</span>
            <span>{new Date().toLocaleTimeString('en-US')}</span>
          </div>
        </div>
        
        <div className="my-4">
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>TAX ({data.taxRate}%)</span>
            <span>${data.tax}</span>
          </div>
          <div className="flex justify-between">
            <span>TIP ({data.tipRate}%)</span>
            <span>${data.tip}</span>
          </div>
        </div>
        
        <div className="border-t border-dashed pt-2">
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>${data.amount}</span>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs">
          <div>*** CUSTOMER COPY ***</div>
          <div>THANK YOU FOR YOUR BUSINESS!</div>
          <div className="mt-2">================================</div>
        </div>
      </div>
    ),

    pos: (data) => (
      <div className="p-6 receipt-paper border rounded shadow-sm receipt-font-ocr text-sm">
        <style>{receiptStyles}</style>
        <div className="text-center mb-4">
          <div className="font-bold tracking-wide">{data.merchant}</div>
          <div className="text-xs tracking-wider">{data.address || '123 Business Street'}</div>
          <div className="text-xs tracking-wider">{data.phone || '(555) 555-5555'}</div>
        </div>
        
        <div className="border-t border-b py-2 my-2">
          <div className="grid grid-cols-2 gap-2">
            <div>TID: 1234567</div>
            <div>MID: 987654321</div>
            <div>BATCH #: {Math.floor(Math.random() * 1000)}</div>
            <div>AUTH #: {Math.floor(Math.random() * 100000)}</div>
          </div>
        </div>
        
        <div className="my-4 space-y-1">
          <div className="flex justify-between">
            <span>SALE AMOUNT:</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>TAX ({data.taxRate}%):</span>
            <span>${data.tax}</span>
          </div>
          <div className="flex justify-between">
            <span>TIP ({data.tipRate}%):</span>
            <span>${data.tip}</span>
          </div>
        </div>
        
        <div className="border-t pt-2">
          <div className="flex justify-between font-bold">
            <span>TOTAL:</span>
            <span>${data.amount}</span>
          </div>
        </div>
        
        <div className="mt-6 text-xs space-y-2">
          <div>CARD TYPE: VISA</div>
          <div>CARD NUMBER: XXXX-XXXX-XXXX-1234</div>
          <div>EXPIRATION: XX/XX</div>
          <div className="text-center mt-4">
            I AGREE TO PAY ABOVE TOTAL AMOUNT
            ACCORDING TO CARD ISSUER AGREEMENT
          </div>
        </div>
        
        <div className="mt-4 text-center border-t pt-4">
          <div>*** CUSTOMER COPY ***</div>
          <div>THANK YOU</div>
        </div>
      </div>
    )
  };

  // 商户搜索函数
  const searchMerchant = async (query: string) => {
    if (!query || query.length < 3) return;
    
    setIsSearching(true);
    try {
      console.log('Searching for:', query);
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(query)}&t=${Date.now()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.results?.length > 0) {
        const place = data.results[0];
        console.log('Selected place:', place);
        
        // 确保地址格式化正确
        const address = place.formatted_address || '';
        const phone = place.formatted_phone_number || '';
        
        setTransaction(prev => ({
          ...prev,
          merchant: place.name || query,
          address: address,
          phone: phone
        }));

        toast({
          title: "Success",
          description: "Merchant information found and filled",
        });
      } else {
        console.log('No results found for:', query);
        toast({
          title: "No Results",
          description: `No information found for "${query}". Please try a different search term.`,
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
  };

  // 修改防抖处理，使用 lodash 的 debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => searchMerchant(query), 500),
    []
  );

  // 修改商户名称输入处理
  const handleMerchantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTransaction(prev => ({ ...prev, merchant: value }));
    debouncedSearch(value);
  };

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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export receipt",
        variant: "destructive",
      });
    }
  };

  // 计算金额
  const calculateAmounts = (total, taxRate, tipRate) => {
    const totalAmount = parseFloat(total);
    if (isNaN(totalAmount)) return;

    const taxMultiplier = 1 + (taxRate / 100);
    const subtotal = (totalAmount / taxMultiplier).toFixed(2);
    const tax = (totalAmount - subtotal).toFixed(2);
    const tip = ((parseFloat(subtotal) * tipRate) / 100).toFixed(2);

    setTransaction(prev => ({
      ...prev,
      subtotal,
      tax,
      tip
    }));
  };

  useEffect(() => {
    if (transaction.amount) {
      calculateAmounts(transaction.amount, transaction.taxRate, transaction.tipRate);
    }
  }, [transaction.amount, transaction.taxRate, transaction.tipRate]);

  useEffect(() => {
    if (transaction.amount) {
      setPreviewReceipt(templates[selectedTemplate](transaction));
    }
  }, [transaction, selectedTemplate]);

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
                onChange={(e) => setTransaction({...transaction, taxRate: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tip Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={transaction.tipRate}
                onChange={(e) => setTransaction({...transaction, tipRate: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Receipt Style</label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">Thermal Printer Style</SelectItem>
                  <SelectItem value="pos">POS Terminal Style</SelectItem>
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
                {previewReceipt}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptGenerator;