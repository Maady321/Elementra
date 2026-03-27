import { useState } from 'react';
import { HiOutlineChatAlt2, HiOutlineX } from 'react-icons/hi';
import ChatWindow from './ChatWindow';
import './Chatbot.css';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-widget__window-container">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      <button 
        className={`chat-widget__toggle ${isOpen ? 'chat-widget__toggle--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? <HiOutlineX size={24} /> : <HiOutlineChatAlt2 size={24} />}
      </button>
    </div>
  );
}
