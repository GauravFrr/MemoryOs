import { Test, TestingModule } from '@nestjs/testing';
import { MemoriesController } from './memories.controller';

describe('MemoriesController', () => {
  let controller: MemoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemoriesController],
    }).compile();

    controller = module.get<MemoriesController>(MemoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
