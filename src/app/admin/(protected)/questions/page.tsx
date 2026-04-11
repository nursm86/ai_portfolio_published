import { getQuestionCards } from '@/lib/content';
import QuestionsEditor from './QuestionsEditor';

export default async function QuestionsPage() {
  const questions = await getQuestionCards();
  return <QuestionsEditor initial={questions} />;
}
