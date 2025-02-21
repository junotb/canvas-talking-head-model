'use client';

import Mimi from '@/components/Mimi';
import TextToSpeechForm from '@/components/forms/TextToSpeech';
import { useRef } from 'react';

export default function Home() {
  const mimiRef = useRef<MimiHandle>(null);

  const handleSubmit = (voice: string, expressStyle: string, rate: string, pitch: string, phrase: string) => {
    if (!mimiRef.current) return;
    mimiRef.current.activeMimi(voice, expressStyle, phrase, rate, pitch);
  }

  return (
    <div className="flex justify-center items-center pt-12 size-full">   
      <div>
        <Mimi ref={mimiRef} />
      </div>
      <div>
        <TextToSpeechForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}