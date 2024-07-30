const SOUND_EFFECTS = {
  "sent-message": "/sound-effects/sent-message.mp3",
  "received-message": "/sound-effects/received-message.mp3",
  "insights-action": "/sound-effects/insights-action.mp3",
  "copy-action": "/sound-effects/copy-action.mp3",
  "insights-retrieved": "/sound-effects/insights-retrieved.mp3",
};

export const playSound = (sound: keyof typeof SOUND_EFFECTS) => {
  const audio = new Audio(SOUND_EFFECTS[sound]);
  audio.play();
};
