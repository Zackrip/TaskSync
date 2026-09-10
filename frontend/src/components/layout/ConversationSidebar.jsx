import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import chatService from "../../services/chatService";
import socket from "../../socket";

const ConversationSidebar = ({ setSelectedUser, selectedUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await chatService.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUsers();

    socket.on("receive-message", fetchUsers);

    return () => {
      socket.off("receive-message", fetchUsers);
    };
  }, []);

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 px-4 sm:px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Messages
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {users.length} conversations
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <MessageCircle size={19} />
          </div>
        </div>
      </div>

      {/* Users */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {users.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <MessageCircle size={22} className="text-slate-400" />
            </div>

            <p className="text-sm font-medium text-slate-600">
              No conversations
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Start a conversation with someone.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((user) => {
              const otherUser = user;
              const isActive = selectedUser?._id === user._id;

              if (!otherUser) return null;

              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(otherUser)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-500 shadow-sm"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ${
                        isActive
                          ? "bg-white/20"
                          : "bg-indigo-100"
                      }`}
                    >
                      {otherUser.profilePicture ? (
                        <img
                          src={otherUser.profilePicture}
                          alt={otherUser.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className={`text-sm font-bold ${
                            isActive
                              ? "text-white"
                              : "text-indigo-600"
                          }`}
                        >
                          {otherUser.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>

                    {/* Online indicator */}
                    <span
                      className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 ${
                        isActive
                          ? "border-indigo-500 bg-green-400"
                          : "border-white bg-green-500"
                      }`}
                    />
                  </div>

                  {/* User info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`truncate text-sm font-semibold ${
                          isActive
                            ? "text-white"
                            : "text-slate-800"
                        }`}
                      >
                        {otherUser.name}
                      </h3>

                      {user.lastMessage && (
                        <span
                          className={`shrink-0 text-[11px] ${
                            isActive
                              ? "text-indigo-100"
                              : "text-slate-400"
                          }`}
                        >
                          {new Date(
                            user.lastMessage.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-xs ${
                          isActive
                            ? "text-indigo-100"
                            : "text-slate-500"
                        }`}
                      >
                        {user.lastMessage?.text ||
                          "No messages yet"}
                      </p>

                      {/* Example unread badge */}
                      {user.unreadCount > 0 && (
                        <span
                          className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                            isActive
                              ? "bg-white text-indigo-600"
                              : "bg-indigo-500 text-white"
                          }`}
                        >
                          {user.unreadCount > 99
                            ? "99+"
                            : user.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ConversationSidebar;