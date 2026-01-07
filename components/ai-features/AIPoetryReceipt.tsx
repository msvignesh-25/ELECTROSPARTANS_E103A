'use client';

import React, { useState } from 'react';
import { generateReceiptPoem } from '@/services/aiServices';

interface ShopData {
  shopName: string;
  businessType: string;
  daysAvailable: string[];
  monthlyBudget: number;
  numberOfWorkers: number;
  processes: string[];
}

interface AIPoetryReceiptProps {
  shopData: ShopData;
}

export default function AIPoetryReceipt({ shopData }: AIPoetryReceiptProps) {
  const [drinkName, setDrinkName] = useState('');
  const [generatedPoem, setGeneratedPoem] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePoem = async () => {
    if (!drinkName.trim()) {
      alert('Please enter a drink name');
      return;
    }

    setIsGenerating(true);
    try {
      const poem = await generateReceiptPoem(drinkName, shopData);
      setGeneratedPoem(poem);
    } catch (error) {
      console.error('Error generating poem:', error);
      alert('Failed to generate poem. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintReceipt = () => {
    const receiptContent = `
${shopData.shopName}
${shopData.businessType}
${new Date().toLocaleDateString()}

Item: ${drinkName}
Price: $X.XX

━━━━━━━━━━━━━━━━━━━━
${generatedPoem}
━━━━━━━━━━━━━━━━━━━━

Thank you for visiting!
Open ${shopData.daysAvailable.join(', ')}
    `.trim();

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${shopData.shopName}</title>
            <style>
              body {
                font-family: monospace;
                padding: 20px;
                max-width: 300px;
                margin: 0 auto;
              }
              .poem {
                margin: 20px 0;
                padding: 15px;
                background: #f5f5f5;
                border-left: 3px solid #4CAF50;
                font-style: italic;
                white-space: pre-line;
              }
            </style>
          </head>
          <body>
            <pre>${receiptContent}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        📝 AI Poetry Receipt Generator
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Generate unique, personalized poems for customer receipts. Each receipt becomes a collectible "fortune cookie" experience!
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Drink/Item Name
          </label>
          <input
            type="text"
            value={drinkName}
            onChange={(e) => setDrinkName(e.target.value)}
            placeholder="e.g., Caramel Latte, Blueberry Muffin"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleGeneratePoem}
          disabled={isGenerating || !drinkName.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating Poem...' : 'Generate Poem'}
        </button>

        {generatedPoem && (
          <div className="mt-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                Generated Poem:
              </p>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line italic">
                {generatedPoem}
              </p>
            </div>

            <button
              onClick={handlePrintReceipt}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              🖨️ Print Receipt with Poem
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
