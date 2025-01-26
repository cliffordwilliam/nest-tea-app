import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Tea } from './entities/tea.entity';
import { TeasController } from './teas.controller';
import { TeasService } from './teas.service';

@Module({
  imports: [
    // register entities
    TypeOrmModule.forFeature([Tea]),
    // deps
    CloudinaryModule,
  ],
  controllers: [TeasController],
  providers: [TeasService],
  exports: [TeasService],
})
export class TeasModule {}
