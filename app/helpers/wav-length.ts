interface WavHeader {
  chunkId: string;
  chunkSize: number;
  format: string;
  subChunk1Id: string;
  subChunk1Size: number;
  audioFormat: number;
  numChannels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;
  subChunk2Id: string;
  subChunk2Size: number;
}

export function getWavDuration(arrayBuffer: ArrayBuffer): number {
  const dataView = new DataView(arrayBuffer);

  const header: WavHeader = {
    chunkId: getString(dataView, 0, 4),
    chunkSize: dataView.getUint32(4, true),
    format: getString(dataView, 8, 4),
    subChunk1Id: getString(dataView, 12, 4),
    subChunk1Size: dataView.getUint32(16, true),
    audioFormat: dataView.getUint16(20, true),
    numChannels: dataView.getUint16(22, true),
    sampleRate: dataView.getUint32(24, true),
    byteRate: dataView.getUint32(28, true),
    blockAlign: dataView.getUint16(32, true),
    bitsPerSample: dataView.getUint16(34, true),
    subChunk2Id: getString(dataView, 36, 4),
    subChunk2Size: dataView.getUint32(40, true),
  };

  if (header.chunkId !== "RIFF" || header.format !== "WAVE") {
    throw new Error("Invalid WAV file format");
  }

  // Calculate duration in milliseconds
  const duration = (header.subChunk2Size / header.byteRate) * 1000;

  return duration;
}

function getString(view: DataView, offset: number, length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += String.fromCharCode(view.getUint8(offset + i));
  }
  return result;
}
