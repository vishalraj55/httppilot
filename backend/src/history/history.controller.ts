import { Controller, Get, Delete, UseGuards, Req } from '@nestjs/common';
import { HistoryService } from './history.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';

@Controller('history')
@UseGuards(FirebaseAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getAll(@Req() req: any) {
    return this.historyService.getAll(req.user.uid as string);
  }

  @Delete()
  clear(@Req() req: any) {
    return this.historyService.clear(req.user.uid as string);
  }
}
