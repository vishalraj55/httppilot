import { Injectable, BadRequestException } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProxyService {
  constructor(private prisma: PrismaService) {}

  async makeRequest(body: any, firebaseUser: any) {
    const {
      method,
      url,
      headers = {},
      requestBody,
      environmentVariables = {},
    } = body;

    if (!method || !url) {
      throw new BadRequestException('Method and URL are required');
    }

    const resolvedUrl = this.substituteVariables(url, environmentVariables);
    const resolvedHeaders = this.substituteVariables(
      JSON.stringify(headers),
      environmentVariables,
    );

    const config: AxiosRequestConfig = {
      method,
      url: resolvedUrl,
      headers: JSON.parse(resolvedHeaders),
      data: requestBody || undefined,
      validateStatus: () => true,
      timeout: 30000,
    };

    const start = Date.now();

    try {
      const response = await axios(config);
      const timeTaken = Date.now() - start;

      const user = await this.prisma.user.findUnique({
        where: { firebaseUid: firebaseUser.uid },
      });

      if (user) {
        await this.prisma.requestHistory.create({
          data: {
            method,
            url: resolvedUrl,
            headers,
            body: requestBody || null,
            statusCode: response.status,
            response: response.data,
            timeTaken,
            userId: user.id,
          },
        });
      }

      return {
        statusCode: response.status,
        statusText: response.statusText,
        timeTaken,
        size: JSON.stringify(response.data).length,
        headers: response.headers,
        data: response.data,
      };
    } catch (error: any) {
      return {
        statusCode: 0,
        statusText: 'Network Error',
        timeTaken: Date.now() - start,
        error: error.message,
      };
    }
  }

  private substituteVariables(
    str: string,
    variables: Record<string, string>,
  ): string {
    return str.replace(
      /{{(.*?)}}/g,
      (_, key) => variables[key.trim()] || `{{${key}}}`,
    );
  }
}
