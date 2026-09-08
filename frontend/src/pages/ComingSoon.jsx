import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Bot,
  Brain,
  MessageSquare,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";

function ComingSoon({ type = "feature" }) {
  const navigate = useNavigate();

  const content = {
    contest: {
      title: "Contests are coming soon",
      description:
        "Compete with other developers, solve timed coding challenges, and track your contest performance.",
      icon: Trophy
    },
    discuss: {
      title: "Community discussions are coming soon",
      description:
        "Ask questions, share solutions, discuss approaches, and learn from other developers.",
      icon: MessageSquare
    },
    interview: {
      title: "AI Interview is coming soon",
      description:
        "Practice technical interviews with AI-powered mock interviews, follow-up questions, and performance feedback.",
      icon: Brain
    },
    store: {
      title: "CodeNova Store is coming soon",
      description:
        "Explore developer resources, learning material, coding tools, and exclusive CodeNova products.",
      icon: Sparkles
    },
    ai: {
      title: "AI Coding Assistant is coming soon",
      description:
        "Soon you'll be able to chat with AI about your coding progress, understand your weak areas, get personalized practice recommendations, and discuss problems just like a coding mentor.",
      icon: Bot
    },
    feature: {
      title: "This feature is coming soon",
      description:
        "We're building something useful for your coding journey. Stay tuned.",
      icon: Users
    }
  };

  const current = content[type] || content.feature;
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-6 relative">

      <button
        onClick={() => navigate("/")}
        className="btn btn-ghost absolute top-5 left-5"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="max-w-2xl w-full">
        <div className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-10 text-center">

          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon size={40} className="text-primary" />
            </div>
          </div>

          <div className="badge badge-warning badge-lg mb-5">
            Coming Soon
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {current.title}
          </h1>

          <p className="text-base-content/70 text-lg leading-relaxed max-w-xl mx-auto mb-8">
            {current.description}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="badge badge-outline p-4">
              <Sparkles size={15} />
              Under Development
            </div>

            <div className="badge badge-outline p-4">
              CodeNova
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="btn btn-primary mt-10"
          >
            Explore Problems
          </button>

        </div>
      </div>
    </div>
  );
}

export default ComingSoon;