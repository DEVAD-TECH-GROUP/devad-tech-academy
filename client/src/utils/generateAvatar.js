const avatarColors = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
];

export function getInitials(firstName = "", lastName = "") {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);

  return `${first}${last}`.toUpperCase() || "?";
}

export function getAvatarColor(name = "") {
  const value = name.trim();

  if (!value) {
    return avatarColors[0];
  }

  const hash = [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );

  return avatarColors[hash % avatarColors.length];
}
