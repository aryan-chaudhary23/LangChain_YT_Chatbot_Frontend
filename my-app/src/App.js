import { useState } from "react";

export default function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|youtu.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl || !question) return;

    const newMessages = [
      ...messages,
      { type: "user", text: question }
    ];

    setMessages(newMessages);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("https://langchain-yt-chatbot-backend.onrender.com/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoUrl,
          question: question,
        }),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        { type: "bot", text: data.answer || "No response" }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { type: "bot", text: "Error connecting to server" }
      ]);
    }

    setLoading(false);
  };

  const videoId = extractVideoId(videoUrl);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* glowing background */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/30 blur-[120px] top-[-100px] left-[-100px] rounded-full"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-600/30 blur-[120px] bottom-[-100px] right-[-100px] rounded-full"></div>

      <div className="relative z-10 flex flex-col items-center p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          RAGTube AI
        </h1>
        <p className="text-gray-400 mb-6">Chat with any YouTube video</p>

        {/* main container */}
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">

          {/* LEFT: Video Preview */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
            <h2 className="text-sm text-gray-400 mb-2">Video Preview</h2>

            {videoId ? (
              <iframe
                className="w-full h-60 rounded-xl"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="h-60 flex items-center justify-center text-gray-500 border border-dashed border-white/20 rounded-xl">
                Paste a YouTube link
              </div>
            )}

            <input
              type="text"
              placeholder="Paste YouTube URL..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mt-4 w-full p-3 rounded-lg bg-black/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* RIGHT: Chat */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 flex flex-col">
            <h2 className="text-sm text-gray-400 mb-2">Ask Questions</h2>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl max-w-[80%] text-sm ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 ml-auto"
                      : "bg-white/10 border border-white/10"
                  }`}
                >
                  {msg.text.split(/\n|(?=\d+\.\s)/).map((line, idx) => (
  <div key={idx} className="mb-2 leading-relaxed">
    {line.trim()}
  </div>
))}
                </div>
              ))}

              {loading && (
                <div className="text-gray-400 text-sm animate-pulse">
                  AI is thinking...
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Ask something..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 p-3 rounded-lg bg-black/40 border border-white/20 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 font-semibold hover:scale-105 transition"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
