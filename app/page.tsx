'use client';

import { useRef } from 'react';
import Mimi, { MimiHandle } from '@/components/Mimi';
import Link from 'next/link';

const Home = () => {
  const mimiRef = useRef<MimiHandle>(null);

  const voiceRef = useRef<HTMLSelectElement>(null);
  const scriptRef = useRef<HTMLTextAreaElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);
  const pitchRef = useRef<HTMLInputElement>(null);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    console.log('handleFocus');
    event.currentTarget.value = '';
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    console.log('handleBlur');
    const min = parseInt(event.currentTarget.getAttribute('min')!);
    const max = parseInt(event.currentTarget.getAttribute('max')!);
    const value = parseInt(event.currentTarget.value);

    if (value === 0 || Number.isNaN(value)) {
      event.currentTarget.value = '0';
      return;
    }
    if (value < min) {
      event.currentTarget.value = `${min.toString()}%`;
      return;
    }
    if (value > max) {
      event.currentTarget.value = `${max.toString()}%`;
      return;
    }
    event.currentTarget.value = `${value.toString()}%`;
  }

  const handleClick = () => {
    const voice = voiceRef.current!.value;
    const script = scriptRef.current!.value;
    const rate = rateRef.current!.value;
    const pitch = pitchRef.current!.value;

    mimiRef.current!.activeMimi(voice, script, rate, pitch);
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen overflow-hidden'>
      <div className='absolute top-0 flex justify-between items-center px-4 w-full h-12'>
        <h1 className='text-xl'>Canvas Talking Head Model</h1>
        <div className='flex gap-4'>
          <Link href='/'>Home</Link>
          <Link href='/mimi'>Mimi</Link>
        </div>
      </div>
      <div className='mt-12'>
        <div className='w-64 space-y-4'>
          <div className='flex items-center gap-4'>
            <p>Voice: </p>
            <select
              name='voice'
              ref={voiceRef}
              className='border-2 border-white outline-hidden px-4 py-2 w-full bg-transparent'
            >
              <option value='en-US-CoraNeural'>Cora</option>
              <option value='en-US-JasonNeural'>Jason</option>
              <option value='en-GB-AbbiNeural'>Abbi</option>
              <option value='en-GB-RyanNeural'>Ryan</option>
            </select>
          </div>
          <div className='flex items-center gap-4'>
            <p>Script: </p>
            <textarea
              name='script'
              ref={scriptRef}
              className='border-2 border-white focus:border-neutral-500 outline-hidden px-4 py-2 w-full bg-transparent'
            />
          </div>
          <div className='flex items-center gap-4'>
            <p>Rate: </p>
            <input
              type='text'
              name='rate'
              ref={rateRef}
              className='border-2 border-white focus:border-neutral-500 outline-hidden w-full px-4 py-2 bg-transparent text-right'
              min={-100}
              max={100}
              defaultValue={0}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <div className='flex items-center gap-4'>
            <p>Pitch: </p>
            <input
              type='text'
              name='pitch'
              ref={pitchRef}
              className='border-2 border-white focus:border-neutral-500 outline-hidden w-full px-4 py-2 bg-transparent text-right'
              min={-100}
              max={100}
              defaultValue={0}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <button
            className='border-2 border-white active:border-neutral-500 active:text-neutral-500 px-4 py-2 w-full'
            onClick={handleClick}
          >Play</button>
        </div>
      </div>
    </div>
  )
}
export default Home;