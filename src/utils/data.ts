import { v4 as uuidv4 } from 'uuid'

export const guid = () => uuidv4().replace(/\-/g, '')
