// relativeTime.js
class RelativeTimeFormatter {
  constructor(options = RelativeTimeFormatter.defaultOptions) {
    this.options = options;
    this.formatters = {
      auto: new Intl.RelativeTimeFormat(undefined, this.options),
    };
    this._lock = Promise.resolve(); // Start unlocked
  }

  async addLocale(locale) {
    // Wrap mutation in lock
    await this._lock;
    this._lock = (async () => {
      if (
        !Intl.RelativeTimeFormat.supportedLocalesOf(locale).includes(locale)
      ) {
        return false;
      }
      if (!this.formatters.hasOwnProperty(locale)) {
        this.formatters[locale] = new Intl.RelativeTimeFormat(
          locale,
          this.options
        );
      }
      return true;
    })();
    return this._lock;
  }

  async format(date, locale = 'auto') {
    if (!date) return 'Unknown Time';

    if (!(date instanceof Date)) {
      const parsed = Date.parse(date);
      if (isNaN(parsed)) return 'Unknown time';
      date = new Date(parsed);
    } else if (isNaN(date.getTime())) {
      return 'Unknown time';
    }

    if (!this.formatters.hasOwnProperty(locale)) {
      await this.addLocale(locale);
      if (!this.formatters.hasOwnProperty(locale)) {
        locale = 'auto'; // fallback
      }
    }

    const elapsed = date - Date.now();

    for (const { unit, value } of RelativeTimeFormatter.units) {
      if (unit === 'second' || Math.abs(elapsed) >= value) {
        return this.formatters[locale].format(
          Math.round(elapsed / value),
          unit
        );
      }
    }
  }

  static defaultOptions = {
    localeMatcher: 'best fit',
    numeric: 'auto',
    style: 'long',
  };

  static units = [
    { unit: 'year', value: 365 * 24 * 60 * 60 * 1000 },
    { unit: 'month', value: (365 / 12) * 24 * 60 * 60 * 1000 },
    { unit: 'week', value: 7 * 24 * 60 * 60 * 1000 },
    { unit: 'day', value: 24 * 60 * 60 * 1000 },
    { unit: 'hour', value: 60 * 60 * 1000 },
    { unit: 'minute', value: 60 * 1000 },
    { unit: 'second', value: 1000 },
  ];
}

// Create a default instance
const relativeTime = new RelativeTimeFormatter();

// Export both
export { RelativeTimeFormatter, relativeTime };
