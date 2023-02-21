/* eslint-disable no-underscore-dangle,class-methods-use-this */
import settings from './settings';
import isString from './isString';

class FilterErrorEventData {
  filterXFormsIssue(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const props = Object.keys(data);
    const needsSanitization = props.some(key =>
      this._includes(key.toLowerCase(), ['context'])
    );

    if (!needsSanitization) {
      return data;
    }

    // strip  'context' property from the error
    const { context, ...sanitized } = data;

    return sanitized;
  }

  get rules() {
    // add more filtering rules here if necessary

    return [
      // case for fhir issues
      data => this.filterXFormsIssue(data),
      data => {
        if (!data || typeof data !== 'object') {
          return data;
        }

        const props = Object.keys(data);
        if (props.some(key => ['status_code', 'event_id'].includes(key))) {
          return data;
        }

        const needsSanitization = props.some(key =>
          this._includes(key.toLowerCase(), [
            'fhir',
            'questionnaire',
            'password',
            'authorization',
            'common_key',
            'cup',
            'password_key_salt',
            'code',
            'id',
            'public_key',
          ])
        );
        if (!needsSanitization) {
          return data;
        }

        return this._sanitizeValue(data);
      },
      data => {
        if (typeof data !== 'string') {
          return data;
        }

        const replacements = [
          {
            search: /[/]users[/][^/]+([/]|$)/,
            replace: '/users/(filtered)$1',
          },
          {
            search: /[/]records[/][^/]+([/]|$)/,
            replace: '/records/(filtered)$1',
          },
          {
            search: /[/]documents[/][^/]+([/]|$)/,
            replace: '/documents/(filtered)$1',
          },
          {
            search: /[/]files[/][^/]+([/]|$)/,
            replace: '/files/(filtered)$1',
          },
          {
            search: /https:.+\.blob\..*(\?|&)sig=.*/,
            replace: '(filtered blob url)',
          },
        ];

        return replacements.reduce(
          (value, { search, replace }) => value.replace(search, replace),
          data
        );
      },
      data => {
        if (typeof data !== 'string') {
          return data;
        }

        const parametersToFilter = [
          'tags',
          'redirect_uri',
          'client_id',
          'code_challenge',
          'public_key',
          'state',
        ];

        return parametersToFilter.reduce(
          (value, parameterToFilter) =>
            value.replace(
              new RegExp(`([?&])${parameterToFilter}=[^&]+`),
              `$1${parameterToFilter}=(filtered)`
            ),
          data
        );
      },
    ];
  }

  _sanitizeObject(data) {
    // in case of an object we want to preserve the original
    // structure for debugging but sanitize all primitives
    return this._mapObject(data, this._sanitizeValue.bind(this));
  }

  _sanitizeValue(value) {
    if (!value) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => this._sanitizeValue(item));
    }

    // sanitize by type
    switch (typeof value) {
      case 'object':
        return this._sanitizeObject(value);
      case 'number':
        return 123456789;
      case 'boolean':
        return false;
      default:
        return '(filtered)';
    }
  }

  _includes(value, conditions) {
    return (Array.isArray(conditions) ? conditions : [conditions]).some(condition =>
      value.includes(condition)
    );
  }

  _mapObject(data, fn) {
    return Object.keys(data).reduce((accumulator, key) => {
      const value = data[key];
      return { ...accumulator, [key]: fn(value) };
    }, {});
  }

  filter(data) {
    let isParsedJSON = false;
    if (isString(data)) {
      // try parsing the string to also apply filtering rules to its contents
      try {
        // eslint-disable-next-line no-param-reassign
        data = JSON.parse(data);
        isParsedJSON = true;
      } catch (e) {
        // proceed with unparsed data
      }
    }

    if (Array.isArray(data)) {
      return this.reconvert(
        data.map(value => this.filter(value)),
        isParsedJSON
      );
    }

    this.rules.forEach(ruleFn => {
      // eslint-disable-next-line no-param-reassign
      data = ruleFn(data);
    });

    if (data && typeof data === 'object') {
      // eslint-disable-next-line no-param-reassign
      data = this._mapObject(data, this.filter.bind(this));
    }

    return this.reconvert(data, isParsedJSON);
  }

  reconvert(data, isParsedJSON) {
    return isParsedJSON ? JSON.stringify(data) : data;
  }

  onEvent(event) {
    try {
      return settings.acceptsTracking ? this.filter(event) : null;
    } catch (error) {
      // rather do not capture the original error when sanitizing fails
      // but capture the error that happened while trying to filter
      try {
        return this.filter(this._createInternalErrorFromEvent(event, error));
      } catch (e) {
        // if even that fails, we want to pass at least anything to sentry
        return this._createInternalErrorFromEvent(event);
      }
    }
  }

  _createInternalErrorFromEvent(event, error = null) {
    const {
      environment,
      // eslint-disable-next-line camelcase
      event_id,
      platform,
      request: { url },
    } = event;

    return {
      environment,
      event_id,
      platform,
      request: {
        url,
      },
      exception: {
        values: [
          {
            value: [
              'An error happened while filtering error data',
              (error && error.message) || error,
            ]
              .filter(s => s)
              .join(': '),
          },
        ],
      },
    };
  }
}

export default FilterErrorEventData;
