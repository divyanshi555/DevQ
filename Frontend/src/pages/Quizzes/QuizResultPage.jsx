import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, CircleAlert, Medal, Target } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import quizService from '../../services/quizService';

const getScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-500';
  return 'text-rose-500';
};

const getScoreMessage = (score) => {
  if (score >= 90) return 'Outstanding!';
  if (score >= 80) return 'Great job!';
  if (score >= 70) return 'Good work!';
  if (score >= 60) return 'Not bad!';
  return 'Keep practicing!';
};

const QuizResultPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await quizService.getQuizResults(quizId);
        setResult(response.data);
      } catch (error) {
        toast.error(error.message || 'Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId]);

  if (loading) return <Spinner />;
  if (!result) return <div className='py-12 text-center text-sm text-slate-500'>Quiz results not found.</div>;

  const { quiz, results } = result;
  const totalQuestions = quiz.totalQuestions || results.length;
  const correctCount = results.filter((item) => item.isCorrect).length;
  const incorrectCount = totalQuestions - correctCount;
  const score = quiz.score ?? 0;

  const getOptionClass = (item, option) => {
    if (option === item.correctAnswer) {
      return 'border-emerald-400 bg-emerald-50 text-emerald-800';
    }
    if (option === item.selectedAnswer && !item.isCorrect) {
      return 'border-rose-300 bg-rose-50 text-rose-800';
    }
    return 'border-slate-200 bg-white text-slate-600';
  };

  return (
    <div className='mx-auto max-w-5xl space-y-7'>
      <div>
        {quiz.document?._id && (
        <Link to={`/documents/${quiz.document._id}`} className='mx-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700'>
          <ArrowLeft size={16} /> Back to Document
        </Link>
        )}
        <h1 className='mt-7 text-2xl font-semibold tracking-tight text-slate-900'>{quiz.title} Results</h1>
      </div>

      <section className='rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm sm:px-10 sm:py-10'>
        <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-200/50'>
          <Medal size={30} />
        </div>
        <p className='mt-5 text-xs font-semibold uppercase tracking-widest text-slate-500'>Your Score</p>
        <p className={`mt-1 text-5xl font-bold ${getScoreColor(score)}`}>{score}%</p>
        <p className='mt-2 text-lg font-medium text-slate-700'>{getScoreMessage(score)}</p>

        <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
          <span className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700'>
            <Target size={16} /> {totalQuestions} Total
          </span>
          <span className='inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700'>
            <CheckCircle2 size={16} /> {correctCount} Correct
          </span>
          <span className='inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700'>
            <CircleAlert size={16} /> {incorrectCount} Incorrect
          </span>
        </div>
      </section>

      <div className='flex items-center gap-2 text-lg font-semibold text-slate-900'>
        <BookOpen size={20} />
        Detailed Review
      </div>

      <div className='space-y-5'>
        {results.map((item, index) => (
          <article key={item.questionIndex ?? index} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7'>
            <div className='flex items-start justify-between gap-4'>
              <span className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600'>
                Question {index + 1}
              </span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.isCorrect ? 'border border-emerald-200 bg-emerald-50 text-emerald-600' : 'border border-rose-200 bg-rose-50 text-rose-600'}`}>
                {item.isCorrect ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
              </span>
            </div>

            <h2 className='mt-5 text-base font-semibold leading-relaxed text-slate-900'>{item.question}</h2>

            <div className='mt-5 space-y-3'>
              {(item.options || []).map((option) => (
                <div key={option} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${getOptionClass(item, option)}`}>
                  <span>{option}</span>
                  {option === item.correctAnswer && <span className='rounded-lg border border-emerald-300 px-2 py-1 text-xs font-semibold'>Correct</span>}
                  {option === item.selectedAnswer && option !== item.correctAnswer && <span className='rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold'>Your Answer</span>}
                </div>
              ))}
            </div>

            {item.explanation && (
              <div className='mt-5 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <BookOpen className='mt-0.5 shrink-0 text-slate-500' size={18} />
                <div>
                  <p className='text-xs font-bold uppercase tracking-wide text-slate-600'>Explanation</p>
                  <p className='mt-1 text-sm leading-relaxed text-slate-600'>{item.explanation}</p>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      
    </div>
  );
};

export default QuizResultPage;
