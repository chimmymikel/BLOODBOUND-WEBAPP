export function timeAgo(dateStr) {
  if (!dateStr) return "Just now";

  // 1. Manually i-parse ang date string aron ma-force ang UTC
  // Format: 2026-03-30T11:45:03.514077
  const [datePart, timePart] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, min, sec] = timePart.split(':').map(part => parseFloat(part));

  // I-create ang Date object as UTC
  const postDate = new Date(Date.UTC(year, month - 1, day, hour, min, sec));
  const now = new Date();
  
  // 2. Compute the difference in milliseconds
  const diffMs = now.getTime() - postDate.getTime();
  
  // 3. Logic para sa output
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}