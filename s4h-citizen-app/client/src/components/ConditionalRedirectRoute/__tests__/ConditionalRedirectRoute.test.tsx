import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import ConditionalRedirectRoute from '../ConditionalRedirectRoute';

const createElement = (condition: boolean) => (
  <MemoryRouter initialEntries={['/abc']}>
    <ConditionalRedirectRoute
      path="/abc"
      component={() => <div>A mock is passed!</div>}
      condition={condition}
      redirectPath="/"
    />
    <Route path="/" exact>
      hello world
    </Route>
  </MemoryRouter>
);

describe('ConditionalRedirectRoute', () => {
  it('renders component if condition is truthy', () => {
    const { getByText } = render(createElement(true));
    expect(getByText('A mock is passed!')).toBeInTheDocument();
  });

  it('does not render component if condition is falsy', () => {
    const { container } = render(createElement(false));
    expect(container).toHaveTextContent(/hello world/);
  });
});
