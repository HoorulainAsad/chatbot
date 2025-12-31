'use client';

import { useState, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import styles from './voice.module.css';

interface VoiceRecorderProps {
    onTranscript: (transcript: string) => void;
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);

    const toggleRecording = useCallback(() => {
        if (!isRecording) {
            interface SpeechRecognitionInstance {
                lang: string;
                interimResults: boolean;
                maxAlternatives: number;
                onstart: () => void;
                onend: () => void;
                onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
                start: () => void;
            }

            const Win = window as unknown as {
                SpeechRecognition?: { new(): SpeechRecognitionInstance };
                webkitSpeechRecognition?: { new(): SpeechRecognitionInstance };
            };

            const SpeechRecognitionConstructor = Win.SpeechRecognition || Win.webkitSpeechRecognition;

            if (!SpeechRecognitionConstructor) {
                alert("Speech recognition not supported in this browser.");
                return;
            }

            const recognition = new SpeechRecognitionConstructor();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => setIsRecording(true);
            recognition.onend = () => setIsRecording(false);
            recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
                const transcript = event.results[0][0].transcript;
                onTranscript(transcript);
            };

            recognition.start();
        } else {
            setIsRecording(false);
        }
    }, [isRecording, onTranscript]);

    return (
        <button
            type="button"
            onClick={toggleRecording}
            className={`${styles.micButton} ${isRecording ? styles.recording : ''}`}
        >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
    );
}
