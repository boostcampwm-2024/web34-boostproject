import { useState } from 'react';
import QuizButtons from './QuizButtons';
import QuizInputBox from './QuizInputBox';

type QuizSubmitAreaProps = {
    quizId: number;
};

const QuizSubmitArea = ({ quizId }: QuizSubmitAreaProps) => {
    const [answer, setAnswer] = useState('');
    const customQuizzes = [2, 5, 6, 7];

    return (
        <>
            {customQuizzes.includes(quizId) ? (
                <QuizInputBox answer={answer} setAnswer={setAnswer} />
            ) : null}
            <QuizButtons quizId={quizId} answer={answer} customQuizzes={customQuizzes} />
        </>
    );
};

export default QuizSubmitArea;
