interface MimiHandle {
  activeMimi: (
    voice: string,
    expressStyle: string,
    phrase: string,
    rate: string,
    pitch: string
  ) => void;
}

interface Viseme {
  audioOffset: number;
  visemeId: number;
}