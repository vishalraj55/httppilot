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
import { EnvironmentsService } from './environments.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';

@Controller('environments')
@UseGuards(FirebaseAuthGuard)
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get()
  getAll(@Req() req: any) {
    return this.environmentsService.getAll(req.user.uid as string);
  }

  @Post()
  create(
    @Req() req: any,
    @Body() body: { name: string; variables: Record<string, string> },
  ) {
    return this.environmentsService.create(
      req.user.uid as string,
      req.user.email as string,
      body.name,
      body.variables,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name: string; variables: Record<string, string> },
  ) {
    return this.environmentsService.update(id, body.name, body.variables);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.environmentsService.delete(id);
  }
}
