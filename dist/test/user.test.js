"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const chai_1 = require("chai");
// import app from '../app';
const app = express_1.default();
let authToken = "pretoken";
describe("server checks", function () {
    it("server instantiated without error", function (done) {
        supertest_1.default("http://localhost:3000").get("/").expect(200, done);
    });
});
describe("create user account", function () {
    const newUser = {
        username: "criotech",
        firstName: "Opeoluwa",
        lastName: "Siyanbola",
        password: "Opeoluwa.",
        email: "opesiyanbola8991@gmail.com"
    };
    it('/Post - create a new user accont', async () => {
        const response = await supertest_1.default("http://localhost:3000")
            .post("/api/users")
            .send(newUser)
            .expect(200);
    });
});
describe('login existing user route', function () {
    it('/Post - Should login existing user', async function () {
        const response = await supertest_1.default("http://localhost:3000").post('/api/auth').send({
            email: "opesiyanbola8991@gmail.com",
            password: "Opeoluwa."
        }).expect(200);
        authToken = response.body.data.token;
    });
    it('/Post - Should not login existing user', function (done) {
        const response = supertest_1.default("http://localhost:3000").post('/api/auth').send({
            email: "opesiyanbola8991@gmail.com",
            password: 'thisisnotmypass'
        }).expect(400, done);
    });
});
describe('Get user profile', function () {
    it('/Get - Should fetch login user profile', function (done) {
        supertest_1.default("http://localhost:3000")
            .get('/api/user')
            .set('Authorization', `Bearer ${authToken}`)
            .send()
            .expect(200, done);
    });
    it('/Get - Should not get profile for unauthenticated user', function (done) {
        supertest_1.default("http://localhost:3000")
            .get('/api/user')
            .send()
            .expect(401, done);
    });
});
describe('Update user profile picture', () => {
    it('/Put Should upload user image', async function () {
        await supertest_1.default("http://localhost:3000")
            .put('/api/user')
            .set('Authorization', `Bearer ${authToken}`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .attach('profilePicture', './src/test/ace.jpg')
            .expect(200);
    });
});
describe('Update user profile', () => {
    it('/Put Should upload user image', function (done) {
        supertest_1.default("http://localhost:3000")
            .put('/api/user')
            .set('Authorization', `Bearer ${authToken}`)
            .attach('profilePicture', './src/test/ace.jpg')
            .expect(200, done);
    });
    it('/Put - Should update login user profile', async function () {
        let response = await supertest_1.default("http://localhost:3000")
            .put('/api/user')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            firstName: 'Philip',
            phoneNumber: "08167526178"
        })
            .expect(200);
        chai_1.expect(response.body.data.firstName).equal('Philip');
        chai_1.expect(response.body.data.phoneNumber).equal("08167526178");
    });
    it('/Put - Should not allow unwanted field for update', async function () {
        let response = await supertest_1.default("http://localhost:3000")
            .put('/api/user')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            school: 'Lagos State University'
        })
            .expect(400);
    });
});
describe('Delete user account', () => {
    it('/Delete Should delete user account', function (done) {
        supertest_1.default("http://localhost:3000")
            .delete('/api/user')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200, done);
    });
});
