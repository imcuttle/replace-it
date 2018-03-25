import { Loader } from './TemplateConfig'

export type State = {
  input: string
  output?: string
  loaders?: Loader
  error?: Error
}

export interface Tree {
  [path: string]: State
}

export class TreeProcessor {
  public tree: Tree
  constructor(tree: Tree) {
    this.tree = tree
  }

  public toPrettyStates(): string {
    return JSON.stringify(this.tree, null, 2)
  }

  public toJSON() {
    return this.tree
  }
}

// export interface Resource {}
