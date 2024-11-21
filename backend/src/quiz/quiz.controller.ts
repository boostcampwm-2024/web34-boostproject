import { Controller, Get, HttpCode, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AuthGuard } from '../common/auth/auth.guard';
import { RequestWithSession } from '../common/types/request';

@Controller('quiz')
export class QuizController {
    constructor(private quizService: QuizService) {}

    @Get('/:id')
    @UseGuards(AuthGuard)
    getQuizById(@Param('id', ParseIntPipe) quizId: number, @Req() req: RequestWithSession) {
        const { level } = req.session;
        this.quizService.accessQuiz(level, quizId);
        return this.quizService.getQuizById(quizId);
    }

    @Get('/:id/submit')
    @UseGuards(AuthGuard)
    submitQuiz(@Param('id', ParseIntPipe) quizId: number, @Req() req: RequestWithSession) {
        const { containerPort } = req.session;
        return this.quizService.submitQuiz(quizId, containerPort);
    }

    @Get('/:id/access')
    @UseGuards(AuthGuard)
    accessQuiz(@Param('id', ParseIntPipe) quizId: number, @Req() req: RequestWithSession) {
        const { level } = req.session;
        this.quizService.accessQuiz(level, quizId);
        return;
    }
}
