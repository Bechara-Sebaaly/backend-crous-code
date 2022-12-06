import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CrousService } from './crous.service';
import { Crous, ExpandedCrousDto } from './dto';

@Controller('crous')
export class CrousController {
  constructor(private readonly crousService: CrousService) {}

  @Post()
  create(@Body() createCrousDto: ExpandedCrousDto) {
    // return this.crousService.create(createCrousDto);
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('rows', ParseIntPipe) rows: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('sortBy') sortBy: string,
    @Query('fav') favorites: number,
    @Query('geoloc') geoloc: number,
    @Query('refresh') refresh: number,
  ) {
    console.log('test', page, geoloc);
    return this.crousService.findAll(
      page,
      rows,
      offset,
      sortBy,
      +favorites,
      +geoloc,
      +refresh,
    );
  }

  @Get('/:id')
  findOneById(@Param('id') id: string) {
    return this.crousService.findOneById(id);
  }

  @Post('/search/title')
  searchByTitle(@Body('title') title: string) {
    return this.crousService.searchByName(title);
  }

  @Put('/:id')
  toggleFavorite(@Param('id') id: string) {
    return this.crousService.toggleFavorite(id);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() updateCrousDto: Crous) {
    return this.crousService.update(id, updateCrousDto);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.crousService.remove(id);
  }
}
