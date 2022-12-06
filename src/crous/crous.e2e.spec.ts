import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest, * as request from 'supertest';
import { CrousModule } from './crous.module';

describe('Crous Controller (e2e)', () => {
  let app: INestApplication;
  let httpRequester: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CrousModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    httpRequester = request(app.getHttpServer());
  });

  it('/GET all crous restaurants sort by title', async () => {
    const response = await httpRequester
      .get('/crous')
      .query({ page: 0, rows: 10000, offset: 0, sortBy: 'title' })
      .expect(200);

    expect(response.body.returnData.length).toBeGreaterThanOrEqual(880);
    expect(response.body.returnData[0].title).toEqual('(S)pace Artem');
  });

  it('/GET all crous restaurants sort by address', async () => {
    const response = await httpRequester
      .get('/crous')
      .query({ page: 0, rows: 10000, offset: 0, sortBy: 'address' })
      .expect(200);

    expect(response.body.returnData.length).toBeGreaterThanOrEqual(880);
    expect(response.body.returnData[0].address).toEqual(
      '(S)pace Artem Rue Michel Dinet, 54000 NANCY',
    );
  });

  it('/GET all crous restaurants sort by type', async () => {
    const response = await httpRequester
      .get('/crous')
      .query({ page: 0, rows: 10000, offset: 0, sortBy: 'type' })
      .expect(200);

    expect(response.body.returnData.length).toBeGreaterThanOrEqual(880);
    expect(response.body.returnData[0].type).toEqual('Brasserie');
  });

  it('/GET crous restaurants pagination', async () => {
    const response = await httpRequester
      .get('/crous')
      .query({ page: 0, rows: 10, offset: 0 })
      .expect(200);

    expect(response.body.returnData.length).toEqual(10);
    expect(response.body.current).toEqual(0);
    expect(response.body.next).toEqual(1);
    expect(response.body.last).toEqual(87);
    expect(response.body.first).toEqual(0);
  });

  it('/GET crous restaurants pagination with rows < 0', async () => {
    const response = await httpRequester
      .get('/crous')
      .query({ page: 0, rows: -1, offset: 0 })
      .expect(200);

    expect(response.body.returnData.length).toEqual(10);
    expect(response.body.current).toEqual(0);
    expect(response.body.next).toEqual(1);
    expect(response.body.last).toEqual(87);
    expect(response.body.first).toEqual(0);
  });

  it('/GET crous restaurants pagination with rows > length', async () => {
    const response = await httpRequester
      .get('/crous')
      .query({ page: 0, rows: 10000, offset: 0 })
      .expect(200);

    expect(response.body.returnData.length).toEqual(880);
    expect(response.body.current).toEqual(0);
    expect(response.body.next).toEqual(0);
    expect(response.body.last).toEqual(0);
    expect(response.body.first).toEqual(0);
  });

  it('/GET crous restaurants pagination with page = lastPage', async () => {
    const response = await httpRequester
      .get('/crous')
      .query({ page: 87, rows: 10, offset: 0 })
      .expect(200);

    expect(response.body.returnData.length).toEqual(10);
    expect(response.body.current).toEqual(87);
    expect(response.body.next).toEqual(0);
    expect(response.body.last).toEqual(87);
    expect(response.body.first).toEqual(0);
  });

  it('/GET crous restaurants by name', async () => {
    const response = await httpRequester
      .post('/crous/search/title')
      .send({ title: 'Cafet Evariste Galois' })
      .expect(201);

    expect(response.body.id).toEqual('r694');
  });

  it('/GET crous restaurants by part of a name', async () => {
    const response = await httpRequester
      .post('/crous/search/title')
      .send({ title: 'Cafet' })
      .expect(201);

    expect(response.body.length).toEqual(91);
  });

  it('/GET crous restaurants by id', async () => {
    const response = await httpRequester.get('/crous/r694').expect(200);

    expect(response.body.id).toEqual('r694');
  });

  it('/PUT amd /GET crous favorites', async () => {
    const response = await httpRequester.put('/crous/r694').expect(200);
    expect(response.text).toEqual('r694');

    const response2 = await httpRequester
      .get('/crous')
      .query({ page: 0, rows: -1, offset: 0, fav: 1 })
      .expect(200);

    expect(response2.body.returnData[0].id).toEqual('r694');
    expect(response2.body.returnData.length).toEqual(1);
  });

  it('/POST create restaurant', async () => {
    const response = await httpRequester
      .post('/crous')
      .send({
        id: 'AAA',
        type: 'AAA',
        zone: 'AAA',
        title: 'AAA',
        shortDesc: 'AAA',
        address: 'AAA',
        phoneNumber: 'AAA',
        email: 'AAA',
        latitude: 50.627829,
        longitude: 50.627829,
        info: 'AAA',
        closing: 1,
        photoURL: 'AAA',
      })
      .expect(201);

    expect(response.body).toEqual({
      id: 'AAA',
      type: 'AAA',
      zone: 'AAA',
      title: 'AAA',
      shortDesc: 'AAA',
      address: 'AAA',
      phoneNumber: 'AAA',
      email: 'AAA',
      latitude: 50.627829,
      longitude: 50.627829,
      info: 'AAA',
      closing: 1,
      photoURL: 'AAA',
    });
  });

  it('/DELETE delete restaurant', async () => {
    await httpRequester
      .post('/crous')
      .send({
        id: 'AAA',
        type: 'AAA',
        zone: 'AAA',
        title: 'AAA',
        shortDesc: 'AAA',
        address: 'AAA',
        phoneNumber: 'AAA',
        email: 'AAA',
        latitude: 50.627829,
        longitude: 50.627829,
        info: 'AAA',
        closing: 1,
        photoURL: 'AAA',
      })
      .expect(201);

    const response1 = await httpRequester
      .get('/crous')
      .query({ page: 0, rows: 10000, offset: 0, sortBy: 'title' })
      .expect(200);

    expect(response1.body.returnData.length).toEqual(881);

    await httpRequester.delete('/crous/AAA').expect(200);

    const response2 = await httpRequester
      .get('/crous')
      .query({ page: 0, rows: 10000, offset: 0, sortBy: 'title' })
      .expect(200);

    expect(response2.body.returnData.length).toEqual(880);
  });

  it('/PATCH update restaurant', async () => {
    await httpRequester
      .post('/crous')
      .send({
        id: 'id-old',
        type: 'type-old',
        zone: 'zone-old',
        title: 'title-old',
        shortDesc: 'shortDesc-old',
        address: 'address-old',
        phoneNumber: 'phoneNumber-old',
        email: 'email-old',
        latitude: 50.627829,
        longitude: 50.627829,
        info: 'info-old',
        closing: 1,
        photoURL: 'photoURL-old',
      })
      .expect(201);

    await httpRequester
      .patch('/crous/id-old')
      .send({
        shortDesc: 'BBB',
        address: 'BBB',
        phoneNumber: 'BBB',
      })
      .expect(200);

    const response = await httpRequester.get('/crous/id-old').expect(200);

    expect(response.body).toEqual({
      id: 'id-old',
      type: 'type-old',
      zone: 'zone-old',
      title: 'title-old',
      shortDesc: 'BBB',
      address: 'BBB',
      phoneNumber: 'BBB',
      email: 'email-old',
      latitude: 50.627829,
      longitude: 50.627829,
      info: 'info-old',
      closing: 1,
      photoURL: 'photoURL-old',
    });
  });
});
