export function formatCurrency(amount: number | null) {
  if (amount === null || amount === undefined) return "";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
