import React, { ComponentClass, ReactElement } from 'react';
import { ConnectedComponent } from 'react-redux';
import { Redirect, Route, RouteComponentProps } from 'react-router-dom';

type ConditionalRedirectRouteProps = {
  component:
    | ReactElement
    | ComponentClass<any>
    | React.FunctionComponent
    | ConnectedComponent<any, any>;
  condition: boolean;
  redirectPath: string;
  path?: string;
  exact?: boolean;
};

interface Props extends RouteComponentProps {}

const ConditionalRedirectRoute = ({
  component: Component,
  condition,
  redirectPath,
  ...rest
}: ConditionalRedirectRouteProps) => (
  <Route
    {...rest}
    render={(props: Props) =>
      condition ? (
        /*
        // @ts-ignore */
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: redirectPath,
            state: { from: props.location },
          }}
        />
      )
    }
  />
);

export default ConditionalRedirectRoute;
