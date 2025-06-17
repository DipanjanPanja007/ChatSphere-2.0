import React from 'react'

const RenderReplyPreview = (replyTo) => {
    const type = replyTo?.attachments?.[0]?.fileType;

    return (
        <div
            className={`mb-1 p-2 rounded text-sm bg-violet-400 cursor-pointer `}
        >
            <div className="font-semibold mb-1">
                {replyTo.sender.name}
            </div>


            {replyTo.attachments?.length > 0 && (
                <div className="mt-1">
                    {type === 'image' || type === 'gif' ? (
                        <img
                            src={replyTo.attachments[0].url}
                            className="max-w-[5rem] max-h-[5rem] rounded object-contain"
                            alt="reply media"
                        />
                    ) : type === 'video' ? (
                        <div className="w-20 h-10 bg-black text-white text-xs flex items-center justify-center rounded">
                            Video file
                        </div>
                    ) : type === 'audio' ? (
                        <div className="w-20 h-10 bg-gray-400 text-white text-xs flex items-center justify-center rounded">
                            Audio file
                        </div>
                    ) : (
                        <div className="text-xs text-blue-600 underline break-all">
                            {replyTo.attachments[0].fileType || 'file'}
                        </div>
                    )}
                </div>
            )}
            {replyTo.content && (
                <div className="italic line-clamp-2">{replyTo.content}</div>
            )}
        </div>
    );
};

export default RenderReplyPreview;