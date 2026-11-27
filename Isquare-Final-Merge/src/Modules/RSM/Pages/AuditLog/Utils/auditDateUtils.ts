/**
 * Formats an audit log timestamp string to the standardized format:
 * dd MMM yyyy, hh:mm:ss a (e.g. "26 Nov 2026, 12:33:17 PM").
 *
 * Direct component parsing prevents unexpected timezone conversions (such as double UTC shifts)
 * and preserves the exact datetime stored in the database.
 */
export const formatAuditDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return "-";

  // Match ISO / SQL format: YYYY-MM-DD[T or space]HH:mm:ss
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const year = match[1];
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = match[3];
    let hour = parseInt(match[4], 10);
    const minute = match[5];
    const second = match[6];

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = monthNames[monthIndex] || match[2];

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    const hourStr = hour < 10 ? `0${hour}` : `${hour}`;

    return `${day} ${month} ${year}, ${hourStr}:${minute}:${second} ${ampm}`;
  }

  // Graceful fallback using Date object if format is unexpected
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const hoursStr = String(hours).padStart(2, "0");

    return `${day} ${month} ${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
  } catch {
    return dateStr;
  }
};
