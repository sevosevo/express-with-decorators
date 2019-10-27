## Example application: 

```javascript
import { Server, Get, Interceptor, Controller, RouteInterceptor, Middlewares } from 'express-with-decorators';
import express, { Request, Response, NextFunction } from 'express';

class GetUsersInterceptor implements RouteInterceptor {
    before = (request: Request, response: Response) => {
        console.log('Ran first'); //This can be async function
    };
    after = (request: Request, response: Response) => {
        console.log('Ran last') //This can be async function
    }
 };

@Controller('/users')
class UserController {

@Interceptor(GetUsersInterceptor)
@Middlewares([
    (req: Request, res: Response, next: NextFunction) => {
        console.log('Ran after interceptor.before and before getUsers');
            next();
    }
])
@Get('/')
    getUsers(request: Request, response: Response, next: NextFunction) {
        console.log('Ran getUsers');
        response.send('Hello world');
    }
}

class Application extends Server {
    public constructor() {
        super(express());
        super.mountController(UserController);
    }
}

const app = new Application();

//Extending Application on Server class will give you Promise based listen method on the server instance
app.listen(8000)
.then(() => console.log('Server started...'))
.catch(err => console.log(err));
```
