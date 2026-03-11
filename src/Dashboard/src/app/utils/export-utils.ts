import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Get current exchange rate from localStorage (set by admin settings)
export function getExchangeRate(): number {
  const stored = localStorage.getItem('gemsore_exchange_rate');
  return stored ? Number(stored) || 1500 : 1500;
}

// Exported for display purposes (getter)
export const NGN_TO_USD_RATE = 1500; // default for display only

// Get current currency from localStorage
export function getCurrentCurrency(): 'NGN' | 'USD' {
  const stored = localStorage.getItem('gemsore_currency');
  return (stored === 'USD' ? 'USD' : 'NGN') as 'NGN' | 'USD';
}

// Convert amount based on current currency setting
export function convertAmount(amountInNGN: number): number {
  const currency = getCurrentCurrency();
  if (currency === 'USD') {
    return amountInNGN / getExchangeRate();
  }
  return amountInNGN;
}

// Format currency based on current selection
export function formatCurrency(amountInNGN: number): string {
  const currency = getCurrentCurrency();
  const convertedAmount = convertAmount(amountInNGN);
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(convertedAmount);
  }
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(convertedAmount);
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data: any[], filename: string, title: string) {
  if (data.length === 0) return;

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  // Prepare table data
  const headers = Object.keys(data[0]);
  const tableData = data.map(row => headers.map(header => row[header]));

  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [71, 85, 105] },
  });

  doc.save(`${filename}.pdf`);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}