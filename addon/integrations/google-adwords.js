import Ember from 'ember';
import Base from 'ember-cli-analytics/integrations/base';
import canUseDOM from 'ember-cli-analytics/utils/can-use-dom';
import without from 'ember-cli-analytics/utils/without';

const {
  assert,
  copy,
  get,
  isPresent,
  merge,
  on
} = Ember;

export default Base.extend({

  /*
   * Send a conversion completion
   * event to the analytics engine.
   *
   * @method trackConversion
   *
   * @param {Object} options
   *   Options to send the analytics engine.
   */
  trackConversion(options = {}) {
    const config = copy(get(this, 'config'));
    const { id, label } = config;
    const { value } = options;
    const properties = without(options, 'value');

    assert('You must pass a valid `id` to the GoogleAdwords adapter', id);
    assert('You must pass a valid `label` to the GoogleAdwords adapter', label);

    const googleAdwordsEvent = merge({
      'google_conversion_id': id,
      'google_conversion_language': 'en',
      'google_conversion_format': '3',
      'google_conversion_color': 'ffffff',
      'google_conversion_label': label,
      'google_remarketing_only': false,
    }, properties);

    if (isPresent(value)) {
      googleAdwordsEvent['google_conversion_value'] = value;
    }

    if (canUseDOM) {
      try {
        window['google_trackConversion'](googleAdwordsEvent);
      }
      catch (err) {
        Ember.debug(err);
      }
    }
  },

  /*
   * Insert the JavaScript tag into the
   * page, and perform any necessary
   * setup.
   *
   * @method insertTag
   * @on init
   */
  insertTag: on('init', function() {
    if (canUseDOM) {
      /* jshint ignore:start */
      (function(i,s,o,g,r,a,m){
        i[r]=i[r]||function(){(i['r'].q=i['r'].q||[]).push(arguments)}
        a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=0;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.googleadservices.com/pagead/conversion_async.js','google_trackConversion');
      /* jshint ignore:end */
    }
  }),

  /*
   * Remove the JavaScript tag from the
   * page, and perform any necessary
   * teardown.
   *
   * @method removeTag
   * @on willDestroy
   */
  removeTag: on('willDestroy', function() {
    if (canUseDOM) {
      Ember.$('script[src*="googleadservices"]').remove();
      delete window.google_trackConversion;
    }
  })
});
