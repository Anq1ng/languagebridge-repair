import Navbar from "@/components/Navbar";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { t } = useLanguage();

  const aiMutation = trpc.ai.askGeneral.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    },
    onError: (error) => {
      toast.error(error.message || "AI assistant failed to respond.");
    },
  });

  const handleSend = (content: string) => {
    const newUserMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    // Build history excluding the new message
    const history = updatedMessages
      .filter((m) => m.role !== "system")
      .slice(0, -1)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    aiMutation.mutate({ question: content, history });
  };

  const suggestedPrompts = [
    "What subjects are available on LanguageBridge?",
    "Explain the key concepts in Calculus BC",
    "How do I upload courseware to the platform?",
    "What is the difference between Physics and Chemistry coursewares?",
    "推荐一些适合交换生的物理学习资料",
    "帮我解释微积分中的极限概念",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {t.ai.title}
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary leading-none">
                  Beta
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                {t.ai.subtitle}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t.ai.description}
          </p>
        </div>

        {/* Chat Box */}
        <div className="flex-1 min-h-0">
          <AIChatBox
            messages={messages}
            onSendMessage={handleSend}
            isLoading={aiMutation.isPending}
            placeholder={t.ai.placeholder}
            height="calc(100vh - 280px)"
            emptyStateMessage={t.ai.emptyState}
            suggestedPrompts={suggestedPrompts}
          />
        </div>

        {/* AI Technology Footer */}
        <div className="mt-4 pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground/70 text-center">
            {t.ai.poweredBy}{" "}
            <span className="font-medium text-muted-foreground">Google Gemini 2.5 Flash</span>
            {" "}{t.ai.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
