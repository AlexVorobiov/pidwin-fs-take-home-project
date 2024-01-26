import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import supertest from 'supertest';

import app from '../../index.js';
import {createRegularUser, mockUserAuth} from "../utils/user.js";
import {TossResults} from "../../src/utils/const.js";

let mongoServer;
let server;
beforeAll(async () => {
    server = supertest.agent(app).set({"Authorization": "test test"});
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('User Toss', () => {
    it('Should handle toss with insufficient funds', async () => {
        const user = await createRegularUser();
        await mockUserAuth(user._id.toString())
        const response = await server
            .post('/api/user/toss')
            .set({"Authorization": "test test"})
            .send({
                wager: 101,
                toss: TossResults.HEADS, // or 'Tails'
            })
        console.log(response.body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({message: 'Insufficient costs'});
    });

    it('Should handle a valid toss', async () => {
        const user = await createRegularUser();
        await mockUserAuth(user._id.toString())
        const response = await server
            .post('/api/user/toss')
            .send({
                wager: 10,
                toss: TossResults.HEADS
            })
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('result');
        expect(response.body).toHaveProperty('userTotal');
    });

    it('Should handle a valid won toss', async () => {
        const user = await createRegularUser();
        await mockUserAuth(user._id.toString())
        jest.spyOn(Math, 'random').mockImplementationOnce(() => 0.1);
        const response = await server
            .post('/api/user/toss')
            .send({
                wager: 10,
                toss: TossResults.HEADS
            })
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('result');
        expect(response.body.result).toBeTruthy();
        expect(response.body).toHaveProperty('userTotal');
        expect(response.body.userTotal).toEqual(120);
    });

    it('Should handle a valid lose toss', async () => {
        const user = await createRegularUser();
        await mockUserAuth(user._id.toString())
        jest.spyOn(Math, 'random').mockImplementationOnce(() => 0.6);
        const response = await server
            .post('/api/user/toss')
            .send({
                wager: 10,
                toss: TossResults.HEADS
            })
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('result');
        expect(response.body.result).toBeFalsy();
        expect(response.body.userTotal).toEqual(90);
    });
});
