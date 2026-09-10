export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-NG", {
    hour: "2-digit", minute: "2-digit",
  });

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};