declare global {
  interface Window {
    Image: {   
      prototype: HTMLImageElement;
      new (): HTMLImageElement;
    };
  }
}

export type FrameData = {
  id: string,
  offset: number
}