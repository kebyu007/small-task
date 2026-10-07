export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 UZS';
  return `${Number(amount).toLocaleString()} UZS`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatPhone = (phoneString) => {
  if (!phoneString) return '';
  // Formats +998901234567 to +998 90 123 45 67
  const cleaned = ('' + phoneString).replace(/\D/g, '');
  if (cleaned.length === 12) {
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
    }
  }
  return phoneString;
};
