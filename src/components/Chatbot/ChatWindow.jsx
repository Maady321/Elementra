import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { HiOutlineArrowCircleRight, HiOutlinePaperAirplane, HiOutlineDotsVertical } from 'react-icons/hi';

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi 👋 Welcome to Elementra. We build websites for businesses 🚀', options: ['View Pricing', 'Get Free Demo', 'Talk to Developer'] }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [leadId, setLeadId] = useState(null);
  const [step, setStep] = useState('options'); // options, demo_name, demo_type, demo_pages, demo_plan, finished
  const [tempLead, setTempLead] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message) => {
    setMessages(prev => [...prev, { id: Date.now(), ...message }]);
  };

  const handleOptionClick = async (option) => {
    addMessage({ sender: 'user', text: option });

    if (option === 'View Pricing') {
      setTimeout(() => {
        addMessage({ 
          sender: 'bot', 
          text: 'Here are our standard plans:\n\n💎 Basic – ₹1499\n💎 Standard – ₹3499\n💎 Premium – ₹5999', 
          options: ['Get Free Demo', 'Talk to Developer'] 
        });
      }, 500);
    } else if (option === 'Get Free Demo') {
      setStep('demo_name');
      setTimeout(() => {
        addMessage({ sender: 'bot', text: 'Great! Let\'s get some details. What is your Business Name?' });
      }, 500);
    } else if (option === 'Talk to Developer') {
      setTimeout(() => {
        addMessage({ 
          sender: 'bot', 
          text: 'Sure! You can talk to our developer directly on WhatsApp for a faster response. 🚀',
          options: ['Contact on WhatsApp']
        });
      }, 500);
    } else if (option === 'Contact on WhatsApp') {
      window.open('https://wa.me/919746520910?text=Hi! I was talking to the bot on your website and wanted to discuss a project.', '_blank');
      addMessage({ sender: 'bot', text: 'Opening WhatsApp for you... Let us know if you need anything else!' });
    }
  };

  const handleUserInput = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const currentInput = inputValue;
    setInputValue('');
    addMessage({ sender: 'user', text: currentInput });

    if (step === 'demo_name') {
      setTempLead({ ...tempLead, name: currentInput });
      setStep('demo_email');
      setTimeout(() => {
        addMessage({ sender: 'bot', text: 'Got it! And what is your best Email Address? (to reach you)' });
      }, 500);
    } else if (step === 'demo_email') {
      setTempLead({ ...tempLead, email: currentInput });
      setStep('demo_type');
      setTimeout(() => {
        addMessage({ sender: 'bot', text: 'Thanks! Now, what type of business is it?' });
      }, 500);
    } else if (step === 'demo_type') {
      setTempLead({ ...tempLead, business_type: currentInput });
      setStep('demo_pages');
      setTimeout(() => {
        addMessage({ sender: 'bot', text: 'How many pages do you expect?' });
      }, 500);
    } else if (step === 'demo_pages') {
      setTempLead({ ...tempLead, pages: parseInt(currentInput) || 1 });
      setStep('demo_plan');
      setTimeout(() => {
        addMessage({ sender: 'bot', text: 'Which plan fits you best?', options: ['Basic', 'Standard', 'Premium'] });
      }, 500);
    } else {
      // Normal chat after lead collection
      if (leadId) {
        await supabase.from('lead_messages').insert([{ lead_id: leadId, sender: 'user', message: currentInput }]);
      }
    }
  };

  const finishLead = async (plan) => {
    addMessage({ sender: 'user', text: plan });
    const finalLead = { ...tempLead, plan, status: 'new' };
    
    try {
      const { data, error } = await supabase.from('leads').insert([finalLead]).select().single();
      if (error) throw error;
      setLeadId(data.id);
      setStep('finished');

      // Save all initial messages to lead_messages table
      const initialMsgs = messages.map(m => ({
        lead_id: data.id,
        sender: m.sender,
        message: m.text
      }));
      await supabase.from('lead_messages').insert(initialMsgs);
      await supabase.from('lead_messages').insert([{ lead_id: data.id, sender: 'bot', message: 'Thanks! We will contact you soon. 🚀' }]);

      setTimeout(() => {
        addMessage({ sender: 'bot', text: 'Thanks! We will contact you soon. 🚀' });
      }, 500);
    } catch (err) {
      console.error('Lead error:', err.message);
    }
  };

  // Real-time listener for admin replies
  useEffect(() => {
    if (!leadId) return;
    const channel = supabase.channel(`lead_${leadId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lead_messages', filter: `lead_id=eq.${leadId}` }, (payload) => {
        if (payload.new.sender === 'admin') {
          addMessage({ sender: 'admin', text: payload.new.message });
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [leadId]);

  return (
    <div className="chat-window shadow-xl">
      <div className="chat-window__header">
        <div className="flex items-center gap-3">
          <div className="chat-window__avatar">E</div>
          <div>
            <h3 className="text-white font-semibold">Elementra Bot</h3>
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><HiOutlineX /></button>
      </div>

      <div className="chat-window__body">
        {messages.map((m) => (
          <div key={m.id} className={`chat-window__msg chat-window__msg--${m.sender}`}>
            <div className="chat-window__bubble">
               {m.text}
            </div>
            {m.options && (
              <div className="chat-window__options">
                {m.options.map((opt) => (
                  <button 
                    key={opt} 
                    onClick={() => step === 'demo_plan' ? finishLead(opt) : handleOptionClick(opt)} 
                    className="chat-window__opt-btn"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleUserInput} className="chat-window__footer">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="chat-window__input"
        />
        <button type="submit" className="chat-window__send">
          <HiOutlinePaperAirplane className="rotate-90" />
        </button>
      </form>
    </div>
  );
}

function HiOutlineX(props) {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M18 6L6 18M6 6l12 12"></path>
    </svg>
  );
}
