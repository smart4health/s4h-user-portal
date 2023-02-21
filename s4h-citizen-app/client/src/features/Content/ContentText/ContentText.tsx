import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import config from '../../../config';
import { UsefulEventTarget } from '../../../types';
import { showModal } from '../../modals/modalsSlice';
import RejectAnalyticsButton from '../RejectAnalyticsButton';
import './ContentText.scss';

const EXTERNAL_LINK_CLASS = 'ContentText__external-link';

type ContentTextProps = {
  root: string;
  translationNamespace: string;
};

export const ContentText = (props: ContentTextProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [isIncludingTransTags, setIsIncludingTransTags] = useState(false);
  const { t } = useTranslation(props.translationNamespace);
  const dispatch = useDispatch();
  const transComponents = useRef<ReactElement[]>([]);

  const diffusedContent = useMemo(() => {
    /* indices of transComponent
     *  key: address
     *  value: index
     */
    const transComponentsIndices: Record<string, number> = {};

    if (location.pathname.includes(config.ROUTES.legal_data)) {
      transComponents.current = [
        <RejectAnalyticsButton translationNamespace={props.translationNamespace} />,
      ];
      transComponentsIndices.RejectAnalyticsButton = 0;
    }
    // components for <Trans> to interpolate

    const updatedContent = t(`${props.root}.content`)
      .replace(/<a .*?<\/a>/g, (link: string) =>
        diffuseLink(link, transComponents.current, transComponentsIndices)
      )
      .replace(/<h3 .*?<\/h3>/g, (heading: string) =>
        diffuseSubHeading(heading, transComponents.current, transComponentsIndices)
      );

    if (updatedContent.includes('<0>') || updatedContent.includes('<1>')) {
      setIsIncludingTransTags(true);
    }
    return updatedContent;
  }, [props.root, t, location.pathname, props.translationNamespace]);

  const onExternalLinkClick = useCallback(
    (event: Event) => {
      const target = event.target as UsefulEventTarget;
      if (target.tagName === 'SPAN' && target.className === EXTERNAL_LINK_CLASS) {
        dispatch(
          showModal({
            type: 'ExternalLink',
            options: {
              targetUrl: target.dataset.to,
            },
          })
        );
      }
    },
    [dispatch]
  );

  useEffect(
    function onMount() {
      if (contentRef.current) {
        contentRef.current.addEventListener('click', (event: MouseEvent) =>
          onExternalLinkClick(event)
        );
      }
    },
    [onExternalLinkClick]
  );

  return (
    // Cases where both innerHTML and anchor tags appear would not be supported as of now
    // Limitation: Does not work with nested list elements eg: <ul><li><ul><li></li></ul></li></ul>
    <div className="ContentText" ref={contentRef} data-testid="content-text">
      {isIncludingTransTags ? (
        <Trans defaults={diffusedContent} components={transComponents.current} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: diffusedContent }} />
      )}
    </div>
  );
};

export default ContentText;

export const getDomainName = (host: string) => {
  const domainIndex = host.lastIndexOf('.', host.lastIndexOf('.') - 1) + 1;
  const pathIndex = host.indexOf('/', domainIndex);
  // take only the domain, without the path after the '/'
  return host.substring(domainIndex, pathIndex !== -1 ? pathIndex : host.length);
};

enum TagType {
  ANCHOR = 'a',
  SUB_HEADING = 'h3',
}

const getTagText = (rawTag: string, tagType: TagType) => {
  const regex = new RegExp(`>.*</${tagType}>`, 'g');
  let linkText = rawTag.match(regex)![0]; // matches the text between the HTML tags, including <> and </a>
  linkText = linkText.substring(1, linkText.length - (3 + tagType.length)); // remove > and </a> to get pure link text
  return linkText;
};
export const diffuseLink = (
  rawLink: string,
  transComponents: JSX.Element[],
  transComponentsIndices: Record<string, number>
) => {
  let targetUrl = rawLink.match(/href=["'].*["']/)![0]; // matches everything from href itself to the href attribute end
  targetUrl = targetUrl.substring(6, targetUrl.length - 1); // remove href=" and " to get just the URL

  const domainName = getDomainName(targetUrl);
  // check if link is inside the webapp
  if (domainName === window.location.hostname) {
    const domainIndex = targetUrl.indexOf(domainName);
    // take only the path after the '/'
    targetUrl = targetUrl.substring(targetUrl.indexOf('/', domainIndex));
  }
  const linkText = getTagText(rawLink, TagType.ANCHOR);
  // lookup the address to see if we added it already
  let transIndex = transComponentsIndices[targetUrl];

  if (transIndex === undefined) {
    // add a new component if address wasn't found and its not a id hash
    if (targetUrl[0] === '#' || targetUrl.startsWith('mailto')) {
      transComponents.push(<a href={targetUrl}>${linkText}</a>);
    }
    // push a new component to transComponents
    else if (targetUrl.startsWith('/')) {
      // <Link> if the url is in the webapp
      transComponents.push(<Link to={{ pathname: targetUrl }} />);
    } else {
      // external link for all other urls
      transComponents.push(
        <span className={EXTERNAL_LINK_CLASS} data-to={targetUrl} />
      );
    }
    // attach an index to the address
    transComponentsIndices[targetUrl] = transComponents.length - 1;
    transIndex = transComponents.length - 1;
  }

  return `<${transIndex}>${linkText}</${transIndex}>`;
};

const diffuseSubHeading = (
  rawHeading: string,
  transComponents: JSX.Element[],
  transComponentsIndices: Record<string, number>
) => {
  const headingText = getTagText(rawHeading, TagType.SUB_HEADING);
  let idAttribute = rawHeading.match(/id="(.*?)"/g)![0];
  idAttribute = idAttribute.substring(4, idAttribute.length - 1);
  transComponents.push(<SubHeading id={idAttribute}>{headingText}</SubHeading>);
  transComponentsIndices[headingText] = transComponents.length - 1;
  const transIndex = transComponents.length - 1;
  return `<${transIndex}>${headingText}</${transIndex}>`;
};

const SubHeading = (props: { id: string; children: string }) => {
  return <h3 id={props.id}>{props.children}</h3>;
};
