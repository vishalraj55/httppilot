import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async proxyRequest(@Body() body: any, @Req() req: any) {
    return this.proxyService.makeRequest(body, req.user);
  }
}
