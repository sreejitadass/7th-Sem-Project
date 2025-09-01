import React from "react";
import { useEffect } from "react";

const ChatWidget = ({ chatbotId }) => {
  useEffect(() => {
    if (!chatbotId) return;

    // Inject Chatbase config + script
    const cfg = document.createElement("script");
    cfg.innerHTML = `window.chatbaseConfig = { chatbotId: "${chatbotId}" };`;
    const s = document.createElement("script");
    s.src = "https://www.chatbase.co/embed.min.js";
    s.id = chatbotId;
    s.defer = true;

    document.head.appendChild(cfg);
    document.head.appendChild(s);

    return () => {
      // Cleanup on unmount to avoid duplicates across route changes
      cfg.remove();
      s.remove();
      // Remove any injected container if needed
      const w = document.querySelector(`#${chatbotId}`);
      if (w) w.remove();
    };
  }, [chatbotId]);

  return null;
};

export default ChatWidget;
