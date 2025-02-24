'use client';

import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { texttospeech } from '@/libs/texttospeech';

const Mimi = (props: {}, ref: ForwardedRef<MimiHandle>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef(new Map());
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  
  useImperativeHandle(ref, () => ({
    async activeMimi(speechKey, speechRegion, voice, expressStyle, phrase, rate, pitch) {
      try {
        if (!speechKey || !speechRegion || !voice || !expressStyle || !phrase || !rate || !pitch) return;
        try {
          const result = await texttospeech(speechKey, speechRegion, voice, expressStyle, phrase, rate, pitch);
          if (!result) throw new Error('음성 합성 실패');

          const { audio, visemes } = result;
          const audioUrl = URL.createObjectURL(audio);
          playAudio(audioUrl, visemes);
        } catch (error) {
          console.error('음성 합성 실패:', error);
        }
      } catch (error) {
        console.error('음성 합성 실패:', error);
      }
    }
  }));

  const playAudio = async (audioUrl: string, visemes: Viseme[]) => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    ttsAudioRef.current = audio;

    audio.ontimeupdate = () => {
      const TRANSITION_DELAY = 60;
      const currentViseme = visemes.find(viseme => viseme.audioOffset - (TRANSITION_DELAY / 2) >= audio.currentTime * 1000);
      if (currentViseme) drawMouthFrame(currentViseme.visemeId);
    };

    audio.play();
  }

  const loadImageBySrc = (pathname: string): Promise<HTMLImageElement> => {
    if (imageCache.current.has(pathname)) {
      return Promise.resolve(imageCache.current.get(pathname));
    }

    return new Promise(resolve => {
      const image = new window.Image();
      image.onload = () => {
        imageCache.current.set(pathname, image);
        resolve(image);
      };
      image.src = pathname;
    });
  }

  const drawImage = async (pathname: string) => {
    const ctx = canvasRef.current!.getContext('2d')!;
    if (!ctx) return;
    const image = await loadImageBySrc(pathname);
    ctx.drawImage(image, 0, 0);
  }

  const clearEyes = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgb(90, 81, 74)';
    ctx.fillRect(293, 156, 40, 44);
    ctx.fillRect(167, 156, 40, 44);
  }

  const drawEyeImage = (ctx: CanvasRenderingContext2D, leftEye: HTMLImageElement, rightEye: HTMLImageElement, height: number) => {
    clearEyes(ctx);
    ctx.drawImage(leftEye, 0, (leftEye.height - height) / 3, leftEye.width, height);
    ctx.drawImage(rightEye, 0, (rightEye.height - height) / 3, rightEye.width, height);
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const eyeBlink = async () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const [leftEye, rightEye] = await Promise.all([
      loadImageBySrc('/images/eye-l.png'),
      loadImageBySrc('/images/eye-r.png')
    ]);

    const targetHeight = Math.floor(leftEye.height * 0.2);
    const ANIMATION_STEP = 20;
    let height = leftEye.height;

    while (height > targetHeight) {
      await sleep(ANIMATION_STEP);
      height = Math.max(targetHeight, height * 0.8);
      drawEyeImage(ctx, leftEye, rightEye, height);
    }

    await sleep(ANIMATION_STEP);
    drawEyeImage(ctx, leftEye, rightEye, targetHeight);

    await sleep(75);
    await drawImage('/images/eye-l-closed.png');
    await drawImage('/images/eye-r-closed.png');

    await sleep(120);
    await drawImage('/images/eye-l.png');
    await drawImage('/images/eye-r.png');
  }

  const drawMouthFrame = async (id: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const image = await loadImageBySrc(`/images/mouth-${id}.png`);
    
    ctx.fillStyle = 'rgb(90, 81, 74)';
    ctx.fillRect(200, 165, 100, 75);
    ctx.drawImage(image, 0, 0);
  }

  useEffect(() => {
    const drawMimi = async () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      const imageIds = ['/images/body.png', '/images/eye-l.png', '/images/eye-r.png', '/images/mouth-0.png'];
      await Promise.all(imageIds.map(async (imageId) => {
        const image = await loadImageBySrc(imageId);
        ctx.drawImage(image, 0, 0);
      }));

      const BLINK_INTERVAL = 3500;
      const blinkInterval = setInterval(eyeBlink, BLINK_INTERVAL);
      return () => clearInterval(blinkInterval);
    };

    drawMimi().catch(error => console.error('An error occurred while fetching the data: ', error));
  }, []);

  return (
    <canvas
      id='canvas'
      ref={canvasRef}
      width={512}
      height={512}/>
  )
};

export default forwardRef<MimiHandle, any>(Mimi);