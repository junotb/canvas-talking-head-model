'use client';

import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { texttospeech } from '@/libs/texttospeech';

const Mimi = (props: {}, ref: ForwardedRef<MimiHandle>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = new Map();
  let ttsAudio: HTMLAudioElement;
  
  useImperativeHandle(ref, () => ({
    async activeMimi(voice, expressStyle, phrase, rate, pitch) {
      try {
        if (!voice || !expressStyle || !phrase || !rate || !pitch) return;
        
        const result = await texttospeech(voice, expressStyle, phrase, rate, pitch);
        if (!result) throw new Error('음성 합성 실패');

        const { audio, visemes } = result;
        const audioUrl = URL.createObjectURL(audio);
        playAudio(audioUrl, visemes);
      } catch (error) {
        console.error('음성 합성 실패:', error);
      }
    }
  }));

  const playAudio = async (audioUrl: string, visemes: Viseme[]) => {
    if (ttsAudio) {
      ttsAudio.pause();
    }
    ttsAudio = new Audio(audioUrl);

    ttsAudio.ontimeupdate = () => {
      const TRANSITION_DELAY = 60;
      const currentViseme = visemes.find(viseme => {
        return viseme.audioOffset - (TRANSITION_DELAY / 2) >= ttsAudio.currentTime * 1000;
      });

      if (currentViseme) {
        drawMouthFrame(currentViseme.visemeId);
      }
    };

    ttsAudio.play();
  }

  const loadImageBySrc = (pathname: string) => {
    if (imageCache.has(pathname)) {
      return Promise.resolve(imageCache.get(pathname))
    }

    return new Promise(resolve => {
      const image = new window.Image();
      image.onload = () => {
        imageCache.set(pathname, image);
        resolve(image);
      };
      image.src = pathname;
    });
  }

  const drawImage = async (pathname: string) => {
    const image = await loadImageBySrc(pathname);
    canvasRef.current!.getContext('2d')!.drawImage(image, 0, 0);
  }

  const clearEyes = () => {
    canvasRef.current!.getContext('2d')!.fillStyle = 'rgb(90, 81, 74)';
    canvasRef.current!.getContext('2d')!.fillRect(293, 156, 40, 44);
    canvasRef.current!.getContext('2d')!.fillRect(167, 156, 40, 44);
  }

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const eyeBlink = async () => {
    const [leftEye, rightEye] = await Promise.all([
      loadImageBySrc('/images/eye-l.png'),
      loadImageBySrc('/images/eye-r.png')
    ]);

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const targetHeight = Math.floor(leftEye.height * 0.2);
    const ANIMATION_STEP = 20;
    let height = leftEye.height;

    while (height > targetHeight) {
      await sleep(ANIMATION_STEP);
      height = Math.max(targetHeight, height * 0.8);
      clearEyes();
      ctx.drawImage(leftEye, 0, (leftEye.height - height) / 3, leftEye.width, height);
      ctx.drawImage(rightEye, 0, (rightEye.height - height) / 3, rightEye.width, height);
    }

    await sleep(ANIMATION_STEP);
    clearEyes();
    ctx.drawImage(leftEye, 0, (leftEye.height - targetHeight) / 3, leftEye.width, targetHeight);
    ctx.drawImage(rightEye, 0, (rightEye.height - targetHeight) / 3, rightEye.width, targetHeight);

    await sleep(75);
    clearEyes();
    await drawImage('/images/eye-l-closed.png');
    await drawImage('/images/eye-r-closed.png');

    await sleep(120);
    clearEyes();
    await drawImage('/images/eye-l.png');
    await drawImage('/images/eye-r.png');
  }

  const drawMouthFrame = async (id: number) => {
    const image = await loadImageBySrc(`/images/mouth-${id}.png`);

    canvasRef.current!.getContext('2d')!.fillStyle = 'rgb(90, 81, 74)';
    canvasRef.current!.getContext('2d')!.fillRect(200, 165, 100, 75);
    canvasRef.current!.getContext('2d')!.drawImage(image, 0, 0);
  }

  useEffect(() => {
    const drawMimi = async () => {
      const imageIds = ['/images/body.png', '/images/eye-l.png', '/images/eye-r.png', '/images/mouth-0.png'];
      imageIds.forEach(async (imageId) => {        
        const image = await loadImageBySrc(imageId);
        canvasRef.current!.getContext('2d')!.drawImage(image, 0, 0);
      });

      const BLINK_INTERVAL = 3500;
      setInterval(() => {
        eyeBlink();
      }, BLINK_INTERVAL);
    };
    drawMimi().catch((e) => {
      // handle the error as needed
      console.error('An error occurred while fetching the data: ', e)
    });
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