import React, { useState } from "react";

const WhatsAppWidget = () => {
  const [hovered, setHovered] = useState(false);
  const phoneNumber = "23480383828292";
  const message = "Hello! I'm interested in your jewelry collection.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 no-underline group cursor-pointer"
      style={{ textDecoration: "none" }}
    >
      {/* Tooltip label — desktop only */}
      <span
        className="hidden md:flex items-center bg-white text-[rgba(68,68,68,1)] text-sm font-medium px-4 py-2.5 rounded-full shadow-lg border border-black/5 transition-all duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(10px)",
          pointerEvents: "none",
          fontFamily: "'Helvetica', 'Arial', sans-serif",
        }}
      >
        Chat with us
      </span>

      {/* WhatsApp button */}
      <div
        className="relative flex items-center justify-center w-14 h-14 md:w-[60px] md:h-[60px] rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        style={{
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
        }}
      >
        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: "rgba(37, 211, 102, 0.3)",
            animationDuration: "2s",
          }}
        />

        {/* WhatsApp icon */}
        <svg
          viewBox="0 0 32 32"
          fill="white"
          className="w-7 h-7 md:w-8 md:h-8 relative z-10"
        >
          <path d="M16.004 0C7.166 0 .002 7.163.002 16c0 2.822.737 5.58 2.14 8.012L.012 32l8.188-2.09A15.93 15.93 0 0 0 16.004 32C24.838 32 32 24.837 32 16S24.838 0 16.004 0Zm0 29.09a13.05 13.05 0 0 1-6.66-1.823l-.477-.284-4.953 1.3 1.322-4.833-.312-.496A13.02 13.02 0 0 1 2.913 16c0-7.222 5.878-13.09 13.09-13.09 7.213 0 13.085 5.868 13.085 13.09 0 7.222-5.872 13.09-13.084 13.09Zm7.17-9.803c-.393-.197-2.327-1.148-2.688-1.279-.36-.131-.623-.197-.885.197-.263.393-1.016 1.279-1.246 1.542-.23.263-.46.296-.853.098-.393-.197-1.66-.612-3.163-1.95-1.17-1.04-1.96-2.326-2.19-2.72-.23-.392-.024-.604.173-.8.177-.177.393-.46.59-.69.196-.23.262-.394.393-.656.131-.263.066-.493-.033-.69-.098-.197-.885-2.134-1.213-2.922-.32-.766-.644-.663-.885-.675-.23-.011-.493-.014-.755-.014s-.69.098-1.05.493c-.361.394-1.378 1.346-1.378 3.283 0 1.937 1.41 3.808 1.608 4.07.197.263 2.776 4.24 6.727 5.946.94.406 1.674.648 2.246.83.944.3 1.803.257 2.482.156.757-.113 2.327-.951 2.655-1.87.328-.918.328-1.705.23-1.87-.099-.163-.362-.262-.755-.459Z" />
        </svg>
      </div>
    </a>
  );
};

export default WhatsAppWidget;
