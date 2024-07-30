export const readableTimestamp = (timestamp: number | string) => {
  const date = new Date(timestamp);
  return Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  }).format(date);
};

export const generateUUIDv2 = () => {
  return window.crypto.randomUUID();
};

export const setClientOnlyCookie = (
  name: string,
  value: string,
  path: string,
) => {
  window.document.cookie = `${name}=${value}; path=${path}`;
};

export const getCookie = (name: string) => {
  const value = `; ${window.document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export const removeClientOnlyCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

export const getMeetingLinkForScreenType = (
  meetingId: string,
  isMobile: boolean,
) => {
  return isMobile ? `/app/meetings/${meetingId}` : `/app/meetings/${meetingId}`;
};

export function concatArrayBuffers(views: ArrayBuffer[]): ArrayBuffer {
  let totalLength = 0;
  for (const view of views) {
    if (!view) continue;
    totalLength += view.byteLength;
  }

  const concatenatedBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const view of views) {
    if (!view) continue;
    concatenatedBuffer.set(new Uint8Array(view), offset);
    offset += view.byteLength;
  }

  return concatenatedBuffer.buffer;
}

export function extractWavHeader(buffer: ArrayBuffer): ArrayBuffer {
  const headerLength = 44;

  if (buffer.byteLength < headerLength) {
    throw new Error("Invalid WAV file: too short to contain a valid header");
  }

  return buffer.slice(0, headerLength);
}

export const AI_MODEL_ID = "9999999";
export const TAB_TRANSCRIPTION_ID = "9999998";

export const optionallyRenderComponent = (
  condition: boolean,
  component: JSX.Element,
) => {
  return condition ? component : null;
};

export const getSystemStatusMessage = (isHealthy: boolean) => {
  return isHealthy ? "System is healthy" : "Please check the app settings";
};
