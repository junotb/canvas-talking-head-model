import React from 'react';

interface TextToSpeechFormProps {
  onSubmit: (voice: string, expressStyle: string, rate: string, pitch: string, phrase: string) => void;
}

export default function TextToSpeechForm({ onSubmit }: TextToSpeechFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement); 
    const voice = formData.get('voice') as string;
    const expressStyle = formData.get('expressStyle') as string;
    const rate = formData.get('rate') as string;
    const pitch = formData.get('pitch') as string;
    const phrase = formData.get('phrase') as string;

    onSubmit(voice, expressStyle, rate, pitch, phrase);
  }
  
  return (
    <form className="flex flex-col gap-4 w-full max-w-xl h-full" onSubmit={handleSubmit}>
      <select name="voice" className="w-full px-1 py-2 border border-gray-700 rounded-lg">
        <option className="p-2 bg-white" value="en-US-JasonNeural">US: Jason</option>
        <option className="p-2 bg-white" value="en-US-CoraNeural">US: Cora</option>
        <option className="p-2 bg-white" value="en-US-AndrewNeural">US: Andrew</option>
        <option className="p-2 bg-white" value="en-US-EmmaNeural">US: Emma</option>
        <option className="p-2 bg-white" value="en-US-GuyNeural">US: Guy</option>
        <option className="p-2 bg-white" value="en-US-SaraNeural">US: Sara</option>
        <option className="p-2 bg-white" value="en-GB-RyanNeural">UK: Ryan</option>
        <option className="p-2 bg-white" value="en-GB-AbbiNeural">UK: Abbi</option>
      </select>
      <select name="expressStyle" className="w-full px-1 py-2 border border-gray-700 rounded-lg">
        <option className="p-2 bg-white" value="cheerful">cheerful</option>
        <option className="p-2 bg-white" value="excited">excited</option>
        <option className="p-2 bg-white" value="hopeful">hopeful</option>
        <option className="p-2 bg-white" value="angry">angry</option>
        <option className="p-2 bg-white" value="depressed">depressed</option>
      </select>
      <div className="flex items-center gap-4">
        <input
          type="text"
          name="rate"
          className="border border-gray-700 w-full px-4 py-2 rounded-lg"
          min={-100}
          max={100}
          placeholder="Rate"/>
        <input
          type="text"
          name="pitch"
          className="border border-gray-700 w-full px-4 py-2 rounded-lg"
          min={-100}
          max={100}
          placeholder="Pitch"/>
      </div>
      <textarea name="phrase" placeholder="Phrase" className="w-full p-2 border border-gray-700 focus:bg-gray-400/10 rounded-lg" rows={8} />
      <button type="submit" className="w-full p-2 border border-gray-700 hover:bg-gray-400/10 rounded-lg">Submit</button>
    </form>
  );
}
