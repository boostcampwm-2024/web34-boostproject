import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestQuizAccessability, requestSubmitResult } from '../../api/quiz';

type QuizButtonsProps = {
    quizId: number;
    answer: string;
    customQuizzes: number[];
};

const QuizButtons = ({ quizId, answer, customQuizzes }: QuizButtonsProps) => {
    const [submitResult, setSubmitResult] = useState('default');
    const navigate = useNavigate();

    const handleSubmitButtonClick = async () => {
        const submitResponse = await requestSubmitResult(quizId, answer, customQuizzes, navigate);
        if (!submitResponse) {
            return;
        }

        if (submitResponse.quizResult === 'SUCCESS') {
            setSubmitResult('SUCCESS');
        } else {
            setSubmitResult('FAIL');
        }

        // TODO: submitResult의 상태에 따라 모달창을 띄워줘야 한다.
        // 아래 console.log는 테스트 용도, 나중에 삭제해야 함
        // 여기서 해줄 작업은 없고, 아래 jsx를 return해줄 때 모달창 띄우는 코드를 추가해야 할 듯 합니다.
        console.log(submitResult);
    };

    const handleNextButtonClick = async () => {
        const isAccessable = await requestQuizAccessability(quizId);
        if (!isAccessable) {
            alert('아직 풀 수 없습니다');
            return;
        }

        if (quizId > 9) {
            alert('마지막 문제입니다');
            return;
        }

        if (quizId === 3) {
            navigate('/what-is-docker-container');
            return;
        }

        navigate(`/quiz/${quizId + 1}`);
    };

    // TODO: 이전. 다음버튼에 이벤트 추가가 필요합니다.
    return (
        <section className='w-[85%] flex justify-end'>
            <button className='text-lg text-white rounded-lg bg-gray-300 hover:bg-gray-400 py-2 px-4 my-4 mx-1'>
                이전
            </button>
            <button
                className='text-lg text-white rounded-lg bg-sky-400 hover:bg-sky-500 py-2 px-4 m-4'
                onClick={handleNextButtonClick}
            >
                다음
            </button>
            <button
                onClick={handleSubmitButtonClick}
                className='text-xl text-white rounded-lg bg-Moby-Blue hover:bg-blue-800 py-2 px-4 m-4'
            >
                채점하기
            </button>
        </section>
    );
};

export default QuizButtons;
