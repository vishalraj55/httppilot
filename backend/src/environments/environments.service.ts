import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnvironmentsService {
  constructor(private prisma: PrismaService) {}

  async getAll(firebaseUid: string) {
    const user = await this.prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) return [];

    return this.prisma.environment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    firebaseUid: string,
    email: string,
    name: string,
    variables: Record<string, string> = {},
  ) {
    let user = await this.prisma.user.findUnique({ where: { firebaseUid } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { firebaseUid, email: email ?? '', name },
      });
    }

    return this.prisma.environment.create({
      data: { name, variables, userId: user.id },
    });
  }

  async update(id: string, name: string, variables: Record<string, string>) {
    return this.prisma.environment.update({
      where: { id },
      data: { name, variables },
    });
  }

  async delete(id: string) {
    return this.prisma.environment.delete({ where: { id } });
  }
}
