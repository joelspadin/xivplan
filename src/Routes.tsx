import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { MainPage } from './MainPage';

export const Routes: React.FunctionComponent = () => {
    return (
        <Switch>
            <Route exact path="/" component={MainPage} />
        </Switch>
    );
};
