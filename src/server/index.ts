import { Application, Response, Request, NextFunction } from 'express';
import { Router } from 'express';
import { CONTROLLER_PREFIX, CONTROLLER_ROUTES } from '../keys';
import { Route } from '../decorators';
import { container } from '../injector';

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
                console.log(interceptorInstance);
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
