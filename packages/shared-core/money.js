export function inr(n = 0) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
