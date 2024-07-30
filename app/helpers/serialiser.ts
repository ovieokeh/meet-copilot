export function serializeData(data: Record<string, any>) {
  function replacer(_key: string, value: any) {
    if (value instanceof ArrayBuffer) {
      let binary = "";
      const bytes = new Uint8Array(value);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    return value;
  }
  return JSON.stringify(data, replacer);
}

export function deserializeData(data: string) {
  function reviver(_key: string, value: any) {
    if (typeof value === "string" && value.match(/^[A-Za-z0-9+/=]+\\={0,2}$/)) {
      const binary_string = atob(value);
      const len = binary_string.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    }
    return value;
  }
  try {
    return JSON.parse(data, reviver);
  } catch (error) {
    console.info("failed deserializing data", data);
    return data;
  }
}
