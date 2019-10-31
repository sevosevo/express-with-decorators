import { Application, Response, Request, NextFunction } from 'express';
import { Router } from 'express';
import { CONTROLLER_PREFIX, CONTROLLER_ROUTES } from '../keys';
import { Route, Middlewares } from '../decorators';
import { container } from '../injector';

function isNativeClass (value: Function /* :mixed */ ) /* :boolean */ {
    return typeof value === 'function' && value.toString().indexOf('class') === 0;
}

export class Server {
    private _app: Application;

    get app() {
        return this._app;
    }

    public constructor(application: Application) {
        this._app = application;
    }
    public mountController(controller: any) {
        const instance = container.get(controller.name);
        const router = Router();
        const prefix = Reflect.getOwnMetadata(CONTROLLER_PREFIX, controller);
        const routes = Reflect.getOwnMetadata(CONTROLLER_ROUTES, controller);
        routes.forEach((route: Route) => {
            const isClass = route.middlewares.every(middleware => isNativeClass(middleware));
            if(isClass)
                route.middlewares = route.middlewares.map(middleware => {
                    const middlewareInstance = container.get(middleware.name);
                    return middlewareInstance.use.bind(middlewareInstance);
                });
            else if(!isClass && route.middlewares.some(middleware => isNativeClass(middleware))) throw new Error('Middlewares can\'t be mix of class and functions')
            if(!route.interceptor) 
                router[route.httpVerb](route.path, route.middlewares, instance[route.closureName].bind(instance));
            else {
                const interceptorInstance = container.get(route.interceptor.name);
                let before = null;
                let after = null;
                if(interceptorInstance.before){
                    let bef = interceptorInstance.before;
                    before = async (request: Request, response: Response, next: NextFunction) => {
                        await bef.call(interceptorInstance, request, response);
                        next();
                    }
                }
                if(interceptorInstance.after){
                    let aft = interceptorInstance.after;
                    after = async (request: Request, response: Response, next: NextFunction) => {
                        await next();
                        aft.call(interceptorInstance, request, response);
                
                    }
                }
                let closures = [];
                before && closures.push(before);
                route.middlewares && closures.push(...route.middlewares);
                after && closures.push(after);
                instance[route.closureName] && closures.push(instance[route.closureName].bind(instance));
                router[route.httpVerb](route.path, ...closures);
            }
        });
        this.app.use(prefix, router);
    };
    public listen(PORT: number = 8000) {
        return new Promise((resolve, reject) => {
            this.app.listen(PORT, () => {
                resolve();
            });
        });
    }
}
