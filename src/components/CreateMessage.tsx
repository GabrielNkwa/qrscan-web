import React, { useState, useCallback } from 'react';
import { useMessages } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';
import { uploadFile } from '../constants/storage';
import { Heart, Share2, Copy, Check, Mic, Video, X, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function CreateMessage() {
  const [message, setMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { createMessage } = useMessages();
  const { user, tier } = useAuth();
  const isPro = tier === 'pro';

  const handleShareQr = async () => {
    if (!messageId || !user || !navigator.share) {
        alert('Sharing is not supported in this browser, or message not created yet.');
        return;
    }
    try {
      await navigator.share({
        title: 'Love QR Code',
        text: 'Check out this love message!',
        url: `${window.location.origin}/message/${user.uid}/${messageId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const generateQR = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please write a message first');
      return;
    }

    if (!user) {
      alert('You must be logged in to create a message');
      return;
    }

    setIsGenerating(true);
    try {
      let finalAudioUrl = undefined;
      let finalVideoUrl = undefined;

      if (isPro && audioFile) {
        finalAudioUrl = await uploadFile(audioFile, user.uid, 'audio');
      }

      if (isPro && videoFile) {
        finalVideoUrl = await uploadFile(videoFile, user.uid, 'video');
      }

      const id = await createMessage(
        message.trim(), 
        recipientName.trim() || undefined,
        finalAudioUrl,
        finalVideoUrl
      );
      
      if (!id) {
        alert('Failed to generate QR code');
        return;
      }

      // Instead of JSON, we encode the full URL for better camera scanner compatibility
      const url = `${window.location.origin}/message/${user.uid}/${id}`;
      
      setQrData(url);
      setMessageId(id);
    } catch (error) {
      console.error('Error generating QR:', error);
      alert('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  }, [message, recipientName, createMessage, user, isPro, audioFile, videoFile]);

  const copyLink = useCallback(async () => {
    if (!messageId || !user) return;
    const link = `${window.location.origin}/message/${user.uid}/${messageId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [messageId, user]);

  if (qrData) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-3 sm:p-4 bg-pink-50 rounded-2xl w-full flex justify-center">
            <QRCodeSVG 
                value={qrData} 
                size={window.innerWidth < 640 ? 200 : 256}
                level="H"
                includeMargin={true}
                className="max-w-full h-auto"
                imageSettings={{
                    src: "/favicon.svg",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                }}
            />
          </div>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Your Love QR is Ready!</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-2">Share this code with your special someone to reveal your message.</p>
        
        <div className="space-y-3 px-2 sm:px-0">
          <button 
            onClick={handleShareQr}
            className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3 sm:py-4 rounded-xl font-semibold hover:bg-pink-700 active:scale-95 transition-all"
          >
            <Share2 size={20} /> Share QR Code
          </button>
          
          <button 
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 border-2 border-pink-100 text-pink-600 py-3 sm:py-4 rounded-xl font-semibold hover:bg-pink-50 active:scale-95 transition-all"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'Copied!' : 'Copy Message Link'}
          </button>
          
          <button 
            onClick={() => { setQrData(null); setMessage(''); setRecipientName(''); }}
            className="w-full text-gray-500 py-2 text-sm hover:underline"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-5 sm:p-6 bg-white rounded-3xl shadow-xl">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="bg-pink-100 p-3 rounded-full mb-3">
          <Heart className="text-pink-600 fill-pink-600" size={32} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Create Love Message</h1>
        <p className="text-sm sm:text-base text-gray-500">Write from the heart</p>
      </div>

      <form onSubmit={generateQR} className="space-y-5 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">To (Optional)</label>
          <input
            type="text"
            className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-gray-800"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Recipient's name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Your Message</label>
          <textarea
            className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all min-h-[120px] sm:min-h-[150px] resize-none text-gray-800"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your heartfelt message here..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <button
              type="button"
              className={`w-full flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 border-dashed transition-all active:scale-95 ${
                audioFile ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'
              } ${!isPro && 'opacity-50 cursor-not-allowed'}`}
              onClick={() => isPro && document.getElementById('audio-input')?.click()}
            >
              <Mic size={24} className={audioFile ? 'text-pink-600' : 'text-gray-400'} />
              <span className="text-[10px] sm:text-xs mt-1 font-medium text-gray-600">{audioFile ? 'Audio Added' : 'Add Audio'}</span>
              {!isPro && <span className="text-[10px] text-pink-500 font-bold mt-0.5">PRO</span>}
            </button>
            <input
              id="audio-input"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />
            {audioFile && (
              <button 
                type="button"
                className="absolute -top-2 -right-2 bg-white rounded-full shadow-md p-1 border border-pink-100"
                onClick={() => setAudioFile(null)}
              >
                <X size={14} className="text-pink-600" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className={`w-full flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 border-dashed transition-all active:scale-95 ${
                videoFile ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'
              } ${!isPro && 'opacity-50 cursor-not-allowed'}`}
              onClick={() => isPro && document.getElementById('video-input')?.click()}
            >
              <Video size={24} className={videoFile ? 'text-pink-600' : 'text-gray-400'} />
              <span className="text-[10px] sm:text-xs mt-1 font-medium text-gray-600">{videoFile ? 'Video Added' : 'Add Video'}</span>
              {!isPro && <span className="text-[10px] text-pink-500 font-bold mt-0.5">PRO</span>}
            </button>
            <input
              id="video-input"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
            {videoFile && (
              <button 
                type="button"
                className="absolute -top-2 -right-2 bg-white rounded-full shadow-md p-1 border border-pink-100"
                onClick={() => setVideoFile(null)}
              >
                <X size={14} className="text-pink-600" />
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !message.trim()}
          className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-lg hover:bg-pink-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-200"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <Heart fill="white" size={20} />}
          {isGenerating ? 'Generating...' : 'Generate Love QR'}
        </button>
      </form>
    </div>
  );
}
