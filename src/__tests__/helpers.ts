import { Application } from "../";


export const givenApplication = (config?: object) =>  {
    return Application.getInstance().build();
}