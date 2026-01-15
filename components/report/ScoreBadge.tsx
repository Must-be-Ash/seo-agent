'use client';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: '#1A3A1A', text: '#22C55E', border: '#22C55E' };
    if (score >= 60) return { bg: '#3A3A1A', text: '#EAB308', border: '#EAB308' };
    return { bg: '#3A1A1A', text: '#EF4444', border: '#EF4444' };
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-5xl',
  };

  const colors = getScoreColor(score);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-4 flex items-center justify-center font-bold`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {score}
    </div>
  );
}
