import React from 'react';
import { render } from '../../../../utils/test-utils';
import ContentText, { diffuseLink, getDomainName } from '../ContentText';

describe('getDomainName', () => {
  it('gets expected domain name', () => {
    const domainName = getDomainName(
      'https://app-dev.smart4health.eu/legal/consent'
    );
    const expectedDomain = 'smart4health.eu';
    expect(domainName).toEqual(expectedDomain);
  });
});
describe('diffuseLink', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('diffuses anchor tag with internal url', () => {
    const componentsIndices: Record<string, number> = {};
    const components: JSX.Element[] = [];
    const anchor = '<a href="/legal/data">internal</a>';
    const transTag = diffuseLink(anchor, components, componentsIndices);
    expect(transTag).toEqual('<0>internal</0>');
    expect(components).toHaveLength(1);
    expect(componentsIndices).toEqual({ '/legal/data': 0 });
  });
  it('diffuses anchor tag with a full internal url', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://www.smart4health.eu',
        hostname: 'smart4health.eu',
      },
    });
    const componentsIndices: Record<string, number> = {};
    const components: JSX.Element[] = [];
    const anchor = `<a href="https://www.smart4health.eu/legal/data">internal</a>`;
    const transTag = diffuseLink(anchor, components, componentsIndices);
    expect(transTag).toEqual('<0>internal</0>');
    expect(components).toHaveLength(1);
    expect(componentsIndices).toEqual({ '/legal/data': 0 });
  });
  it('diffuses multiple anchor tags', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost',
        hostname: 'localhost',
      },
    });
    const componentsIndices: Record<string, number> = {};
    const components: JSX.Element[] = [];
    const content =
      '<a href="/legal/data">internal1</a> space <a href="/legal/data">internal2</a> test <a href="https://www.google.com">external</a> <a href="mailto:info@snomed.org">mail</a>';
    const diffusedContent = content.replace(/<a .*?<\/a>/g, (link: string) =>
      diffuseLink(link, components, componentsIndices)
    );
    expect(diffusedContent).toEqual(
      '<0>internal1</0> space <0>internal2</0> test <1>external</1> <2>mail</2>'
    );
    expect(components).toHaveLength(3);
    expect(componentsIndices).toEqual({
      '/legal/data': 0,
      'https://www.google.com': 1,
      'mailto:info@snomed.org': 2,
    });
  });
});
describe('ContentText', () => {
  it('renders without problems and shows correct translation key', () => {
    const root = 'consent';
    const namespace = 'legal';
    const { getByTestId } = render(
      <ContentText root={root} translationNamespace={namespace} />
    );
    expect(getByTestId('content-text')).toHaveTextContent(`${root}.content`);
  });
});
