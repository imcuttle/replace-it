/**
 * @file ejs
 * @author Cuttle Cong
 * @date 2018/3/25
 * @description
 */

import { template } from 'lodash'

/** Used to match template delimiters. */
let reEscape = /<%-([\s\S]+?)%>/g
let reEvaluate = /<%([\s\S]+?)%>/g
let reInterpolate = /<%=([\s\S]+?)%>/g

function ejsLoader(content: string, variables: object): string {
  return template(content, {})(variables)
}

module.exports = ejsLoader