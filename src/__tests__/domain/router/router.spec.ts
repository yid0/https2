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

    test('should register and execute PUT route', async () => {
        router.put('/resource', { handler: () => ({ updated: true }) } as any);

        const req = {
            method: 'PUT',
            url: '/resource',
        };

        const res = {};
        const body = await router.route(req, res as any);

        expect(body).to.be.deep.equal({ updated: true });
    });

    test('should register and execute DELETE route', async () => {
        router.delete('/resource', [], () => ({ deleted: true }));

        const req = {
            method: 'DELETE',
            url: '/resource',
        };

        const res = {};
        const body = await router.route(req, res as any);

        expect(body).to.be.deep.equal({ deleted: true });
    });

    test('should register and execute PATCH route', async () => {
        router.patch('/resource', { handler: () => ({ patched: true }) } as any);

        const req = {
            method: 'PATCH',
            url: '/resource',
        };

        const res = {};
        const body = await router.route(req, res as any);

        expect(body).to.be.deep.equal({ patched: true });
    });

    test('should register and execute HEAD route', async () => {
        router.head('/health', [] as any, () => '');

        const req = {
            method: 'HEAD',
            url: '/health',
        };

        const res = {};
        const body = await router.route(req, res as any);

        expect(body).to.be.deep.equal('');
    });

    test('should register and execute OPTIONS route', async () => {
        router.options('/resource', () => 'ok');

        const req = {
            method: 'OPTIONS',
            url: '/resource',
        };

        const res = {};
        const body = await router.route(req, res as any);

        expect(body).to.be.deep.equal('ok');
    });

});
