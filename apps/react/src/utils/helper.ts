export const getInitials = (name: string): string => {
  if (!name?.trim()) return "";

  return name
    .trim()
    .split(/\s+/)
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join("");
};


export const formatFirebaseTimestamp = (timestamp: any)=> {
  const date = new Date(
    timestamp._seconds * 1000 + timestamp._nanoseconds / 1_000_000
  );

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export const isSessionExpired = (startTime: string | number | Date) => {
  if (!startTime) return true;

  const start = new Date(startTime);
  const expiry = new Date(start.getTime() + 45 * 60 * 1000);

  return new Date() > expiry;
};


 export const fixImageUrl = (url?: string) => {
    if (!url || url === "undefined") return "";

    // only modify Firebase URLs
    if (!url.includes("firebasestorage.googleapis.com")) {
      return encodeURI(url);
    }

    const [base, query] = url.split("?");
    const parts = base.split("/o/");

    if (parts.length !== 2) return encodeURI(url);

    const encodedPath = encodeURIComponent(
      decodeURIComponent(parts[1])
    );

    return `${parts[0]}/o/${encodedPath}${
      query ? `?${query}` : ""
    }`;
  };