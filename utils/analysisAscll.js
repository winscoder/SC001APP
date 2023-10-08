export function analysisAscll(str) {
  let hexadecimalSrc = ''
  for(const item of str) {
    const decimalism = item.charCodeAt()
    // console.log(decimalism);
    hexadecimalSrc = (hexadecimalSrc ? hexadecimalSrc + " " : hexadecimalSrc) + decimalism.toString(16)
  }
  return hexadecimalSrc
}