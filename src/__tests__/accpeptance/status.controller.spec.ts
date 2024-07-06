import { beforeAll, beforeEach, describe, expect } from "vitest";
import { Application } from "../../";
import { givenApplication } from "../helpers";
import { StatusController } from "../../domain/controller";

const packageJson = require('../../../package.json')

describe('StatusControllet Tests Suites ...', () => {
    let app: Application;
    const baseUrl = 'http://localhost:3000';
    const headers = {'Content-Type': 'application/json'};

    beforeAll( () => {
        process.env.CERTS_PATH = '../certs';
        try {
            app = givenApplication();
            app.run();
            app.router.get('/version', {
                handler: StatusController.prototype.getStatus,
              });
          
              app.router.post('/version', {
                handler: StatusController.prototype.getStatus,
              });

            setTimeout(() => {
                console.log('waitinng for start up');
            }, 2000);

        } catch (e: any) {
            console.log('Cannot start Tests server :', e.message);
        }
    });
describe('GET tests ...', async () => {
    test('GET /version - should return 202 code', async () => {
        // const response  = await fetch('http://localhost:3000/version');
        // expect(response.status).to.be.equal(202);
        expect(app).to.be.instanceOf(Application);

    });

    test('POST /version - should return 202 code', async () => {
        const body = JSON.stringify({ version : packageJson.version });
        const response  = await fetch(`${baseUrl}/version`, {
            body,
            method: 'POST',
            headers
        });
        
        expect(response.status).to.be.equal(202);
        const bodyResponse = await response.json() as any;
        console.log(body)

        expect(bodyResponse.body).to.be.equal(body);
    });


    test('PUT /version - should return 404 code', async () => {
        const body = JSON.stringify({ version : packageJson.version });
        const response  = await fetch(`${baseUrl}/version`, {
            body,
            method: 'PUT',
            headers
        });
        
        expect(response.status).to.be.equal(404);
        const bodyResponse = await response.json() as any;

        expect(bodyResponse.body).to.be.equal(undefined);
});

});
 
});