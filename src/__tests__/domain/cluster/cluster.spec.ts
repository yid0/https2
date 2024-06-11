import { expect, test } from 'vitest';
import { RouterDispatcher, RouterFactory } from '../../../domain/router';

describe('Tests of ProxyRouter', () => {
  const router = RouterFactory.createRouter('classic') as RouterDispatcher;
  const route = router.add(
    {
      path: new RegExp('/status'),
      method: 'GET'
    }     
  );

  test('should get defined router', () => {
    expect(router).to.be.toBeDefined();
    expect(router.routes).to.be.toBeDefined();
    expect(route).to.be.toBeDefined();
  });

  test('should add a new route handler to proxy router', () => {
    expect(route).to.be.toBeDefined();
    //expect(router.routes[route.path.source]).to.be.contain(route);
  });

  test('should add a new route handler to proxy router', () => {

    expect(route).to.be.toBeDefined();
    expect(router.onInit('/status')).to.be.toBeDefined();
  });
});
