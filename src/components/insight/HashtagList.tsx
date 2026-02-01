interface HashtagListProps {
  hashtags: string[];
}

export default function HashtagList({ hashtags }: HashtagListProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {hashtags.map((tag, index) => (
        <span
          key={tag}
          className="inline-block px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full animate-fadeIn"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
