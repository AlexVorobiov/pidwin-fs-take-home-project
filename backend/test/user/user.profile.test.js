import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import supertest from 'supertest';
import User from '../../src/models/user.js';

import app from '../../index.js';
import {createRegularUser, mockUserAuth} from "../utils/user.js";

let mongoServer;
let server
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

afterEach(async () => {
    await User.deleteMany({});
})

describe('User Profile', () => {
    it('Should return user profile', async () => {
        const user = await createRegularUser();
        const userId = user._id.toString();
        await mockUserAuth(userId);

        const response = await server.get('/api/user/profile');

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('tokenAmount');
        expect(response.body.tokenAmount).toEqual(100);
    })

    it('Should return error for not auth user', async () => {
        const response = await server.get('/api/user/profile').set({"Authorization": "test"});
        expect(response.status).toEqual(401);
    })
});
