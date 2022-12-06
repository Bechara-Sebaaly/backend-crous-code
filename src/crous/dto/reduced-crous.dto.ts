import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Crous } from './crous.interface';

export class ReducedCrousDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  shortDesc: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  photoURL: string;

  @IsNumber()
  @IsNotEmpty()
  favorite: boolean;

  constructor(crous?: Crous) {
    this.id = crous?.id;
    this.type = crous?.type;
    this.title = crous?.title;
    this.shortDesc = crous?.shortDesc;
    this.address = crous?.address;
    this.photoURL = crous?.photoURL;
    this.favorite = crous?.favorite ?? false;
  }
}
