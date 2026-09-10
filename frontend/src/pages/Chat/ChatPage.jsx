import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import UsersSidebar from "../../components/layout/ConversationSidebar";
import ConversationPage from "./ConversationPage";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(() => {
    const savedUser = localStorage.getItem("selectedUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem("selectedUser");
    }
  }, [selectedUser]);

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden">
      {/* Sidebar: full width on mobile when no chat is open, fixed width on desktop */}
      <div
        className={`
          w-full md:w-80 md:shrink-0
          ${selectedUser ? "hidden md:block" : "block"}
        `}
      >
        <UsersSidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      </div>

      {/* Conversation: full width on mobile when a chat is open, flex-1 on desktop */}
      <div
        className={`
          flex-1 flex-col
          ${selectedUser ? "flex" : "hidden md:flex"}
        `}
      >
        {/* Mobile-only back button */}
        {selectedUser && (
          <div className="md:hidden flex items-center gap-2 p-3 border-b bg-white">
            <button
              onClick={() => setSelectedUser(null)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="font-medium">
              {selectedUser.name || selectedUser.username || "Chat"}
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <ConversationPage selectedUser={selectedUser} />
        </main>
      </div>
    </div>
  );
};

export default ChatPage;