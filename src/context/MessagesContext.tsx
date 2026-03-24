/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  collection,
  onSnapshot,
  query,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../constants/firebase';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  recipientName?: string;
  audioUrl?: string;
  videoUrl?: string;
}

interface MessagesContextType {
  messages: Message[];
  isLoading: boolean;
  createMessage: (
    content: string,
    recipientName?: string,
    audioUrl?: string,
    videoUrl?: string,
  ) => Promise<string | undefined>;
  updateMessage: (id: string, content: string, audioUrl?: string, videoUrl?: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  getMessageById: (id: string) => Message | undefined;
}

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined,
);

function useMessagesContextValue() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const messagesRef = collection(db, 'users', user.uid, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          content: data.content,
          recipientName: data.recipientName,
          audioUrl: data.audioUrl,
          videoUrl: data.videoUrl,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
        });
      });
      setMessages(msgs);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createMessage = useCallback(
    async (content: string, recipientName?: string, audioUrl?: string, videoUrl?: string) => {
      if (!user) return undefined;

      const messagesRef = collection(db, 'users', user.uid, 'messages');
      const newMessageRef = doc(messagesRef);
      
      const data: any = {
        content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (recipientName !== undefined) data.recipientName = recipientName;
      if (audioUrl !== undefined) data.audioUrl = audioUrl;
      if (videoUrl !== undefined) data.videoUrl = videoUrl;
      
      await setDoc(newMessageRef, data);
      return newMessageRef.id;
    },
    [user],
  );

  const updateMessage = useCallback(
    async (id: string, content: string, audioUrl?: string, videoUrl?: string) => {
      if (!user) return;

      const messageRef = doc(db, 'users', user.uid, 'messages', id);
      const data: any = {
        content,
        updatedAt: serverTimestamp(),
      };

      if (audioUrl !== undefined) data.audioUrl = audioUrl;
      if (videoUrl !== undefined) data.videoUrl = videoUrl;

      await updateDoc(messageRef, data);
    },
    [user],
  );

  const deleteMessage = useCallback(
    async (id: string) => {
      if (!user) return;

      const messageRef = doc(db, 'users', user.uid, 'messages', id);
      await deleteDoc(messageRef);
    },
    [user],
  );

  const getMessageById = useCallback(
    (id: string) => {
      return messages.find(msg => msg.id === id);
    },
    [messages],
  );

  return useMemo(
    () => ({
      messages,
      isLoading,
      createMessage,
      updateMessage,
      deleteMessage,
      getMessageById,
    }),
    [
      messages,
      isLoading,
      createMessage,
      updateMessage,
      deleteMessage,
      getMessageById,
    ],
  );
}

export function MessagesProvider({ children }: PropsWithChildren) {
  const value = useMessagesContextValue();
  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};
