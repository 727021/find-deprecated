import { ChildProcess, exec } from 'child_process'
import debug from './util/debug'

const execAsync = <T = object>(command: string, meta: T) => {
  let childProcess: ChildProcess | undefined
  const promise = new Promise<{ stdout: string; meta: T }>(
    (resolve, reject) => {
      childProcess = exec(command, (error, stdout, stderr) => {
        if (error) {
          debug.error({ error, stderr, meta })
          return reject({ error, output: stderr, dependency: meta })
        }
        resolve({ stdout, meta })
      })
    }
  )
  return { childProcess, promise }
}

const findDeprecated = async (dependencies: string[] = []) => {
  const numDeps = dependencies.length
  const deprecated: { dependency: string; notice: string }[] = []
  const running: ChildProcess[] = []
  const promises: Promise<{ stdout: string; meta: string }>[] = []

  const signals = ['SIGTERM', 'SIGINT', 'SIGKILL']
  signals.forEach(s => {
    process.on(s, () => {
      running.forEach(p => p.kill())
      const err = new Error(
        `Couldn't finish checking dependencies! Reason: Recieved ${s}`
      )
      debug.error(err)
      throw err
    })
  })

  dependencies.forEach(dep => {
    const { childProcess, promise } = execAsync<string>(
      `npm info ${dep} deprecated`,
      dep
    )
    childProcess && running.push(childProcess)
    promises.push(
      promise.then(({ stdout, meta }) => {
        if (stdout.toLowerCase().includes('deprecated')) {
          debug.info('Deprecated:', { dependency: meta, notice: stdout })
          deprecated.push({ dependency: meta, notice: stdout })
        }
        return { stdout, meta }
      })
    )
  })

  return Promise.all(promises).then(() => {
    return {
      totalChecked: numDeps,
      totalDeprecated: deprecated.length,
      deprecated,
      checked: dependencies
    }
  })
}

export { findDeprecated }
export default findDeprecated
