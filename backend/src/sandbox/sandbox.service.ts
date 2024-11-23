import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { parseStringToJson, filterContainerInfo, filterImageInfo } from './utils';
import { requestDockerCommand } from './exec.api';
import { Container, ContainerData, Image, ImageData } from './types/elements';
import { CacheService } from '../common/cache/cache.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SandboxService {
    private readonly logger = new Logger(SandboxService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly cacheService: CacheService
    ) {}

    async getUserContainerImages(containerId: string) {
        const containers = await requestDockerCommand(this.httpService, containerId, [
            'docker',
            'ps',
            '-a',
            '--format',
            'json',
        ]);
        const images = await requestDockerCommand(this.httpService, containerId, [
            'docker',
            'images',
            '--format',
            'json',
        ]);
        return { containers: this.parseContainers(containers), images: this.parseImages(images) };
    }

    parseContainers(containers: string | object) {
        if (typeof containers === 'object') containers = JSON.stringify(containers);
        const containerList = parseStringToJson(containers) as ContainerData[];
        return filterContainerInfo(containerList);
    }

    parseImages(images: string | object) {
        if (typeof images === 'object') images = JSON.stringify(images);
        const imageList = parseStringToJson(images) as ImageData[];
        return filterImageInfo(imageList);
    }

    // TODO: ECONNREFUSED 에러 처리
    async getUserContainerImagesV2(containerPort: string) {
        // TODO: 임시로 시연을 위해 try-catch로 해결
        try {
            const imageResponse = await this.getUserImages(containerPort);
            const images = this.parseImagesV2(imageResponse);

            const containerResponse = await this.getUserContainers(containerPort);
            const containers = this.parseContainersV2(containerResponse);
            return { images, containers };
        } catch (error) {
            this.logger.error(error);
            return { images: [], containers: [] };
        }
    }

    async getUserImages(containerPort: string) {
        const response = await this.httpService.axiosRef.get(
            `http://${process.env.SANDBOX_HOST}:${containerPort}/images/json`
        );
        return response.data;
    }

    async getUserContainers(containerPort: string) {
        const response = await this.httpService.axiosRef.get(
            `http://${process.env.SANDBOX_HOST}:${containerPort}/containers/json?all=true`
        );
        return response.data;
    }

    parseImagesV2(imageData: Array<Record<string, any>>) {
        return imageData.reduce<Array<Image>>((imageReducer, image) => {
            imageReducer.push({
                id: image.Id,
                name: image.RepoTags[0].split(':')[0],
            });
            return imageReducer;
        }, []);
    }

    parseContainersV2(containerData: Array<Record<string, any>>) {
        return containerData.reduce<Array<Container>>((containerReducer, container) => {
            containerReducer.push({
                id: container.Id,
                name: container.Names[0],
                image: container.Image,
                status: container.State,
            });
            return containerReducer;
        }, []);
    }

    async processUserCommand(command: string, containerId: string) {
        return requestDockerCommand(this.httpService, containerId, command.split(' '));
    }

    async createContainer() {
        const requestBody = {
            Image: 'docker:dind',
            HostConfig: {
                Privileged: true,
                PortBindings: {
                    '2375/tcp': [
                        {
                            HostPort: '0',
                            HostIp: '0.0.0.0',
                        },
                    ],
                },
            },
            Env: ['DOCKER_TLS_CERTDIR='],
        };
        const { data } = await this.httpService.axiosRef.post(
            `${process.env.SANDBOX_URL}/containers/create`,
            requestBody
        );
        return data.Id;
    }

    async getContainerPort(containerId: string) {
        const { data } = await this.httpService.axiosRef.get(
            `${process.env.SANDBOX_URL}/containers/${containerId}/json`
        );
        // TODO: 포트 정보가 없는 경우에 대한 처리
        return data.NetworkSettings.Ports['2375/tcp'][0].HostPort;
    }

    async startContainer(containerId: string) {
        return this.httpService.axiosRef.post(
            `${process.env.SANDBOX_URL}/containers/${containerId}/start`
        );
    }

    async assignContainer() {
        const containerId = await this.createContainer();
        let containerPort;

        try {
            await this.startContainer(containerId);
            containerPort = await this.getContainerPort(containerId);
        } catch (startError) {
            try {
                await this.deleteContainer(containerId);
            } catch (deleteError) {
                this.logger.error(deleteError);
            }
            throw startError;
        }

        const newSessionId = randomUUID();
        this.cacheService.set(newSessionId, {
            containerId,
            containerPort,
            renew: false,
            startTime: new Date(),
            // TODO: 현재 테스트를 위해 레벨을 임의로 조정중
            level: 5,
        });

        this.logger.log(
            `Container Assigned: ${containerId}\t Session: ${newSessionId} \t Port: ${containerPort}`
        );

        return newSessionId;
    }

    async deleteContainer(containerId: string) {
        await this.httpService.axiosRef.delete(
            `${process.env.SANDBOX_URL}/containers/${containerId}?force=true`
        );
    }

    async getContainers() {
        const { data } = await this.httpService.axiosRef.get(
            `${process.env.SANDBOX_URL}/containers/json?all=true`
        );
        return data;
    }

    async clearContainers() {
        const containers = await this.getContainers();
        await Promise.all(
            containers.map((container: { Id: string }) => this.deleteContainer(container.Id))
        );
    }
}
