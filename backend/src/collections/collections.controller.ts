import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';

@Controller('collections')
@UseGuards(FirebaseAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  getAll(@Req() req: any) {
    return this.collectionsService.getAll(req.user.uid as string);
  }

  @Post()
  create(@Req() req: any, @Body() body: { name: string }) {
    return this.collectionsService.create(
      req.user.uid as string,
      req.user.email as string,
      body.name,
    );
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.collectionsService.update(id, body.name);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.collectionsService.delete(id);
  }

  @Post(':id/requests')
  addRequest(@Param('id') id: string, @Body() body: any) {
    return this.collectionsService.addRequest(id, body);
  }

  @Put(':id/requests/:requestId')
  updateRequest(@Param('requestId') requestId: string, @Body() body: any) {
    return this.collectionsService.updateRequest(requestId, body);
  }

  @Delete(':id/requests/:requestId')
  deleteRequest(@Param('requestId') requestId: string) {
    return this.collectionsService.deleteRequest(requestId);
  }
}
