import debug from 'debug'

export const log = debug('deprecated:log')
export const info = debug('deprecated:info')
export const error = debug('deprecated:error')

export default { log, info, error }
