import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../constants/firebase';
import { Heart, ScanLine, X, Sparkles, Mic, Video, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ScannedMessage {
  id: string;
  content: string;
  createdAt: number;
  recipientName?: string;
  audioUrl?: string;
  videoUrl?: string;
}

export default function ScanMessage() {
  const { uid, id } = useParams<{ uid: string; id: string }>();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<ScannedMessage | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const fetchMessage = useCallback(async (userId: string, messageId: string) => {
    setIsLoading(true);
    try {
      const msgDoc = await getDoc(doc(db, 'users', userId, 'messages', messageId));
      if (msgDoc.exists()) {
        const data = msgDoc.data();
        setMessage({
          id: msgDoc.id,
          content: data.content,
          recipientName: data.recipientName,
          audioUrl: data.audioUrl,
          videoUrl: data.videoUrl,
          createdAt: data.createdAt?.toMillis() || Date.now(),
        });
        setShowMessage(true);
      } else {
        alert('This message could not be found.');
      }
    } catch (error) {
      console.error('Error fetching message:', error);
      alert('Failed to fetch message.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (uid && id) {
      fetchMessage(uid, id);
    }
  }, [uid, id, fetchMessage]);

  useEffect(() => {
    if (!showMessage && !scanned && !uid && !id) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
        },
        /* verbose= */ false
      );
      
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [showMessage, scanned]);

  const onScanSuccess = async (decodedText: string) => {
    if (scanned || isLoading) return;
    
    setScanned(true);
    setIsLoading(true);

    try {
      let parsedId: string | undefined;
      let parsedUid: string | undefined;

      // Try to parse as URL first
      if (decodedText.includes('/message/')) {
        try {
          const url = new URL(decodedText);
          const parts = url.pathname.split('/');
          // Path format is /message/:uid/:id
          const messageIdx = parts.indexOf('message');
          if (messageIdx !== -1 && parts.length >= messageIdx + 3) {
            parsedUid = parts[messageIdx + 1];
            parsedId = parts[messageIdx + 2];
          }
        } catch (e) {
          console.error('Error parsing QR URL:', e);
        }
      }

      // If not a URL or parsing failed, try JSON (backward compatibility)
      if (!parsedId || !parsedUid) {
        try {
          const parsed = JSON.parse(decodedText);
          if (parsed && parsed.type === 'loveqr_message') {
            parsedId = parsed.id;
            parsedUid = parsed.uid;
          }
        } catch (e) {
          // Not JSON either
        }
      }
      
      if (parsedId && parsedUid) {
        const msgDoc = await getDoc(doc(db, 'users', parsedUid, 'messages', parsedId));
        if (msgDoc.exists()) {
          const data = msgDoc.data();
          setMessage({
            id: msgDoc.id,
            content: data.content,
            recipientName: data.recipientName,
            audioUrl: data.audioUrl,
            videoUrl: data.videoUrl,
            createdAt: data.createdAt?.toMillis() || Date.now(),
          });
          setShowMessage(true);
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
        } else {
          alert('This message could not be found.');
          setScanned(false);
        }
      } else {
        alert('Invalid QR Code. This QR code is not a Love QR message.');
        setScanned(false);
      }
    } catch (error: any) {
      console.error('Error scanning QR:', error);
      alert('Failed to read QR code. Please try again.');
      setScanned(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onScanFailure = (_error: any) => {
    // console.warn(`Code scan error = ${_error}`);
  };

  const resetScanner = () => {
    setScanned(false);
    setMessage(null);
    setShowMessage(false);
  };

  if (showMessage && message) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-xl">
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex items-center gap-2">
            <Heart size={24} className="text-pink-600 fill-pink-600" />
            <h2 className="text-xl font-bold text-gray-800">Love Message</h2>
          </div>
          <button onClick={resetScanner} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors active:scale-90">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="bg-pink-50 p-5 sm:p-6 rounded-2xl mb-6 relative overflow-hidden shadow-inner border border-pink-100">
          <div className="absolute top-2 right-2 opacity-10">
            <Sparkles size={40} className="text-pink-600" />
          </div>
          
          <p className="text-[10px] sm:text-xs text-pink-500 font-bold mb-2 uppercase tracking-widest">
            {message.recipientName ? `To ${message.recipientName}` : 'For You'}
          </p>
          
          <p className="text-lg sm:text-xl text-gray-800 leading-relaxed font-medium mb-4 break-words">
            {message.content}
          </p>
          
          <p className="text-[10px] sm:text-xs text-pink-400 font-medium italic">
            Received {formatDistanceToNow(message.createdAt)} ago
          </p>
        </div>

        <div className="space-y-5 px-1">
          {message.audioUrl && (
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                <Mic size={16} className="text-pink-500" /> Voice Message
              </label>
              <audio controls className="w-full h-10 sm:h-12 bg-pink-50 rounded-lg">
                <source src={message.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {message.videoUrl && (
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                <Video size={16} className="text-pink-500" /> Video Message
              </label>
              <video controls className="w-full rounded-2xl overflow-hidden shadow-lg border border-pink-100">
                <source src={message.videoUrl} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            </div>
          )}
        </div>

        <button
          onClick={resetScanner}
          className="w-full mt-8 bg-pink-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg hover:bg-pink-700 active:scale-[0.98] transition-all shadow-lg shadow-pink-100"
        >
          Scan Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-xl">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="bg-pink-100 p-3 rounded-full mb-3">
          <ScanLine className="text-pink-600" size={32} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Scan Love Message</h1>
        <p className="text-sm sm:text-base text-gray-500">Reveal what's inside</p>
      </div>

      <div className="relative group">
        <div id="reader" className="w-full rounded-2xl overflow-hidden border-2 border-pink-100 bg-gray-50 aspect-square sm:aspect-auto"></div>
        <div className="absolute inset-0 pointer-events-none border-[20px] sm:border-[40px] border-black/10 rounded-2xl transition-opacity group-hover:opacity-0"></div>
      </div>
      
      {isLoading && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 text-pink-600 font-bold">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm tracking-wide">Reading message...</span>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Center the QR code in the frame to reveal the hidden love message.
        </p>
      </div>
    </div>
  );
}
