import { useCallback, useEffect, useState, useRef } from "react";
import chatService from "../../services/chatService";
import socket from "../../socket";

import { MoreVertical, Trash2, Edit } from "lucide-react";
import { toast } from "react-toastify";

const ConversationPage = ({ selectedUser }) => {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);

  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [openMenu, setOpenMenu] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");

  const messagesRef = useRef(null);
  const shouldScrollToBottomRef = useRef(false);
  const timeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const container = messagesRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await chatService.sendMessage({
        conversationId,
        receiverId: selectedUser._id,
        text: message,
      });

      shouldScrollToBottomRef.current = true;
      setMessage("");
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await chatService.deleteMessage(messageId, "me");
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      await chatService.deleteMessage(messageId, "everyone");
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
  };

  const handleEdit = (message) => {
    setEditingMessageId(message._id);
    setEditingText(message.text);
    setOpenMenu(null);
  };

  const handleSaveEdit = async (messageId) => {
    if (!editingText.trim()) return;

    try {
      await chatService.editMessage(messageId, editingText);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, text: editingText } : msg,
        ),
      );
      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || !hasMore || loading) return;
    setLoading(true);

    const container = messagesRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    try {
      const data = await chatService.getMessages(conversationId, cursor);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((msg) => msg._id));

        const newMessages = data.messages
          .filter((msg) => !existingIds.has(msg._id))
          .reverse();

        return [...newMessages, ...prev];
      });

      setCursor(data.nextCursor);
      setHasMore(data.hasMore);

      requestAnimationFrame(() => {
        if (!container) return;
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight;
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, cursor, hasMore, loading]);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        setLoading(true);

        const conversation = await chatService.createConversation(
          selectedUser._id,
        );

        setConversationId(conversation._id);

        const data = await chatService.getMessages(conversation._id);
        shouldScrollToBottomRef.current = true;
        setMessages([...data.messages].reverse());
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);

        await chatService.readReceiptes(conversation._id);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedUser) {
      loadConversation();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!conversationId) return;

    socket.emit("join-conversation", conversationId);

    const handleReceiveMessage = (newMessage) => {
      shouldScrollToBottomRef.current = true;
      setMessages((prev) => [...prev, newMessage]);

      if (newMessage.receiver._id === currentUser._id) {
        chatService.readReceiptes(conversationId);
      }

      if (newMessage.sender._id !== currentUser._id) {
        toast.info(`New message from ${newMessage.sender.name}`, {
          style: {
            background: "#4F46E5",
            color: "#fff",
          },
        });
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.emit("leave-conversation", conversationId);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [conversationId, currentUser._id]);

  useEffect(() => {
    const handleDeleteMessage = (messageId) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                text: "This message was deleted",
                isDeleted: true,
              }
            : msg,
        ),
      );
    };

    socket.on("msg-deleted-by-sender", handleDeleteMessage);

    return () => {
      socket.off("msg-deleted-by-sender", handleDeleteMessage);
    };
  }, []);

  useEffect(() => {
    const handleEditedMessage = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg,
        ),
      );
    };

    socket.on("msg-edited-by-sender", handleEditedMessage);

    return () => {
      socket.off("msg-edited-by-sender", handleEditedMessage);
    };
  }, []);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop <= 20) {
        loadMoreMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loadMoreMessages]);

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) return;

    shouldScrollToBottomRef.current = false;
    scrollToBottom();
  }, [messages.length, loading, scrollToBottom]);

  useEffect(() => {
    const handleReadMessages = ({
      conversationId: roomId,
      messageIds,
      readAt,
    }) => {
      if (roomId !== conversationId) return;

      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg._id) ? { ...msg, isRead: true, readAt } : msg,
        ),
      );
    };
    socket.on("messages-read", handleReadMessages);

    return () => socket.off("messages-read", handleReadMessages);
  }, [conversationId]);

  useEffect(() => {
    const handleTyping = ({ username }) => {
      setTypingMessage(`${username} is typing...`);
    };

    const handleStopTyping = () => {
      setTypingMessage("");
    };

    socket.on("display_typing", handleTyping);
    socket.on("hide_typing", handleStopTyping);

    return () => {
      socket.off("display_typing", handleTyping);
      socket.off("hide_typing", handleStopTyping);
    };
  }, [conversationId]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center ">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
        <div className="flex items-center justify-end">
          <div className="flex flex-col font-semibold text-2xl  items-center gap-4">
            {selectedUser.name}
          </div>
        </div>
      </header>

      {/* Messages */}

      <div ref={messagesRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col justify-end min-h-full">
          {loading && (
            <div className="flex justify-center py-2 mb-3">
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm border border-gray-200 text-sm text-gray-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`mb-3 flex group ${
                msg.sender?._id === currentUser._id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div className="relative flex flex-col">
                {editingMessageId === msg._id ? (
                  <div className="flex gap-2 items-end">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      autoFocus
                      className="flex-1 px-3 py-2 rounded-2xl border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleSaveEdit(msg._id)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-2 ${
                      msg.isDeleted
                        ? "bg-gray-200 text-gray-500 italic"
                        : msg.sender._id === currentUser._id
                          ? "bg-indigo-600 text-white"
                          : "bg-indigo-200 text-black"
                    }`}
                  >
                    {msg.isDeleted ? (
                      <span>This message was deleted</span>
                    ) : (
                      <span style={{ wordBreak: "break-word" }}>
                        {msg.text}
                      </span>
                    )}
                  </div>
                )}
                {msg.isEdited && (
                  <span className="text-xs italic flex justify-end opacity-70">
                    edited
                  </span>
                )}

                {msg.sender?._id === currentUser._id &&
                  msg._id === messages[messages.length - 1]?._id &&
                  msg.isRead && (
                    <span className="text-xs flex justify-end text-gray-400">
                      Seen
                    </span>
                  )}

                {msg.sender?._id === currentUser._id && !msg.isDeleted && (
                  <>
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === msg._id ? null : msg._id)
                      }
                      className="absolute top-1 -right-2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === msg._id && (
                      <div
                        className="absolute right-0 z-50 overflow-hidden rounded-lg bg-white shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
                        style={{
                          bottom: "auto",
                          top: "auto",
                          transform: "translateY(-100%)",
                        }}
                      >
                        <button
                          onClick={() => {
                            handleEdit(msg);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-indigo-600 hover:bg-indigo-50 transition-colors duration-150 font-medium text-sm whitespace-nowrap"
                        >
                          <Edit size={18} color="blue" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteForMe(msg._id);
                            setOpenMenu(null);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-orange-600 hover:bg-orange-50 transition-colors duration-150 font-medium text-sm whitespace-nowrap"
                        >
                          <Trash2 size={18} color="orange" />
                          <span>Delete for me</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteForEveryone(msg._id);
                            setOpenMenu(null);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 font-medium text-sm whitespace-nowrap"
                        >
                          <Trash2 size={18} color="red" />
                          <span>Delete from everyone</span>
                        </button>
                      </div>
                    )}
                  </>
                )}

                {msg.sender?._id !== currentUser._id && !msg.isDeleted && (
                  <>
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === msg._id ? null : msg._id)
                      }
                      className="absolute top-1 -left-2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === msg._id && (
                      <div
                        className="absolute left-0 z-50 overflow-hidden rounded-lg bg-white shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
                        style={{
                          bottom: "auto",
                          top: "auto",
                          transform: "translateY(-100%)",
                        }}
                      >
                        <button
                          onClick={() => {
                            handleDeleteForMe(msg._id);
                            setOpenMenu(null);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-orange-600 hover:bg-orange-50 transition-colors duration-150 font-medium text-sm whitespace-nowrap"
                        >
                          <Trash2 size={18} color="orange" />
                          <span>Delete for me</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {typingMessage && (
        <p className="px-4 py-2 text-sm  italic text-gray-500">
          {typingMessage}
        </p>
      )}
      <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
  <div className="mx-auto flex w-full items-end gap-3">
    {/* Input Area */}
    <div className="relative flex-1">
      <input
        value={message}
        maxLength={1000}
        onChange={(e) => {
          setMessage(e.target.value);

          if (!conversationId) return;

          if (!isTyping) {
            setIsTyping(true);

            socket.emit("user_typing", {
              conversationId,
              username: currentUser.name,
            });
          }

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            setIsTyping(false);

            socket.emit("user_stopped_typing", {
              conversationId,
            });
          }, 1000);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type a message..."
        className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 pr-16 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
      />

      {/* Character Counter */}
      <span
        className={`absolute bottom-2 right-3 text-[10px] ${
          message.length >= 950
            ? "font-medium text-orange-500"
            : "text-gray-400"
        }`}
      >
        {message.length}/1000
      </span>
    </div>

    {/* Send Button */}
    <button
      onClick={handleSend}
      disabled={!message.trim()}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-300"
      title="Send message"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M22 2L11 13"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M22 2l-7 20-4-9-9-4 20-7z"
        />
      </svg>
    </button>
  </div>
</div>
    </div>
  );
};

export default ConversationPage;
