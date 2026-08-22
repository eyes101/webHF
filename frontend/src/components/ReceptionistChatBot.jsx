// components/ReceptionistChatBot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { CONTACTS, whatsappLink } from '../config/contacts';
import './ReceptionistChatBot.css';

// Receptionist knowledge base & conversational responder
const RECEPTIONIST_RESPONSES = [
  {
    triggers: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'help'],
    response: `Good day! Welcome to Halfcon House Care & Electronics Sales. My name is Ada from the front-desk reception desk. 😊\n\nIt is my absolute pleasure to assist you today. You can ask me anything about our appliances, home maintenance services, 20% discount code, physical outlets, or hiring verified artisans with escrow protection. How may I help you?`,
  },
  {
    triggers: ['discount', 'promo', 'coupon', 'code', '20%', 'halfcon20', 'offer', 'cheaper'],
    response: `You are in luck! 🎉 We are currently running an official **20% Promotional Discount** across all appliances, home care services, and supplies.\n\n• **Promo Code:** \`HALFCON20\`\n• **Applicable on:** Solar inverters, Smart TVs, Inverter ACs, curtains, kitchen cabinetry, and all maintenance tasks.\n• You can apply it directly during checkout or mention it to our dispatch team!`,
  },
  {
    triggers: ['location', 'address', 'where are you', 'office', 'branch', 'store', 'shop', 'ikorodu', 'alaba', 'showroom'],
    response: `You are very welcome to visit our physical showrooms and warehouses in Lagos! 🏬\n\n📍 **1. Ikorodu Branch & Warehouse:**\n${CONTACTS.addressIkorodu}\n📞 Hotline: ${CONTACTS.whatsappDisplay}\n\n📍 **2. Alaba International Market Outlet:**\n${CONTACTS.addressAlaba}\n📞 Hotline: ${CONTACTS.phoneSecondary}\n\nOur engineers and customer service reps are on-ground Monday through Saturday (8:00 AM – 6:00 PM).`,
  },
  {
    triggers: ['artisan', 'hire', 'technician', 'plumber', 'electrician', 'carpenter', 'painter', 'escrow', 'negotiate'],
    response: `Hiring a technician through Halfcon is 100% secure with our **Mathematical Escrow Protection** 🛡️\n\n1. Go to the **Services** or **Artisans** page.\n2. Click **"🤝 Hire Artisan & Escrow Task"** on any trade.\n3. Enter your task scope and materials budget.\n4. **Milestone 1 (Materials + 30% labor)** is held safely in escrow.\n5. The remaining **70% labor fee** is released ONLY after you inspect the completed work and approve it!`,
  },
  {
    triggers: ['product', 'appliance', 'tv', 'solar', 'inverter', 'battery', 'ac', 'fan', 'pump', 'paint', 'curtain', 'blind', 'wire', 'cable'],
    response: `We stock 100% genuine, brand-new electrical appliances, home cooling, and maintenance materials with official warranties! ⚡📺\n\n• **Solar & Power:** 5KVA Hybrid Inverter Kits, Lithium Batteries, 5000VA Digital AVR Stabilizers.\n• **Home Electronics:** 55" Frameless 4K Smart TVs, Rechargeable Solar Standing Fans, 1.5HP Inverter ACs.\n• **Plumbing & Water:** 1.5HP Deep-Well Borehole Pumps, PN20 PPR Hot/Cold pipes.\n• **Decor & Surface:** Custom Empire Curtains, Motorized Blinds, 20L Weather-Shield Wall Paint, and Bitumen Waterproofing Membrane.\n\nClick on the **"Products"** link at the top to explore all 20% discounted stock!`,
  },
  {
    triggers: ['payment', 'pay', 'paystack', 'card', 'bank', 'transfer', 'naira', 'account', 'ussd'],
    response: `Our payment section is secured and encrypted via **Paystack** 💳\n\nWe accept:\n• Nigerian Naira Debit Cards (Mastercard, Visa, Verve)\n• Direct Bank Transfers & USSD Banking\n• Halfcon Escrow Protection for technical and maintenance jobs.\n\nEvery successful payment automatically issues an instant digital invoice and SMS/email confirmation.`,
  },
  {
    triggers: ['track', 'order', 'status', 'where is my order', 'delivery', 'dispatch'],
    response: `Tracking your order is instant and seamless! 🚚\n\n1. Click **"Track Order"** in the top navigation or enter your **Order ID** (e.g. \`ord_...\`) on our homepage tracking bar.\n2. You can view your real-time 4-stage milestone progress (*Order Placed ➔ Payment Confirmed ➔ In Progress ➔ Completed*).\n3. You can also chat live with our dispatch operations supervisor directly on your tracking screen!`,
  },
  {
    triggers: ['inspection', 'visit', 'engineer', 'quote', 'estimate', 'site'],
    response: `We offer **100% Free Senior Engineer Site Visits & Inspections** anywhere in Lagos! 📐🏢\n\nOur project engineer will visit your site, take technical measurements, inspect your electrical load or plumbing lines, and deliver a transparent quotation with our 20% discount applied.\n\nClick **"📅 Book Free Site Visit"** on the homepage to schedule yours!`,
  },
  {
    triggers: ['contact', 'phone', 'whatsapp', 'call', 'talk', 'human', 'agent', 'number', 'email'],
    response: `Our human customer service and dispatch desk is always happy to speak with you! 📞\n\n• **Main Phone / WhatsApp:** ${CONTACTS.whatsappDisplay}\n• **Alaba Market Line:** ${CONTACTS.phoneSecondary}\n• **Email Support:** ${CONTACTS.email}\n• **Official Website:** ${CONTACTS.website}\n\nWould you like me to open a direct WhatsApp chat for you right now?`,
  },
];

