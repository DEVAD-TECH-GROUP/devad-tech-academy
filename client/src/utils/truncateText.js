export const truncate = (text, len = 80) =>
  text?.length > len ? text.slice(0, len) + "..." : text;