import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Circle, LoaderCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import quizService from '../../services/quizService';

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        const fetchedQuiz = response.data;

        if (fetchedQuiz.completedAt) {
          navigate(`/quizzes/${quizId}/results`, { replace: true });
          return;
        }

        setQuiz(fetchedQuiz);
      } catch (error) {
        toast.error(error.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [navigate, quizId]);

  if (loading) return <Spinner />;
  if (!quiz) return <div className='py-12 text-center text-sm text-slate-500'>Quiz not found.</div>;

  const questions = quiz.questions || [];
  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = questions.length ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const selectAnswer = (answer) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [currentQuestion]: answer }));
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(Math.max(0, Math.min(index, questions.length - 1)));
  };

  const handleSubmit = async () => {
    if (answeredCount !== questions.length) {
      toast.error('Attempt all the questions to submit the Quiz');
      return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedAnswer]) => ({
        questionIndex: Number(questionIndex),
        selectedAnswer,
      }));
      await quizService.submitQuiz(quizId, formattedAnswers);
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error(error.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
      return;
    }
    goToQuestion(currentQuestion + 1);
  };

  return (
    <div className='mx-auto max-w-5xl space-y-7'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>{quiz.title}</h1>
        <div className='mt-8 flex items-center justify-between gap-4 text-sm font-medium text-slate-600'>
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{answeredCount} answered</span>
        </div>
        <div className='mt-3 h-2 overflow-hidden rounded-full bg-slate-100'>
          <div className='h-full rounded-full bg-emerald-500 transition-all duration-300' style={{ width: `${progress}%` }} />
        </div>
      </div>

      {question ? (
        <section className='rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8'>
          <div className='inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700'>
            <Circle size={12} fill='currentColor' />
            Question {currentQuestion + 1}
          </div>
          <h2 className='mt-7 text-xl font-semibold leading-relaxed text-slate-900'>{question.question}</h2>
          <div className='mt-8 space-y-3'>
            {(question.options || []).map((option) => {
              const isSelected = answers[currentQuestion] === option;
              return (
                <button
                  type='button'
                  key={option}
                  onClick={() => selectAnswer(option)}
                  className={`flex min-h-14 w-full items-center gap-4 rounded-xl border px-4 text-left text-sm font-medium transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'}`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-emerald-500 text-emerald-600' : 'border-slate-300 text-transparent'}`}>
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <div className='rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500'>This quiz has no questions.</div>
      )}

      <div className='flex items-center justify-between gap-4'>
        <button type='button' onClick={() => goToQuestion(currentQuestion - 1)} disabled={currentQuestion === 0 || submitting} className='inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'>
          <ChevronLeft size={17} /> Previous
        </button>

        <div className='hidden items-center gap-2 sm:flex'>
          {questions.map((_, index) => (
            <button type='button' key={index} onClick={() => goToQuestion(index)} disabled={submitting} aria-label={`Go to question ${index + 1}`} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${currentQuestion === index ? 'bg-emerald-500 text-white' : answers[index] !== undefined ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {index + 1}
            </button>
          ))}
        </div>

        <button type='button' onClick={handleNext} disabled={submitting || questions.length === 0} className='inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50'>
          {submitting && <LoaderCircle size={17} className='animate-spin' />}
          {isLastQuestion ? (submitting ? 'Submitting...' : 'Submit Quiz') : 'Next'}
          {!isLastQuestion && <ChevronRight size={17} />}
        </button>
      </div>
    </div>
  );
};

export default QuizTakePage;
