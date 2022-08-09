// works like uuid but to be used for generating not too unique strings
function unique() {
  const date1 = Date.now().toString(36);
  const date2 = Math.random().toString(36).substring(2);
  return date1 + date2;
}
export default unique;
