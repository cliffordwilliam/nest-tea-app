import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tea } from './entities/tea.entity';
import { TeasController } from './teas.controller';
import { TeasService } from './teas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tea])],
  controllers: [TeasController],
  providers: [TeasService],
})
export class TeasModule {}
