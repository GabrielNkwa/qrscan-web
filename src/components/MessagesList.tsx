import { useState, useMemo } from 'react';
import { useMessages, type Message } from '../context/MessagesContext';
import { useAuth } from '../context/AuthContext';
import { uploadFile } from '../constants/storage';
import { 
  Heart, 
  Edit3, 
  Trash2, 
  X, 
  Clock, 
  MessageCircle, 
  Mic, 
  Video, 
  QrCode, 
  Share2, 
  Loader2, 
  Check, 
  Copy
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

export default function MessagesList() {
  const { messages, isLoading, updateMessage, deleteMessage } = useMessages();
  const { user, tier } = useAuth();
  const isPro = tier === 'pro';
  
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [selectedQrMessage, setSelectedQrMessage] = useState<Message | null>(null);
  const [selectedViewMessage, setSelectedViewMessage] = useState<Message | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [editContent, setEditContent] = useState('');
  const [editAudioFile, setEditAudioFile] = useState<File | null>(null);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [messages]);

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setEditContent(message.content);
    setEditAudioFile(null);
    setEditVideoFile(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage || !editContent.trim() || !user) return;
    
    setIsSaving(true);
    try {
      let finalAudioUrl = editingMessage.audioUrl;
      let finalVideoUrl = editingMessage.videoUrl;

      if (isPro && editAudioFile) {
        finalAudioUrl = await uploadFile(editAudioFile, user.uid, 'audio');
      }

      if (isPro && editVideoFile) {
        finalVideoUrl = await uploadFile(editVideoFile, user.uid, 'video');
      }

      await updateMessage(
        editingMessage.id, 
        editContent.trim(),
        finalAudioUrl,
        finalVideoUrl
      );
      setEditingMessage(null);
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this message? This cannot be undone.')) {
      deleteMessage(id);
    }
  };

  const copyLink = async (messageId: string) => {
    if (!user) return;
    const link = `${window.location.origin}/message/${user.uid}/${messageId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareQr = async (messageId: string) => {
    if (!user || !navigator.share) {
      alert('Sharing is not supported in this browser.');
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-pink-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold">Loading your history...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl text-center">
        <div className="bg-pink-50 p-4 rounded-full inline-block mb-4">
          <Heart className="text-pink-200" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No messages yet</h2>
        <p className="text-gray-500 mb-8">Start by creating your first love QR message!</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors"
        >
          Create Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-0 pb-24 sm:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-pink-100 p-2 rounded-full">
          <Clock className="text-pink-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Message History</h1>
      </div>

      <div className="space-y-4">
        {sortedMessages.map((msg) => (
          <div key={msg.id} className="bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-4 sm:p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-pink-50 p-1.5 rounded-lg">
                    <MessageCircle size={16} className="text-pink-600" />
                  </div>
                  <span className="font-bold text-gray-800">
                    {msg.recipientName || 'Someone Special'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} />
                  {formatDistanceToNow(msg.updatedAt, { addSuffix: true })}
                </span>
              </div>

              <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                {msg.content}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {msg.audioUrl && (
                  <div className="flex items-center gap-1 bg-pink-50 px-2 py-1 rounded-md text-[10px] font-bold text-pink-600 uppercase tracking-wider">
                    <Mic size={12} /> Audio
                  </div>
                )}
                {msg.videoUrl && (
                  <div className="flex items-center gap-1 bg-pink-50 px-2 py-1 rounded-md text-[10px] font-bold text-pink-600 uppercase tracking-wider">
                    <Video size={12} /> Video
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setSelectedViewMessage(msg)}
                    className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                    title="View Message"
                  >
                    <Heart size={18} />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  <button 
                    onClick={() => setSelectedQrMessage(msg)}
                    className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                    title="View QR Code"
                  >
                    <QrCode size={18} />
                    <span className="hidden sm:inline">QR Code</span>
                  </button>
                  <button 
                    onClick={() => handleEdit(msg)}
                    className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                    title="Edit Message"
                  >
                    <Edit3 size={18} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </div>
                <button 
                  onClick={() => handleDelete(msg.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                  title="Delete"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Modal */}
      {selectedQrMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 text-center">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">QR Code</h3>
                <button 
                  onClick={() => setSelectedQrMessage(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="bg-pink-50 p-4 rounded-2xl inline-block mb-6">
                <QRCodeSVG 
                  value={`${window.location.origin}/message/${user?.uid}/${selectedQrMessage.id}`} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.svg",
                    x: undefined,
                    y: undefined,
                    height: 32,
                    width: 32,
                    excavate: true,
                  }}
                />
              </div>

              <p className="text-sm text-gray-500 mb-8 px-4">
                QR for <span className="text-pink-600 font-bold">{selectedQrMessage.recipientName || 'Someone Special'}</span>
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleShareQr(selectedQrMessage.id)}
                  className="flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-pink-700 active:scale-95 transition-all"
                >
                  <Share2 size={18} /> Share
                </button>
                <button 
                  onClick={() => copyLink(selectedQrMessage.id)}
                  className="flex items-center justify-center gap-2 border-2 border-pink-100 text-pink-600 py-3 rounded-xl font-bold text-sm hover:bg-pink-50 active:scale-95 transition-all"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Message</h3>
                <button 
                  onClick={() => setEditingMessage(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Message</label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all min-h-[150px] resize-none text-gray-800"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all active:scale-95 ${
                        (editAudioFile || editingMessage.audioUrl) ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                      } ${!isPro && 'opacity-50 cursor-not-allowed'}`}
                      onClick={() => isPro && document.getElementById('edit-audio-input')?.click()}
                    >
                      <Mic size={20} className={(editAudioFile || editingMessage.audioUrl) ? 'text-pink-600' : 'text-gray-400'} />
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-gray-500">
                        {(editAudioFile || editingMessage.audioUrl) ? 'Audio Added' : 'Add Audio'}
                      </span>
                    </button>
                    <input
                      id="edit-audio-input"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => setEditAudioFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all active:scale-95 ${
                        (editVideoFile || editingMessage.videoUrl) ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                      } ${!isPro && 'opacity-50 cursor-not-allowed'}`}
                      onClick={() => isPro && document.getElementById('edit-video-input')?.click()}
                    >
                      <Video size={20} className={(editVideoFile || editingMessage.videoUrl) ? 'text-pink-600' : 'text-gray-400'} />
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-gray-500">
                        {(editVideoFile || editingMessage.videoUrl) ? 'Video Added' : 'Add Video'}
                      </span>
                    </button>
                    <input
                      id="edit-video-input"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => setEditVideoFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !editContent.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-pink-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {selectedViewMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Heart size={20} className="text-pink-600 fill-pink-600" />
                  <h3 className="text-xl font-bold text-gray-800">Love Message</h3>
                </div>
                <button 
                  onClick={() => setSelectedViewMessage(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="bg-pink-50 p-6 rounded-2xl mb-6 shadow-inner border border-pink-100">
                <p className="text-[10px] text-pink-500 font-bold mb-2 uppercase tracking-widest">
                  {selectedViewMessage.recipientName ? `To ${selectedViewMessage.recipientName}` : 'For Someone Special'}
                </p>
                <p className="text-lg text-gray-800 leading-relaxed font-medium mb-4 break-words whitespace-pre-wrap">
                  {selectedViewMessage.content}
                </p>
                <p className="text-[10px] text-pink-300 font-medium italic">
                  Created {formatDistanceToNow(selectedViewMessage.createdAt, { addSuffix: true })}
                </p>
              </div>

              <div className="space-y-4">
                {selectedViewMessage.audioUrl && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                      <Mic size={14} className="text-pink-500" /> Voice Message
                    </label>
                    <audio controls className="w-full h-10 bg-pink-50 rounded-lg">
                      <source src={selectedViewMessage.audioUrl} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
                {selectedViewMessage.videoUrl && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                      <Video size={14} className="text-pink-500" /> Video Message
                    </label>
                    <video controls className="w-full rounded-xl shadow-md border border-pink-100">
                      <source src={selectedViewMessage.videoUrl} type="video/mp4" />
                    </video>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
