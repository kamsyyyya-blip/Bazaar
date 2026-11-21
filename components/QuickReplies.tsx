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
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Quick replies</p>
      <div className="no-scrollbar mt-2.5 flex flex-wrap gap-2">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => onSelect(reply)}
            className="rounded-full border border-line bg-paper/60 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-clay/40 hover:bg-accent-soft/60 hover:text-clay active:bg-accent-soft"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}
