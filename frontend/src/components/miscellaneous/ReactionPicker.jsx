// components/ReactionPicker.jsx
import EmojiPicker from 'emoji-picker-react';

const ReactionPicker = ({ onEmojiClick, onClose }) => {
    return (
        <div className="absolute bottom-full left-0 z-40">
            <EmojiPicker onEmojiClick={(emojiData) => {
                onEmojiClick(emojiData.emoji);
                onClose();
            }} height={300} width={250} />
        </div>
    );
};

export default ReactionPicker;
