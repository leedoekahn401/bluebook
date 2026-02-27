"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "model";
    parts: { text: string }[];
}

interface ReviewChatbotProps {
    questionId: string;
    questionText: string;
    headless?: boolean;
}

export default function ReviewChatbot({ questionId, questionText, headless = false }: ReviewChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch chat history on load
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/chat?questionId=\${questionId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                    }
                }
            } catch (error) {
                console.error("Failed to load chat history:", error);
            } finally {
                setIsFetchingHistory(false);
            }
        };

        fetchHistory();
    }, [questionId]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");

        // Optimistic UI update
        const newMessage: Message = { role: "user", parts: [{ text: userMsg }] };
        setMessages((prev) => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId, message: userMsg }),
            });

            const data = await res.json();

            if (data.messages) {
                // Keep the server truth
                setMessages(data.messages);
            } else if (data.response) {
                setMessages((prev) => [...prev, { role: "model", parts: [{ text: data.response }] }]);
            } else if (data.error) {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages((prev) => [
                ...prev,
                { role: "model", parts: [{ text: "Sorry, I ran into an error processing your request. Please try again." }] }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Convert Gemini's markdown to safe HTML for rendering
    const renderMarkdown = (text: string) => {
        const html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            // Bold
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            // Markdown links [text](url)
            .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-indigo-600 underline hover:text-indigo-800'>$1</a>")
            // Bare URLs
            .replace(/(^|[^'"])(https?:\/\/[^\s<]+)/g, "$1<a href='$2' target='_blank' rel='noopener noreferrer' class='text-indigo-600 underline hover:text-indigo-800'>$2</a>")
            // Bullet points — wrap consecutive <li> blocks in a <ul>
            .replace(/^\* (.+)$/gm, "<li>$1</li>")
            .replace(/(<li>[^]*?<\/li>\n?)+/g, (match) => `<ul class='list-disc list-inside my-1 space-y-1'>${match}</ul>`)
            // Line breaks
            .replace(/\n/g, "<br />");
        return html;
    };

    return (
        <div className={`flex flex-col ${headless ? "flex-1 h-full" : "h-[500px] bg-white rounded-lg border border-indigo-100 shadow-sm"} overflow-hidden`}>
            {/* Header — hidden in headless/sidebar mode */}
            {!headless && (
                <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-center gap-3 shrink-0">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-950">AI Study Tutor</h4>
                        <p className="text-xs text-indigo-600 font-medium">Powered by Gemini</p>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {isFetchingHistory ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                        <Bot className="w-12 h-12 text-indigo-200 mb-3" />
                        <p className="text-sm">I'm here to help you understand this question!</p>
                        <p className="text-xs mt-2 text-slate-400">Ask me anything about the concepts or for Khan Academy resources.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${msg.role === "user" ? "bg-blue-600" : "bg-indigo-600"
                                }`}>
                                {msg.role === "user" ? (
                                    <User className="w-4 h-4 text-white" />
                                ) : (
                                    <Sparkles className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${msg.role === "user"
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-white border border-indigo-50 text-slate-700 rounded-tl-sm"
                                }`}>
                                <div
                                    className="leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.parts[0].text) }}
                                />
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex gap-3 flex-row">
                        <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm bg-indigo-600">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="px-5 py-4 rounded-2xl bg-white border border-indigo-50 flex items-center gap-1 rounded-tl-sm shadow-sm">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 shrink-0">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for a hint or explanation..."
                        className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        disabled={isLoading || isFetchingHistory}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || isFetchingHistory}
                        className="absolute right-1 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full transition-colors flex items-center justify-center"
                    >
                        <Send className="w-4 h-4 ml-[2px]" />
                    </button>
                </div>
            </form >
        </div >
    );
}
