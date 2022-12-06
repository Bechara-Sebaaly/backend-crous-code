import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { map, tap, lastValueFrom, reduce } from 'rxjs';
import {
  ApiCrous,
  Crous,
  CrousList,
  ExpandedCrousDto,
  ReducedCrousDto,
} from './dto';

@Injectable()
export class CrousService {
  private crousList: CrousList;
  private crousFav: string[] = [];

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    await this.getCrousData();
  }

  create(crous: Crous): ExpandedCrousDto | BadRequestException {
    if (
      !this.crousList.restaurants.find((element) => element.id === crous.id) &&
      !this.crousList.restaurants.find((element) => element === crous)
    )
      this.crousList.restaurants.push(crous);
    else
      throw new BadRequestException(
        'A RESTAURANT WITH THE SAME ID, OR SIMILAR DATA ALREADY EXISTS',
      );

    return this.findOneById(crous.id);
  }

  async findAll(
    page: number,
    rows: number,
    offset: number,
    sortBy: string,
    favorites: number,
    geoloc: number,
    refresh: number,
  ) {
    let start: number,
      end: number,
      current: number,
      next: number,
      last: number,
      first: number;

    let list: CrousList = new CrousList();

    if (refresh === 1) {
      await this.getCrousData();
    }

    if (favorites === 1)
      list.restaurants = this.crousList.restaurants.filter((element) =>
        this.crousFav.find((id) => id === element.id),
      );
    else list.restaurants = this.crousList.restaurants.slice();

    [start, end, current, next, last, first, rows] =
      this.getPaginationArguments(page, rows, offset, list.restaurants.length);

    let requestedData: ExpandedCrousDto[] = list.restaurants.slice(start, end);

    if (sortBy === 'title')
      requestedData = this.sortCrousByTitle(requestedData);
    else if (sortBy === 'address')
      requestedData = this.sortCrousByAddress(requestedData);
    else if (sortBy === 'type')
      requestedData = this.sortCrousByType(requestedData);

    if (geoloc === 1) {
      let geoloc: { latitude: number; longitude: number; title: string }[] = [];
      requestedData.slice().forEach((element) => {
        let { latitude, longitude, title } = element;
        geoloc.push({ latitude, longitude, title });
      });
      return geoloc;
    }

    let returnData: ReducedCrousDto[] = this.reduceData(requestedData);

    returnData.forEach((element) =>
      element.favorite == true ? console.log(element.title) : 0,
    );

    return { current, next, last, first, rows, returnData };
  }

  findOneById(id: string): ExpandedCrousDto | NotFoundException {
    const crous = this.crousList.restaurants.find(
      (element) => element.id === id,
    );

    if (!crous) throw new NotFoundException('CROUS NOT FOUND!');
    return crous;
  }

  searchByName(
    title: string,
  ): ReducedCrousDto[] | ExpandedCrousDto | NotFoundException {
    const crous = this.crousList.restaurants.filter((element) =>
      element.title.toLowerCase().includes(title.toLowerCase()),
    );

    console.log(title);

    if (!crous) throw new NotFoundException('CROUS NOT FOUND!');
    return this.reduceData(crous);
  }

  toggleFavorite(id: string): { id: string } {
    let index: number = this.crousFav.indexOf(id, 0);
    if (index === -1) {
      index = this.getIndexOf(id);
      this.crousFav.push(this.crousList.restaurants[index].id);
      this.crousList.restaurants[index].favorite = true;
    } else {
      console.log('removed');
      console.log(this.crousFav.splice(index, 1));
      this.crousList.restaurants[index].favorite = false;
    }

    return { id: id };
  }

  update(id: string, updatedCrous: Crous): Crous | BadRequestException {
    let index: number = this.getIndexOf(id);
    let newIdCheck: number = this.getIndexOf(updatedCrous.id);

    if (index !== -1 && newIdCheck === -1) {
      this.crousList.restaurants[index].id =
        updatedCrous?.id ?? this.crousList.restaurants[index].id;

      this.crousList.restaurants[index].address =
        updatedCrous?.address ?? this.crousList.restaurants[index].address;

      this.crousList.restaurants[index].closing =
        updatedCrous?.closing ?? this.crousList.restaurants[index].closing;

      this.crousList.restaurants[index].email =
        updatedCrous?.email ?? this.crousList.restaurants[index].email;

      this.crousList.restaurants[index].info =
        updatedCrous?.info ?? this.crousList.restaurants[index].info;

      this.crousList.restaurants[index].latitude =
        updatedCrous?.latitude ?? this.crousList.restaurants[index].latitude;

      this.crousList.restaurants[index].longitude =
        updatedCrous?.longitude ?? this.crousList.restaurants[index].longitude;

      this.crousList.restaurants[index].phoneNumber =
        updatedCrous?.phoneNumber ??
        this.crousList.restaurants[index].phoneNumber;

      this.crousList.restaurants[index].photoURL =
        updatedCrous?.photoURL ?? this.crousList.restaurants[index].photoURL;

      this.crousList.restaurants[index].shortDesc =
        updatedCrous?.shortDesc ?? this.crousList.restaurants[index].shortDesc;

      this.crousList.restaurants[index].title =
        updatedCrous?.title ?? this.crousList.restaurants[index].title;

      this.crousList.restaurants[index].type =
        updatedCrous?.type ?? this.crousList.restaurants[index].type;
    } else throw new BadRequestException('ID ALREADY USED');

    return this.crousList.restaurants[index];
  }

  remove(id: string): string {
    let index: number = this.getIndexOf(id);
    if (index !== -1) this.crousList.restaurants.splice(index, 1);
    else throw new NotFoundException('CROUS NOT FOUND!');

    return id;
  }

  private getIndexOf(id: string): number {
    let i: number = -1;
    this.crousList.restaurants.forEach((element, index) => {
      if (element.id === id) i = index;
    });

    return i;
  }

  async getCrousData(): Promise<CrousList> {
    let apiData = new CrousList();
    this.crousList = new CrousList();

    await lastValueFrom(
      this.httpService
        .get<ApiCrous>(
          'https://data.opendatasoft.com/api/records/1.0/search/?dataset=fr_crous_restauration_france_entiere%40mesr&q=&rows=-1',
        )
        .pipe(
          map((response) => response.data.records),
          tap((element) => {
            element.forEach((element) => {
              let [address, email, phoneNumber] = this.extractContacts(
                element.fields.contact,
              );

              apiData.restaurants.push({
                id: element.fields.id,
                type: element.fields.type,
                zone: element.fields.zone ? element.fields.zone : '',
                title: element.fields.title,
                shortDesc: element.fields.short_desc
                  ? element.fields.short_desc
                  : '',
                address: address,
                phoneNumber: phoneNumber,
                email: email,
                latitude: element.fields.geolocalisation[0],
                longitude: element.fields.geolocalisation[1],
                info: element.fields.infos,
                closing: element.fields.closing,
                photoURL: element.fields.photo,
                favorite: false,
              });
            });
          }),
        ),
    );

    this.crousList.restaurants = this.sortCrousByTitle(apiData.restaurants);

    this.crousFav.forEach((element) => {
      this.crousList.restaurants[this.getIndexOf(element)].favorite = true;
    });
    return this.crousList;
  }

  private extractContacts(contact: string): [string, string, string] {
    let address: string;
    let email: string;
    let phoneNumber: string;

    if (contact.includes(' Téléphone : ')) {
      address = contact.split(' Téléphone')[0];
      if (contact.includes('E-mail')) {
        phoneNumber = contact.split(' Téléphone : ')[1].split(' E-mail')[0];
        email = contact.split('E-mail : ')[1];
      } else {
        phoneNumber = contact.split(' Téléphone : ')[1];
        email = '';
      }
    } else if (contact.includes('E-mail')) {
      address = contact.split('E-mail')[0];
      phoneNumber = '';
      email = contact.split('E-mail : ')[1];
    } else {
      address = contact;
      phoneNumber = '';
      email = '';
    }
    return [address, email, phoneNumber];
  }

  private getPaginationArguments(
    page: number,
    rows: number,
    offset: number,
    length: number,
  ): [number, number, number, number, number, number, number] {
    page = page < 0 ? 0 : page;
    rows = rows <= 0 ? 10 : rows > length ? length : rows;
    offset = offset < 0 ? 0 : offset;

    let totalNbPages = rows == 0 ? 0 : Math.ceil(length / rows);
    let start = page * rows + offset > length ? 0 : page * rows + offset;
    let end = page * rows + offset + rows;
    let current = page;
    let next = page++ >= totalNbPages - 1 ? 0 : page++;
    let last = totalNbPages - 1 < 0 ? 0 : totalNbPages - 1;
    let first = 0;

    return [start, end, current, next, last, first, rows];
  }

  private sortCrousByTitle(crousList: ExpandedCrousDto[]): ExpandedCrousDto[] {
    return crousList.sort((fo: Crous, so: Crous) =>
      fo.title.localeCompare(so.title),
    );
  }

  private sortCrousByAddress(
    crousList: ExpandedCrousDto[],
  ): ExpandedCrousDto[] {
    return crousList.sort((fo: Crous, so: Crous) =>
      fo.address.localeCompare(so.address),
    );
  }

  private sortCrousByType(crousList: ExpandedCrousDto[]): ExpandedCrousDto[] {
    return crousList.sort((fo: Crous, so: Crous) =>
      fo.type.localeCompare(so.type),
    );
  }

  private reduceData(expandedData: ExpandedCrousDto[]): ReducedCrousDto[] {
    let reducedDataList: ReducedCrousDto[] = [];
    let reducedData: ReducedCrousDto;

    expandedData.forEach((element) => {
      reducedData = new ReducedCrousDto(element);
      reducedDataList.push(reducedData);
    });
    return reducedDataList;
  }
}
