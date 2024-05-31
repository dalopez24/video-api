import { IsNumber } from 'class-validator';

export class GetVideoDto {
  cameraId: string;
  @IsNumber()
  startDate: number;
  @IsNumber()
  endDate: number;
}
