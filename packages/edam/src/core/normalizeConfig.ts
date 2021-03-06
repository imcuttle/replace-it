/**
 * @file normalizeConfig
 * @author Cuttle Cong
 * @date 2018/3/23
 * @description
 */
import {EdamConfig, Source} from '../types/Options'
import {default as normalizeSource, Options} from './normalizeSource'
import {load} from '../lib/loadConfig'
import extendsMerge from './extendsMerge'
// eslint-disable-next-line no-unused-vars
import extendsConfig, {innerExtendsConfig, Track} from './extendsConfig'
import * as _ from 'lodash'
import * as omitNully from 'omit-nully'
import * as nps from 'path'
import constant from './constant'
import {type} from 'walli'

const debug = require('debug')('edam:normalizeConfig')

/**
 *
 * @param {EdamConfig} looseConfig
 * @param {Options} options
 * @return {Promise<EdamConfig>}
 */
export default async function normalizeConfig(
  looseConfig: EdamConfig,
  options: Options = {cwd: process.cwd()}
): Promise<{config: EdamConfig; track: Track}> {
  debug('input: loose Config %O', looseConfig)
  debug('input: options %o', options)

  looseConfig = Object.assign(
    {
      userc: true,
      yes: false,
      silent: false,
      extends: [],
      alias: {}
    },
    looseConfig
  )

  const coreSpecial = omitNully({
    userc: looseConfig.userc,
    yes: looseConfig.yes,
    silent: looseConfig.silent,
    output: looseConfig.output && nps.resolve(options.cwd, looseConfig.output),
    cacheDir:
      looseConfig.cacheDir &&
      (typeof looseConfig.cacheDir === 'string'
        ? nps.resolve(options.cwd, looseConfig.cacheDir)
        : looseConfig.cacheDir),
    updateNotify: looseConfig.updateNotify,
    includes: looseConfig.includes,
    excludes: looseConfig.excludes,
    offlineFallback: looseConfig.offlineFallback,
    storePrompts: looseConfig.storePrompts,
    // plugins: looseConfig.plugins,
    name: looseConfig.name
  })

  // merge extends Configuration
  let {config: mergedConfig, track} = await extendsConfig(looseConfig, {
    ...options,
    track: true
  })

  if (coreSpecial.userc) {
    const obj = await load(options.cwd)
    debug('rc config: %o', obj)
    if (obj) {
      const {config: rcConfig, filepath} = obj
      const mergedRcConfig = await innerExtendsConfig(rcConfig, {cwd: nps.dirname(filepath)}, track)
      debug('rc merged config: %O', mergedRcConfig)
      debug('mergedConfig config before: %O', mergedConfig)
      mergedConfig = extendsMerge({}, mergedRcConfig, mergedConfig)
    }
  }

  debug('merged config after: %O', mergedConfig)

  // default value
  mergedConfig = Object.assign(
    {
      offlineFallback: true,
      cacheDir: true,
      updateNotify: true,
      includes: () => true,
      excludes: () => false
    },
    mergedConfig
  )

  if (!mergedConfig.plugins) {
    mergedConfig.plugins = []
  }

  // normalize source
  _.each(mergedConfig.alias, (val, key) => {
    mergedConfig.alias[key] = normalizeSource(mergedConfig.alias[key], options)
  })

  // Given source is alias
  if (mergedConfig.source) {
    let sourceUrl = typeof mergedConfig.source === 'string' ? mergedConfig.source : mergedConfig.source.url

    const data = <Source>{...(<Source>mergedConfig.source || {})}
    delete data.url
    delete data.type
    let source: Source = <Source>mergedConfig.source
    if (_.isString(sourceUrl)) {
      // mergedConfig.source append with querystring
      let tmpSource = sourceUrl

      if (tmpSource in mergedConfig.alias) {
        source = {
          ...mergedConfig.alias[tmpSource],
          ...data,
          config: {...mergedConfig.alias[tmpSource].config, ...data.config}
        }
      }
    }

    if (source.type !== 'npm') {
      delete source.version
    }
    if (source.type !== 'git') {
      delete source.checkout
    }
    mergedConfig.source = source
  }

  // normalize cacheDir
  if (_.isString(mergedConfig.cacheDir)) {
    mergedConfig.cacheDir = nps.resolve(options.cwd, <string>mergedConfig.cacheDir)
  } else if (mergedConfig.cacheDir) {
    mergedConfig.cacheDir = constant.DEFAULT_CACHE_DIR
  }

  if (typeof mergedConfig.storePrompts === 'undefined') {
    mergedConfig.storePrompts = true
  }

  let sourceConfig = mergedConfig.source ? (<Source>mergedConfig.source).config || {} : {}
  debug('sourceConfig: %O', sourceConfig)

  const normalized = {
    ...mergedConfig,
    ...sourceConfig,
    pull: {
      npmClient: 'npm',
      git: 'clone',
      ...mergedConfig.pull,
      ...sourceConfig.pull,
      ...looseConfig.pull
    },
    ...coreSpecial
  }

  debug('normalized Config: %O', normalized)
  return {config: normalized, track}
}
