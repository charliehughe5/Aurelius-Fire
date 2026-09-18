import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { MessageRecord, Client } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Send,
  Building2,
  User,
  Clock,
} from 'lucide-react';

export const AdminMessages: React.FC = () => {
  const { allClients } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(allClients[0] || null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!selectedClient && allClients.length > 0) {
      setSelectedClient(allClients[0]);
    }
  }, [allClients, selectedClient]);

  useEffect(() => {
    if (selectedClient) {
      loadMessages(selectedClient.id);
    }
  }, [selectedClient]);

  const loadMessages = async (clientId: string) => {
    try {
      const list = await api.getMessages(clientId);
      setMessages(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !inputText.trim()) return;

    setIsSending(true);
    try {
      await api.sendMessage({
        clientId: selectedClient.id,
        messageText: inputText.trim(),
      });
      setInputText('');
      await loadMessages(selectedClient.id);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Client Communications & Messages</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct dialogue with client Responsible Persons regarding access, document queries, and remedial advice
          </p>
        </div>
      </div>

      {/* 2-Column Chat Layout */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col md:flex-row h-[600px]">
        {/* Left Col: Client Thread List */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-600">
            Client Threads ({allClients.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {allClients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left p-3 transition text-xs flex items-center justify-between ${
                  selectedClient?.id === client.id
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="truncate">
                  <div className="truncate">{client.companyName}</div>
                  <div className="text-[10px] text-slate-400">{client.contactName}</div>
                </div>
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Conversation View */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedClient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{selectedClient.companyName}</h3>
                  <p className="text-[11px] text-slate-500">
                    Contact: {selectedClient.contactName} ({selectedClient.contactEmail})
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                    <span>No messages yet with {selectedClient.companyName}.</span>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAssessor = m.senderRole !== 'CLIENT';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isAssessor ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 mb-0.5">
                          <span className="font-semibold text-slate-600">{m.senderName}</span>
                          <span>•</span>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                            isAssessor
                              ? 'bg-blue-700 text-white rounded-br-xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200'
                          }`}
                        >
                          {m.messageText}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center space-x-2">
                <input
                  type="text"
                  required
                  placeholder={`Message ${selectedClient.contactName}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select a client to view conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
