import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Crous } from './crous.interface';

export class ExpandedCrousDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  zone: string;

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
  phoneNumber: string;

  @IsString()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  info: string;

  @IsNumber()
  @IsNotEmpty()
  closing: number;

  @IsString()
  @IsNotEmpty()
  photoURL: string;

  @IsNumber()
  @IsNotEmpty()
  favorite: boolean;

  constructor(crous?: Crous) {
    this.id = crous?.id ?? this.id;
    this.type = crous?.type ?? this.type;
    this.zone = crous?.zone ?? this.zone;
    this.title = crous?.title ?? this.title;
    this.shortDesc = crous?.shortDesc ?? this.shortDesc;
    this.address = crous?.address ?? this.address;
    this.phoneNumber = crous?.phoneNumber ?? this.phoneNumber;
    this.email = crous?.email ?? this.email;
    this.latitude = crous?.latitude ?? this.latitude;
    this.longitude = crous?.longitude ?? this.longitude;
    this.info = crous?.info ?? this.info;
    this.closing = crous?.closing ?? this.closing;
    this.photoURL = crous?.photoURL ?? this.photoURL;
    this.favorite = crous?.favorite ?? false;
  }
}
