export function timeAgo(dateStr) {
  if (!dateStr) return "Unknown";

  const normalized =
    dateStr.endsWith("Z") || dateStr.includes("+") || /T.*-\d{2}:\d{2}$/.test(dateStr)
      ? dateStr
      : dateStr + "Z";

  const postDate = new Date(normalized);
  const now = new Date();
  
  // I-log nato sa console aron makita nato unsa ang oras
  console.log("Post Date:", postDate.toLocaleString(), "Now:", now.toLocaleString());

  const diffMs = now.getTime() - postDate.getTime();
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