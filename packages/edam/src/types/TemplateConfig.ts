export type AsyncOrSync<T> = Promise<T> | T
export type PromptType = 'checkbox' | 'radio' | 'input' | 'suggest'

export interface Prompt {
  message: string
  default?: any
  yes?: boolean
  when?: (vars: Variables) => boolean
  name: string
  type: PromptType
  options?: Array<any>
  transform?: Function
}

export type Hook = string | Function

export type Glob = string

type VarCenter = {
  once: Function
  always: Function // default
}

type GetVariable = (vc: VarCenter) => AsyncOrSync<any>
export type Variable = GetVariable | any
export type Variables = {
  [name: string]: Variable
}

export type StrictLoader = Function & { raw?: boolean }
export type StrictLoaderWithOption = [StrictLoader, any]
export type Loader = Array<StrictLoader | string | StrictLoaderWithOption> | string | StrictLoader | StrictLoaderWithOption

export type Matcher = Glob | RegExp | Function

export type Mapper = {
  test: Matcher
  loader: Loader
}

// export type Dynamic
export type FileMatcher =
  | Matcher
  | {
      when?: (vars: Variables) => boolean
      test: Matcher
    }

export default interface TemplateConfig {
  prompts?: Array<Prompt>
  hooks?: {
    [hookName: string]: Array<Hook> | Hook
  }
  ignore?: Array<string>
  variables?: Variables
  root?: string
  loaders?: {
    [loaderId: string]: Array<StrictLoader>
  }
  mappers?: Array<Mapper>

  // TODO
  move?: {}
  copy?: {}

  usefulHook: {
    gitInit?: boolean
    installDependencies?: boolean
    installDevDependencies?: boolean
  }
}
