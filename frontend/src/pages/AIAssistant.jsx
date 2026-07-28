import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Clock3,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { sendChatMessage } from "../services/chat.service";


export default function AIAssistant() {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I’m your AI wellness assistant. Ask me about your fitness, nutrition, hydration, or daily routine.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const latestMessageRef = useRef(null);


  useEffect(() => {

    latestMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });

  }, [messages, loading]);


  function formatMessageTime(timestamp) {

    if (!timestamp) {
      return "";
    }

    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  }


  function handleClearConversation() {

    setMessages([
      {
        role: "assistant",
        content: "Conversation cleared. What would you like help with next?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setError(null);
    toast.success("Conversation cleared.");

  }


  async function handleSubmit(event) {

    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmedMessage,
        timestamp: new Date().toISOString(),
      },
    ]);
    setMessage("");
    setError(null);

    try {

      setLoading(true);

      const response = await sendChatMessage(
        trimmedMessage
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.reply,
          timestamp: response.timestamp,
          conversationId: response.conversation_id,
        },
      ]);

    } catch (error) {

      console.error(error);
      setError("Your message could not be sent. Please try again.");
      toast.error("Unable to reach your wellness assistant.");

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="mx-auto flex max-w-4xl flex-col gap-5 sm:gap-8">

      <div>

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
            <Sparkles className="h-6 w-6 text-green-600" />
          </span>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              AI Wellness Assistant
            </h1>
            <p className="mt-1 text-gray-500">
              Personalized guidance using your wellness activity today.
            </p>
          </div>

        </div>

      </div>


      <div className="overflow-hidden rounded-3xl bg-white shadow-card">

        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-8 sm:py-5">
          <p className="text-sm font-medium text-green-600">
            Personalized wellness guidance
          </p>

          <button
            type="button"
            onClick={handleClearConversation}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>


        <div className="min-h-[360px] space-y-5 p-4 sm:min-h-[420px] sm:p-8">

          {messages.map((chatMessage, index) => {
            const isUser = chatMessage.role === "user";

            return (
              <div
                key={index}
                className={`flex gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Bot className="h-5 w-5 text-green-600" />
                  </span>
                )}

                <div
                  className={`max-w-[calc(100%-3.25rem)] break-words rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%] sm:text-base ${
                    isUser
                      ? "rounded-br-md bg-green-500 text-white"
                      : "rounded-bl-md bg-gray-50 text-gray-700"
                  }`}
                >
                  <p>{chatMessage.content}</p>

                  <span
                    className={`mt-1.5 flex items-center gap-1 text-[11px] ${
                      isUser ? "text-green-100" : "text-gray-400"
                    }`}
                  >
                    <Clock3 className="h-3 w-3" />
                    {formatMessageTime(chatMessage.timestamp)}
                  </span>
                </div>

                {isUser && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <User className="h-5 w-5 text-blue-600" />
                  </span>
                )}
              </div>
            );
          })}


          {loading && (
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Bot className="h-5 w-5 text-green-600" />
              </span>
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-gray-50 px-4 py-3 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                Thinking about your wellness data...
              </div>
            </div>
          )}


          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}


          <div ref={latestMessageRef}/>

        </div>


        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about your fitness, meals, or hydration..."
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send size={18}/>
              )}
            </button>
          </div>
        </form>

      </div>

    </div>

  );

}
