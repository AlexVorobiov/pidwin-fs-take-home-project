import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import supertest from 'supertest';

import app from '../../index.js';
import {createRegularUser, mockUserAuth} from "../utils/user.js";
import {TossResults} from "../../src/utils/const.js";
import UserToss from "../../src/models/user-toss.js";
import {increaseBalance} from "../../src/services/user-balance.service.js";
import {getWonRowLength} from "../../src/services/toss.service.js";

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


    it('Should handle a valid x3 toss', async () => {
        const user = await createRegularUser();
        const userId = user._id.toString();
        await mockUserAuth(userId)
        jest.spyOn(Math, 'random').mockImplementationOnce(() => 0.1);

        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});
        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});

        await increaseBalance(userId, 40, "test");


        const response = await server
            .post('/api/user/toss')
            .send({
                wager: 10,
                toss: TossResults.HEADS
            })
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('userTotal');
        expect(response.body.userTotal).toEqual(170);
    });

    it('Should handle a valid x4 when lose toss', async () => {
        const user = await createRegularUser();
        const userId = user._id.toString();
        await mockUserAuth(userId)
        jest.spyOn(Math, 'random').mockImplementationOnce(() => 0.6);

        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});
        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});
        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});

        await increaseBalance(userId, 70, "test");


        const response = await server
            .post('/api/user/toss')
            .send({
                wager: 10,
                toss: TossResults.HEADS
            })
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('userTotal');
        expect(response.body.userTotal).toEqual(160);

        const winRowLength = await getWonRowLength(userId);
        expect(winRowLength).toEqual(0);
    });

    it('Should handle a valid x5 win toss', async () => {
        const user = await createRegularUser();
        const userId = user._id.toString();
        await mockUserAuth(userId)
        jest.spyOn(Math, 'random').mockImplementationOnce(() => 0.1);

        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});
        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});
        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});
        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});

        await increaseBalance(userId, 80, "test");

        const response = await server
            .post('/api/user/toss')
            .send({
                wager: 10,
                toss: TossResults.HEADS
            })
        expect(response.body.userTotal).toEqual(280);

        const winRowLength = await getWonRowLength(userId);
        expect(winRowLength).toEqual(1);
    });

    it('Should handle a valid x5 lose toss', async () => {
        const user = await createRegularUser();
        const userId = user._id.toString();
        await mockUserAuth(userId)
        jest.spyOn(Math, 'random').mockImplementationOnce(() => 0.6);

        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});
        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});
        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});
        await UserToss.create({userId, result: TossResults.HEADS, isWin: true, userToss: TossResults.HEADS});

        await increaseBalance(userId, 80, "test");

        const response = await server
            .post('/api/user/toss')
            .send({
                wager: 10,
                toss: TossResults.HEADS
            })
        expect(response.body.userTotal).toEqual(170);

        const winRowLength = await getWonRowLength(userId);
        expect(winRowLength).toEqual(0);
    });
});

describe('User Toss List', () => {
    it('Should last 10 toss', async () => {
        const user = await createRegularUser();
        const userId = user._id.toString();
        await mockUserAuth(userId)

        for (let i = 0; i < 15; i++) {
            await UserToss.create({
                userId,
                result: TossResults.HEADS,
                isWin: true,
                userToss: TossResults.HEADS,
                date: Date.now()
            });
        }

        await increaseBalance(userId, 80, "test");

        const response = await server
            .get('/api/user/toss');
        expect(response.body.length).toEqual(10);

        let item = response.body[0];

        expect(item).toHaveProperty('userToss');
        expect(item).toHaveProperty('result');
        expect(item).toHaveProperty('isWin');
        expect(item).toHaveProperty('bonus');
        expect(item).toHaveProperty('amount');
        expect(item).toHaveProperty('date');
    });
});
