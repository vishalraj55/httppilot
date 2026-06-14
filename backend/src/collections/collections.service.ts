import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async getAll(firebaseUid: string) {
    const user = await this.prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) return [];

    return this.prisma.collection.findMany({
      where: { userId: user.id },
      include: { requests: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(firebaseUid: string, email: string, name: string) {
    let user = await this.prisma.user.findUnique({ where: { firebaseUid } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { firebaseUid, email: email ?? '' },
      });
    }

    return this.prisma.collection.create({
      data: { name, userId: user.id },
    });
  }

  async update(id: string, name: string) {
    return this.prisma.collection.update({
      where: { id },
      data: { name },
    });
  }

  async delete(id: string) {
    return this.prisma.collection.delete({ where: { id } });
  }

  async addRequest(collectionId: string, data: any) {
    return this.prisma.request.create({
      data: {
        name: data.name,
        method: data.method,
        url: data.url,
        headers: data.headers || {},
        body: data.body || null,
        collectionId,
      },
    });
  }

  async updateRequest(requestId: string, data: any) {
    return this.prisma.request.update({
      where: { id: requestId },
      data: {
        name: data.name,
        method: data.method,
        url: data.url,
        headers: data.headers || {},
        body: data.body || null,
      },
    });
  }

  async deleteRequest(requestId: string) {
    return this.prisma.request.delete({ where: { id: requestId } });
  }
}
