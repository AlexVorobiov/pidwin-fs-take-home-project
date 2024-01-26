import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import supertest from 'supertest';
import bcrypt from 'bcryptjs';
import User from '../../src/models/user.js';

import app from '../../index.js';

let mongoServer;
let server
beforeAll(async () => {
    server = supertest.agent(app);
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri );
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async ()=>{
    await User.deleteMany({});
})

describe('SignUp User', () => {
    it('Should create user with valid credentials', async () => {
        const userCredentials = {
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            firstName: 'John',
            lastName: 'Doe',
        };

        const res = await server.post('/api/user/signup').send(userCredentials);

        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty('token');

        const createdUser = await User.findOne({ email: userCredentials.email });
        expect(createdUser).toBeTruthy();

        const passwordMatch = await bcrypt.compare(userCredentials.password, createdUser.password);
        expect(passwordMatch).toBe(true);
    });


    it('Should create add token to user after signup', async () => {
        const userCredentials = {
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            firstName: 'John',
            lastName: 'Doe',
        };
        const res = await server.post('/api/user/signup').send(userCredentials);
        expect(res.status).toEqual(200);
        const createdUser = await User.findOne({ email: userCredentials.email });
        expect(createdUser.tokenAmount).toEqual(100);
    });


    it('Should not create user with existing email', async () => {
        const existingUser = {
            email: 'existing@example.com',
            password: 'existingpassword',
            name: 'Existing User',
        };

        await User.create(existingUser);

        const userCredentials = {
            email: 'existing@example.com',
            password: 'newpassword',
            confirmPassword: 'newpassword',
            firstName: 'New',
            lastName: 'User',
        };

        const res = await server.post('/api/user/signup').send(userCredentials);

        expect(res.status).toEqual(400);
        expect(res.body).toHaveProperty('message', 'User Already Exist');
    });

    it('Should not create user with mismatched passwords', async () => {
        const userCredentials = {
            email: 'mismatched@example.com',
            password: 'password123',
            confirmPassword: 'mismatchedpassword',
            firstName: 'John',
            lastName: 'Doe',
        };

        const res = await server.post('/api/user/signup').send(userCredentials);

        expect(res.status).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Password Does Not Match');
    });
});
