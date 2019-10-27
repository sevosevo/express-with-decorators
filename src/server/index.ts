import { Application, Response, Request, NextFunction } from 'express';
import { Router } from 'express';
import { CONTROLLER_PREFIX, CONTROLLER_ROUTES } from '../keys';
import { Route } from '../decorators';

export class Server {
    private _app: Application;

    get app() {
        return this._app;
    }

    public constructor(application: Application) {
        this._app = application;
    }
    public mountController(controller: any) {
        const instance = new controller();
        const router = Router();
        const prefix = Reflect.getOwnMetadata(CONTROLLER_PREFIX, controller);
        const routes = Reflect.getOwnMetadata(CONTROLLER_ROUTES, controller);
        routes.forEach((route: Route) => {
            if(!route.interceptor)
                router[route.httpVerb](route.path, route.middlewares, instance[route.closureName]);
            else {
                const interceptorInstance = new route.interceptor();
                let before = null;
                let after = null;
                if(interceptorInstance.before){
                    let bef = interceptorInstance.before;
                    before = async (request: Request, response: Response, next: NextFunction) => {
                        await bef(request, response);
                        next();
                    }
                }
                if(interceptorInstance.after){
                    let aft = interceptorInstance.after;
                    after = async (request: Request, response: Response, next: NextFunction) => {
                        await next();
                        aft(request, response);
                    }
                }
                let closures = [];
                before && closures.push(before);
                route.middlewares && closures.push(...route.middlewares);
                after && closures.push(after);
                instance[route.closureName] && closures.push(instance[route.closureName]);
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