const DEFAULT_FALLBACK = `Thank you for asking! As the receptionist for Halfcon, I specialize in assisting you with our home care maintenance services, genuine electronics sales, 20% discount codes, store addresses in Ikorodu & Alaba, and verified artisan bookings.\n\nCould you please let me know if you would like assistance with an appliance order, a maintenance service, or contacting our team?`;

const QUICK_SUGGESTIONS = [
  '⚡ 20% Discount Code',
  '🤝 How to Hire an Artisan',
  '📍 Physical Store Addresses',
  '📺 Products & Appliances List',
  '💳 Payment & Paystack Safety',
  '📦 How to Track My Order',
  '📞 Talk to Human on WhatsApp',
];

export default function ReceptionistChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello and welcome to Halfcon! 🌟 My name is Ada, your front-desk receptionist.\n\nHow may I gladly assist you with your home maintenance, electronics shopping, or service bookings today?`,
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const generateBotReply = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // Check for WhatsApp request
    if (q.includes('human') || q.includes('whatsapp') || q.includes('call') || q.includes('phone') || q.includes('speak')) {
      return `Certainly! Our customer service supervisor is available right now on WhatsApp at **${CONTACTS.whatsappDisplay}**.\n\n[Click here to chat on WhatsApp](${whatsappLink('Hello Halfcon Front Desk, I would like to speak with a customer care representative.')}) or call **${CONTACTS.phoneSecondary}**.`;
    }

    for (const item of RECEPTIONIST_RESPONSES) {
      if (item.triggers.some((trigger) => q.includes(trigger))) {
        return item.response;
      }
    }
    return DEFAULT_FALLBACK;
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    setHasInteracted(true);
    const userMsg = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateBotReply(text);
      const botMsg = {
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 600 + Math.random() * 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="reception-bot-wrapper">
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="reception-trigger-btn"
          onClick={() => {
            setIsOpen(true);
            setHasInteracted(true);
          }}
          aria-label="Open Halfcon Reception Desk AI Chat"
        >
          <div className="trigger-pulse-ring" />
          <div className="trigger-avatar-circle">
            <span className="trigger-avatar-icon">👩‍💼</span>
            <span className="trigger-status-dot" />
          </div>
          <div className="trigger-label-pill">
            <span className="trigger-label-title">Reception Desk</span>
            <span className="trigger-label-sub">Ask Ada · Online</span>
          </div>
        </button>
      )}

      {/* Floating Chat Pop-up Modal */}
      {isOpen && (
        <div className="reception-chat-card">
          {/* Header */}
          <div className="reception-header">
            <div className="reception-header-profile">
              <div className="reception-avatar-wrap">
                <span className="reception-avatar-img">👩‍💼</span>
                <span className="reception-online-badge" />
              </div>
              <div>
                <div className="reception-name">Ada &middot; Halfcon Reception</div>
                <div className="reception-title">Front-Desk AI Assistant &middot; 24/7</div>
              </div>
            </div>

            <div className="reception-header-actions">
              <a
                href={whatsappLink('Hello Halfcon, I am chatting from the website reception desk and need assistance.')}
                target="_blank"
                rel="noopener noreferrer"
                className="reception-wa-link"
                title="Transfer to WhatsApp Live Desk"
              >
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981z"/></svg>
              </a>
              <button
                type="button"
                className="reception-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="reception-banner">
            <span>⚡ Use code <strong>HALFCON20</strong> for 20% OFF all orders</span>
          </div>

          {/* Message Stream */}
          <div className="reception-messages-area">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble-row ${msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="bubble-bot-avatar">👩‍💼</div>
                )}

                <div className="bubble-content-wrap">
                  <div className="bubble-body">
                    {msg.text.split('\n').map((paragraph, pIdx) => {
                      if (!paragraph.trim()) return <div key={pIdx} style={{ height: '6px' }} />;
                      
                      // Check for WhatsApp Markdown link
                      if (paragraph.includes('[Click here to chat on WhatsApp]')) {
                        return (
                          <div key={pIdx} style={{ marginTop: '8px' }}>
                            <a
                              href={whatsappLink('Hello Halfcon Front Desk, I would like to speak with a customer care representative.')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chat-wa-cta-btn"
                            >
                              💬 Open WhatsApp Hotline ({CONTACTS.whatsappDisplay})
                            </a>
                          </div>
                        );
                      }

                      return <p key={pIdx} style={{ margin: '0 0 4px 0' }}>{paragraph}</p>;
                    })}
                  </div>
                  <span className="bubble-timestamp">{msg.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-row bubble-bot">
                <div className="bubble-bot-avatar">👩‍💼</div>
                <div className="bubble-typing-indicator">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="reception-quick-chips">
            {QUICK_SUGGESTIONS.map((chip, cIdx) => (
              <button
                key={cIdx}
                type="button"
                className="chip-btn"
                onClick={() => handleSendMessage(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="reception-input-form"
          >
            <input
              type="text"
              className="reception-input"
              placeholder="Ask Ada anything about Halfcon..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="reception-send-btn"
              disabled={!inputVal.trim()}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
