import { useEffect, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import aiService from '../../services/aiService';
import quizService from '../../services/quizService';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import QuizCard from './QuizCard';

const questionOptions = Array.from({ length: 15 }, (_, index) => index + 1);

const QuizManager = ({ documentId }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const response = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchQuizzes();
    }
  }, [documentId]);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setGenerating(true);

    try {
      await aiService.generateQuiz(documentId, { numQuestions: questionCount });
      toast.success('Quiz generated successfully');
      setIsGenerateModalOpen(false);
      await fetchQuizzes();
    } catch (error) {
      toast.error(error.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;

    setDeleting(true);
    try {
      await quizService.deleteQuiz(quizToDelete._id || quizToDelete.id);
      setQuizzes((currentQuizzes) => currentQuizzes.filter(
        (quiz) => (quiz._id || quiz.id) !== (quizToDelete._id || quizToDelete.id),
      ));
      setQuizToDelete(null);
      toast.success('Quiz deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete quiz');
    } finally {
      setDeleting(false);
    }
  };

  const handleStart = (quiz, quizId) => {
    navigate(`/quizzes/${quizId}`, { state: { quiz } });
  };

  const handleViewResults = (quiz, quizId) => {
    navigate(`/quizzes/${quizId}/results`, { state: { quiz } });
  };

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h3 className='text-lg font-semibold text-slate-900'>Quizzes</h3>
          <p className='text-sm text-slate-500'>Test your understanding of this document.</p>
        </div>
        <button
          type='button'
          onClick={() => setIsGenerateModalOpen(true)}
          className='inline-flex h-10 items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-700 hover:to-teal-700'
        >
          <Plus size={16} />
          Generate Quiz
        </button>
      </div>

      {loading ? <Spinner /> : quizzes.length === 0 ? (
        <EmptyState
          title='No Quizzes Yet'
          description='Generate a quiz from your document to test your knowledge.'
        />
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id || quiz.id}
              quiz={quiz}
              onStart={handleStart}
              onViewResults={handleViewResults}
              onDelete={setQuizToDelete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => !generating && setIsGenerateModalOpen(false)}
        title='Generate New Quiz'
      >
        <form onSubmit={handleGenerate} className='space-y-5'>
          <label htmlFor='question-count' className='block text-sm font-medium text-slate-700'>
            Number of Questions
          </label>
          <select
            id='question-count'
            value={questionCount}
            onChange={(event) => setQuestionCount(Number(event.target.value))}
            disabled={generating}
            className='h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
          >
            {questionOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={generating}
              className='h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={generating}
              className='inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Sparkles size={16} />
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(quizToDelete)}
        onClose={() => !deleting && setQuizToDelete(null)}
        title='Confirm Delete Quiz'
      >
        <div className='space-y-5'>
          <p className='text-sm leading-relaxed text-slate-600'>
            Are you sure you want to delete the quiz <strong className='text-slate-900'>{quizToDelete?.title}</strong>? This action cannot be undone.
          </p>
          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={() => setQuizToDelete(null)}
              disabled={deleting}
              className='h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleDelete}
              disabled={deleting}
              className='h-10 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizManager;
