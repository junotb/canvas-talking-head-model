'use client';

import Image from 'next/image'
import { useEffect, useRef } from 'react';
import { FrameData } from '../types/types';

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = new Map();
  let ctx: CanvasRenderingContext2D;
  let ttsAudio: HTMLAudioElement;

  const loadImage = (id: string): Promise<HTMLImageElement> => {
    return new Promise(resolve => {
      const image = document.getElementById(id) as HTMLImageElement;
      if (image.complete) {
        return resolve(image);
      }

      image.onload = () => {
        resolve(image);
      };
    });
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

  const drawImage = async (id: string) => {
    const image = await loadImage(id);
    ctx.drawImage(image, 0, 0);
  }

  const clearEyes = () => {
    ctx.fillStyle = 'rgb(90, 81, 74)';
    ctx.fillRect(293, 156, 40, 44);
    ctx.fillRect(167, 156, 40, 44);
  }

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const eyeBlink = async () => {
    const leftEye = await loadImage('eye-l');
    const rightEye = await loadImage('eye-r');

    const targetHeight = Math.floor(leftEye.height * 0.2);
    let height = leftEye.height;
    const ANIMATION_STEP = 20;

    while (height > targetHeight) {
      await sleep(ANIMATION_STEP);
      height *= 0.8;
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
    await drawImage('eye-l-closed');
    await drawImage('eye-r-closed');

    await sleep(120);
    clearEyes();
    await drawImage('eye-l');
    await drawImage('eye-r');
  }

  const drawMouthFrame = async (id: string) => {
    const image = await loadImageBySrc(`/images/mouth-${id}.png`);

    ctx.fillStyle = `rgb(90, 81, 74)`;
    ctx.fillRect(200, 165, 100, 75);
    ctx.drawImage(image, 0, 0);
  }

  const playAudio = async (id: string) => {
    if (ttsAudio) {
      ttsAudio.pause();
    }
    ttsAudio = new Audio(`${id}.wav`);
    
    const response = await fetch(new Request(`${id}.json`), {
      method: 'GET',
      mode: 'no-cors'
    });
    const visemeData: FrameData[] = await response.json();

    ttsAudio.ontimeupdate = (event) => {
      const currentFrame = visemeData.find(frameData => {
        const TRANSITION_DELAY = 60;
        return frameData.offset - (TRANSITION_DELAY / 2) >= ttsAudio.currentTime * 1000;
      });
      drawMouthFrame(currentFrame!.id ?? 0);
    };

    ttsAudio.play();
  }

  useEffect(() => {
    const init = async () => {
      const BLINK_INTERVAL = 3500;
      ctx = canvasRef.current!.getContext('2d')!;

      await drawImage('body');
      await drawImage('eye-l');
      await drawImage('eye-r');

      const image = await loadImageBySrc('/images/mouth-0.png');
      ctx.drawImage(image, 0, 0);

      eyeBlink();
      setInterval(() => {
        eyeBlink();
      }, BLINK_INTERVAL);
    };
    init();
  }, []);

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <canvas
        id='canvas'
        ref={canvasRef}
        width={512}
        height={512}
      />
      <div className=''>
        <Image
          id='body'
          src='/images/body.png'
          alt={''}
          width={512}
          height={512}
        />
        <Image
          id='eye-l'
          src='/images/eye-l.png'
          alt={''}
          width={512}
          height={512}
        />
        <Image
          id='eye-l-closed'
          src='/images/eye-l-closed.png'
          alt={''}
          width={512}
          height={512}
        />
        <Image
          id='eye-r'
          src='/images/eye-r.png'
          alt={''}
          width={512}
          height={512}
        />
        <Image
          id='eye-r-closed'
          src='/images/eye-r-closed.png'
          alt={''}
          width={512}
          height={512}
        />
      </div>
    </main>
  )
}
export default Home;