function uuid() {
  const date1 = Date.now().toString(36);
  const date2 = Math.random().toString(36).substring(2);
  return date1 + date2;
}
export default uuid;
