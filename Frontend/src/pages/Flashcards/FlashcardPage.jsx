import { useParams } from 'react-router-dom';
import FlashcardManager from '../Quizzes/FlashcardManager';

const FlashcardPage = () => {
  const { id } = useParams();

  return (
    <FlashcardManager documentId={id} />
  );
};

export default FlashcardPage;
