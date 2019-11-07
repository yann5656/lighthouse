/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('../audit.js');
const ComputedCLS = require('../../computed/metrics/cumulative-layout-shift.js');
const i18n = require('../../lib/i18n/i18n.js');

const UIStrings = {
  /** The name of the metric "Cumulative Layout Shift" that indicates how much the page changes its layout while it loads. If big segments of the page shift their location during load, the Cumulative Layout Shift will be higher. Shown to users as the label for the numeric metric value. Ideally fits within a ~40 character limit. */
  title: 'Cumulative Layout Shift',
  /** Description of the Cumulative Layout Shift metric that indicates how much the page changes its layout while it loads. If big segments of the page shift their location during load, the Cumulative Layout Shift will be higher. This description is displayed within a tooltip when the user hovers on the metric name to see more. No character length limits. 'Learn More' becomes link text to additional documentation. */
  description: 'The more the page\'s layout changes during its load, the higher the ' +
      'Cumulative Layout Shift. ' +
      'Perfectly solid == 0. Unpleasant experience >= 0.50.',
};

const str_ = i18n.createMessageInstanceIdFn(__filename, UIStrings);

/**
 * @fileoverview This metric represents the amount of visual shifting around that DOM elements do during page load.
 */
class CumulativeLayoutShift extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'cumulative-layout-shift',
      title: str_(UIStrings.title),
      description: str_(UIStrings.description),
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
      requiredArtifacts: ['traces', 'devtoolsLogs'],
    };
  }

  /**
   * @return {LH.Audit.ScoreOptions}
   */
  static get defaultOptions() {
    return {
      // TODO(paulirish): Calibrate these
      scorePODR: 0.1,
      scoreMedian: 0.5,
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @param {LH.Audit.Context} context
   * @return {Promise<LH.Audit.Product>}
   */
  static async audit(artifacts, context) {
    const trace = artifacts.traces[Audit.DEFAULT_PASS];
    const metricResult = await ComputedCLS.request(trace, context);

    return {
      score: Audit.computeLogNormalScore(
        metricResult.value,
        context.options.scorePODR,
        context.options.scoreMedian
      ),
      explanation: metricResult.explanation,
      numericValue: metricResult.value,
      // TODO: i18n and figure out how this number should be shown
      displayValue: metricResult.value.toLocaleString(),
    };
  }
}

module.exports = CumulativeLayoutShift;
module.exports.UIStrings = UIStrings;
