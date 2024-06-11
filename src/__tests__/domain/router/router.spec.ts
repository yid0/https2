import { beforeAll, expect, test } from 'vitest';
import { RouterDispatcher, RouterFactory } from '../../../domain/router';
import { HttpRequestLike } from '../../../domain/server/http/request/request';
import { HttpResponseLike } from '../../../domain/server/http/response/response';
import { BaseRequest, FunctionLike, HttpRoute } from '../../../domain/types';


class TestController {
    testOk(request?: HttpRequestLike, res?: HttpResponseLike) {
        return {
            status: 'up',
        };
    }
}

describe('RouterDispatcher test suites ... :', () => {
    const router: RouterDispatcher = RouterFactory.createRouter('classic') as RouterDispatcher;
    let route: HttpRoute;
    let expectedRoute: HttpRoute;
    beforeAll(() => {
        route = router.add(
            {
                path: new RegExp('/status'),
                method: 'GET',
                handler: TestController.prototype.testOk
            }
        );
        expectedRoute = router.routes.get(`${route.method}:${route.path}`) as HttpRoute;
    })
    test('should get defined router an routes', () => {
        expect(router).to.be.toBeDefined();
        expect(router.routes).to.be.toBeDefined();
        expect(route).to.be.toBeDefined();
        expect(expectedRoute).to.be.toBeDefined();
        expect(router.routes.size).to.be.equal(1);
        expect(router.routes).to.be.contain(expectedRoute);

    });

    test('should add a new route handler to proxy router', () => {

        expect(route).to.be.toBeDefined();
        expect(expectedRoute).to.be.contain(route);
    });

    test('should add a new route handler to proxy router', () => {

        expect(JSON.stringify(expectedRoute)).to.be.equal(JSON.stringify(route));
    });

    test('should create thre router regex path', () => {

        expect(router.onInit('/status')).to.be.equal(router.regex);
    });


    test('should execute handler function and return the body response', async () => {

        expect(route).to.be.toBeDefined();
        expect(expectedRoute).to.be.contain(route);

        const req = {
            method: 'GET',
            url: '/status',
        };

        const res = {
            status: 'up',
        }

        const body = await router.route(req, res as any);
        expect(JSON.stringify(body)).to.be.equal(JSON.stringify(TestController.prototype.testOk()));
    });

});