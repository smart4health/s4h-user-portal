import React from 'react';
import { NotFoundContent } from '.';
import { connect } from '../../store';
import { RootState } from '../../types';
import ViewWrapper from '../ViewWrapper';

export const NotFoundComponent = () => {
  return (
    <ViewWrapper>
      <NotFoundContent />
    </ViewWrapper>
  );
};

export default connect(({ loggedIn }: RootState) => ({ loggedIn }))(
  NotFoundComponent
);
