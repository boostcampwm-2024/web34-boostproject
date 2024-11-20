import { useEffect, useState } from 'react';
import { requestQuizData } from '../../api/quiz';
import { useLocation, useNavigate } from 'react-router-dom';
import DockerVisualization from '../visualization/DockerVisualization';
import { Quiz } from '../../types/quiz';
import QuizDescription from '../quiz/QuizDescription';
import QuizButtons from '../quiz/QuizButtons';
import QuizTextArea from '../quiz/QuizTextarea';
import useDockerVisualization from '../../hooks/useDockerVisualization';

export const ImageCheckPage = () => {
    const navigate = useNavigate();
    const quizNum = useLocation().pathname.split('/').at(-1) as string;
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const { images, animation, dockerOperation, updateVisualizationData, handleAnimationComplete } =
        useDockerVisualization();
    useEffect(() => {
        const fetchQuizData = async () => {
            const data = await requestQuizData(quizNum, navigate);

            if (!data) {
                return;
            }

            setQuizData(data);
        };
        fetchQuizData();
    }, []);

    return (
        <div className='w-[calc(100vw-17rem)] p-4 h-full'>
            {/*TODO: image 가져오기 같은 헤더도 url param으로 업데이트 필요 */}
            <h1 className='font-bold text-3xl text-Dark-Blue mb-3'>image 가져오기</h1>
            <section className='flex h-1/2'>
                <QuizDescription content={quizData?.content} />
                <DockerVisualization
                    animationState={animation}
                    dockerOperation={dockerOperation}
                    images={images}
                    containers={undefined}
                    onAnimationComplete={handleAnimationComplete}
                />
            </section>
            <QuizTextArea updateVisualizationData={updateVisualizationData} />
            <QuizButtons />
        </div>
    );
};
