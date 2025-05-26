export function numberToWords(num: number): string {
  if (num === 0) return 'zero';
  if (!num || isNaN(num)) return '';

  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  function convertHundreds(num: number): string {
    let result = '';
    
    if (num > 99) {
      result += ones[Math.floor(num / 100)] + ' hundred';
      num %= 100;
      if (num > 0) result += ' and ';
    }
    
    if (num > 19) {
      result += tens[Math.floor(num / 10)];
      if (num % 10 > 0) result += '-' + ones[num % 10];
    } else if (num > 9) {
      result += teens[num - 10];
    } else if (num > 0) {
      result += ones[num];
    }
    
    return result;
  }

  function convertSection(num: number, scale: string): string {
    if (num === 0) return '';
    return convertHundreds(num) + (scale ? ' ' + scale : '');
  }

  const scales = ['', 'thousand', 'million', 'billion'];
  const chunks: number[] = [];
  
  let remaining = Math.floor(num);
  while (remaining > 0) {
    chunks.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  chunks.forEach((chunk, index) => {
    if (chunk > 0) {
      parts.unshift(convertSection(chunk, scales[index]));
    }
  });

  let result = parts.join(', ');
  
  // Handle decimals
  if (num % 1 !== 0) {
    const decimalPart = Math.round((num % 1) * 100);
    if (decimalPart > 0) {
      result += ' point ' + convertHundreds(decimalPart);
    }
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}