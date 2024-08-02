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
const audioContext = new AudioContext();

export async function getWavDuration(
  arrayBuffer: ArrayBuffer,
): Promise<number> {
  try {
    // Decode the audio data contained in the ArrayBuffer
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Duration is a property of AudioBuffer, provided in seconds
    const durationInSeconds = audioBuffer.duration;

    // Convert seconds to milliseconds
    const durationInMilliseconds = durationInSeconds * 1000;

    return durationInMilliseconds;
  } catch (error) {
    console.error("Error decoding audio data:", error);
    throw error;
  } finally {
    // Close the audio context to release system resources
    audioContext.close();
  }
}

function getString(view: DataView, offset: number, length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += String.fromCharCode(view.getUint8(offset + i));
  }
  return result;
}
