import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import toast from "react-hot-toast";
import { sendChatMessage } from "../services/chat.service";


export default function AIAssistant() {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I’m your AI wellness assistant. Ask me about your fitness, nutrition, hydration, or daily routine.",
    },
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const latestMessageRef = useRef(null);


  useEffect(() => {

    latestMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });

  }, [messages, loading]);


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
      },
    ]);
    setMessage("");

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
        },
      ]);

    } catch (error) {

      console.error(error);
      toast.error("Unable to reach your wellness assistant.");

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="mx-auto flex max-w-4xl flex-col gap-8">

      <div>

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
            <Sparkles className="h-6 w-6 text-green-600" />
          </span>

          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              AI Wellness Assistant
            </h1>
            <p className="mt-1 text-gray-500">
              Personalized guidance using your wellness activity today.
            </p>
          </div>

        </div>

      </div>


      <div className="overflow-hidden rounded-3xl bg-white shadow-card">

        <div className="border-b border-gray-100 px-8 py-5">
          <p className="text-sm font-medium text-green-600">
            Personalized wellness guidance
          </p>
        </div>


        <div className="min-h-[420px] space-y-5 p-6 sm:p-8">

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

                <p
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-base ${
                    isUser
                      ? "rounded-br-md bg-green-500 text-white"
                      : "rounded-bl-md bg-gray-50 text-gray-700"
                  }`}
                >
                  {chatMessage.content}
                </p>

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
