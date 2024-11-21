import { Injectable, MethodNotAllowedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { EntityNotExistException } from '../common/exception/errors';
import { SandboxService } from 'src/sandbox/sandbox.service';

@Injectable()
export class QuizService {
    private readonly logger = new Logger(QuizService.name);
    constructor(
        @InjectRepository(Quiz)
        private readonly quizRepository: Repository<Quiz>,
        private readonly sandboxService: SandboxService
    ) {
        this.initializeQuizData();
    }

    private async initializeQuizData() {
        await this.quizRepository.clear();

        const quizzeData = [
            {
                id: 1,
                title: 'Docker Image 가져오기',
                content:
                    'Docker의 첫 걸음을 시작해볼까요?\n가장 먼저 해볼 것은 hello-world 이미지를 가져오는 것입니다.\n적절한 Docker 명령어를 사용하여 이미지를 다운로드해보세요\n',
            },
            {
                id: 2,
                title: 'Docker Image 목록 확인하기',
                content: '',
            },
            {
                id: 3,
                title: 'Docker Image 삭제하기',
                content: '',
            },
            {
                id: 4,
                title: 'Container 생성하기',
                content: '',
            },
            {
                id: 5,
                title: 'Container 실행하기',
                content: '',
            },
            {
                id: 6,
                title: 'Container 생성 및 실행하기',
                content: '',
            },
            { id: 7, title: 'Container 목록 확인하기', content: '' },
            { id: 8, title: 'Container 중지하기', content: '' },
            { id: 9, title: 'Container 삭제하기', content: '' },
        ];

        await this.quizRepository.insert(quizzeData);
    }

    async getQuizById(id: number) {
        const quiz = await this.quizRepository.findOneBy({ id });
        if (quiz == null) {
            throw new EntityNotExistException('Quiz');
        }
        return quiz;
    }

    async submitQuiz(quizId: number, containerPort: string) {
        switch (quizId) {
            case 1:
                return this.submitQuiz1(containerPort);
            case 4:
                // 컨테이너 생성하기
                return this.submitQuiz4(containerPort);
            case 5:
            // 컨테이너 실행하기
            default:
                throw new MethodNotAllowedException(`${quizId}번 퀴즈는 아직 채점할 수 없습니다.`);
        }
    }

    private async submitQuiz1(containerPort: string) {
        const validImages = ['hello-world'];
        const images = await this.sandboxService.getUserImages(containerPort);
        const result = images.filter((image: Record<string, any>) =>
            validImages.includes(image.RepoTags[0]?.split(':')[0])
        );
        if (result.length > 0) {
            return { quizResult: 'SUCCESS' };
        } else {
            return { quizResult: 'FAIL' };
        }
    }

    private async submitQuiz4(containerPort: string) {
        const validImages = ['hello-world'];
        const containers = await this.sandboxService.getUserContainers(containerPort);
        const result = containers.filter((container: Record<string, any>) =>
            validImages.includes(container.Image)
        );
        if (result.length > 0) {
            return { quizResult: 'SUCCESS' };
        } else {
            return { quizResult: 'FAIL' };
        }
    }
}
