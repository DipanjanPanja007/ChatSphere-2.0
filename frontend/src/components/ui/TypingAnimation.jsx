import React from "react";

function TypingAnimation() {
    // Keyframes for the typing animation
    const typingAnimation = `
    @keyframes typing {
      0% {
        transform: translateY(0);
        background-color: #6CAD96;
      }
      28% {
        transform: translateY(-7px);
        background-color: #9ECAB9;
      }
      44% {
        transform: translateY(0);
        background-color: #B5D9CB;
      }
    }
  `;

    return (
        <>
            {/* Embedding keyframes as a style tag */}
            <style>
                {`
          ${typingAnimation}

          .chat-bubble {
            background-color: #E6F8F1;
            padding: 16px 28px;
            border-radius: 20px;
            border-bottom-left-radius: 2px;
            display: inline-block;
          }

          .typing {
            display: flex;
            align-items: center;
            height: 17px;
          }

          .dot {
            height: 7px;
            width: 7px;
            background-color: #6CAD96;
            border-radius: 50%;
            margin-right: 4px;
            animation: typing 1.8s infinite ease-in-out;
          }

          .dot:nth-child(1) {
            animation-delay: 200ms;
          }

          .dot:nth-child(2) {
            animation-delay: 300ms;
          }

          .dot:nth-child(3) {
            animation-delay: 400ms;
          }

          .dot:last-child {
            margin-right: 0;
          }
        `}
            </style>

            {/* Typing Animation Component */}
            <div className="chat-bubble">
                <div className="typing">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            </div>
        </>
    );
}

export default TypingAnimation;
