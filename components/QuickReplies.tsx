"use client";

const QUICK_REPLIES = [
  "Is this still available?",
  "Can I go lower?",
  "Can I collect it today?",
  "Could you deliver it?",
  "What condition is it in?",
];

export default function QuickReplies({
  onSelect,
}: {
  onSelect: (text: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">Quick replies</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => onSelect(reply)}
            className="rounded-full border border-line bg-paper-2/60 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-clay/40 hover:text-ink active:bg-paper-2"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}
