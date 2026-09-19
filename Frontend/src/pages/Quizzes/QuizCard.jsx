import { Award, BarChart3, Play, Trash2 } from 'lucide-react';

const QuizCard = ({ quiz, onStart, onViewResults, onDelete }) => {
  const quizId = quiz?._id || quiz?.id;
  const questionCount = quiz?.totalQuestions || quiz?.questions?.length || 0;
  const isCompleted = Boolean(quiz?.completedAt);
  const createdDate = quiz?.createdAt
    ? new Date(quiz.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date unavailable';

  const handleAction = (action) => {
    action?.(quiz, quizId);
  };

  return (
    <article className='group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md'>
      <div className='flex items-start justify-between gap-3'>
        <span className='inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'>
          <Award size={14} />
          Score: {quiz?.score ?? 0}
        </span>
        {onDelete && (
          <button
            type='button'
            onClick={() => handleAction(onDelete)}
            aria-label={`Delete ${quiz?.title || 'quiz'}`}
            className='rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600'
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <h3 className='mt-5 truncate text-base font-semibold text-slate-900' title={quiz?.title}>
        {quiz?.title || 'Untitled Quiz'}
      </h3>
      <p className='mt-1 text-xs font-medium uppercase tracking-wide text-slate-500'>
        Created {createdDate}
      </p>

      <div className='my-5 h-px bg-slate-100' />

      <span className='inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700'>
        {questionCount} Questions
      </span>

      <button
        type='button'
        onClick={() => handleAction(isCompleted ? onViewResults : onStart)}
        className={`mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
          isCompleted
            ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600'
        }`}
      >
        {isCompleted ? <BarChart3 size={17} /> : <Play size={17} />}
        {isCompleted ? 'View Results' : 'Start Quiz'}
      </button>
    </article>
  );
};

export default QuizCard;
