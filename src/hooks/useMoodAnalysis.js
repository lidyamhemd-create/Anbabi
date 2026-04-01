import { useState, useCallback } from 'react';
import { ATMOSPHERES } from '../atmospheres/definitions.js';

const PROMPT = `Return ONLY a JSON object like this (no markdown, no extra text):
{"atmosphere":"stormy","reason":"characters flee in heavy rain"}

Choose atmosphere from: stormy, autumn, thriller, peaceful, action, mysterious, romantic, neutral
Keep reason to 6 words or fewer.`;

export function useMoodAnalysis(onAtmosphere) {
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeMood = useCallback(async (text, canvas) => {
    setAnalyzing(true);
    try {
      const words = text.trim().split(/\s+/).filter(Boolean).length;

      let messages;
      if (words >= 8) {
        messages = [{ role: 'user', content: PROMPT + '\n\nBook page:\n' + text.slice(0, 2500) }];
      } else {
        const b64 = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
        messages = [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
            { type: 'text', text: PROMPT + '\n\nRead the text in the image above.' },
          ],
        }];
      }

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 120, messages }),
      });

      if (!res.ok) throw new Error('API ' + res.status);

      const data = await res.json();
      const raw = (data.content?.find(b => b.type === 'text')?.text || '{}')
        .replace(/```[a-z]*\n?/g, '')
        .trim();
      const parsed = JSON.parse(raw);

      if (parsed?.atmosphere && ATMOSPHERES[parsed.atmosphere]) {
        onAtmosphere(parsed.atmosphere, parsed.reason || '');
      }
    } catch (e) {
      console.error('Mood analysis error:', e);
    } finally {
      setAnalyzing(false);
    }
  }, [onAtmosphere]);

  return { analyzeMood, analyzing };
}
