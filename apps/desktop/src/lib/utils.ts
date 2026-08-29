export const getUserInitials = (name: string | null | undefined) => {
  if (!name) {
    return "U";
  }
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
