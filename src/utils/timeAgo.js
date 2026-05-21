export function timeAgo(dateStr) {
  if (!dateStr) return "Unknown";

  // If no timezone info, assume Manila time (UTC+8) as fallback
  const normalized =
    dateStr.endsWith("Z") || dateStr.includes("+") || /T.*-\d{2}:\d{2}$/.test(dateStr)
      ? dateStr
      : dateStr + "+08:00";

  const diffMs = Date.now() - new Date(normalized).getTime();
  if (isNaN(diffMs)) return "Unknown";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}