import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(firebaseUid: string, email: string, name?: string) {
    let user = await this.prisma.user.findUnique({ where: { firebaseUid } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { firebaseUid, email, name },
      });
    }

    return user;
  }

  async findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({ where: { firebaseUid } });
  }
}
