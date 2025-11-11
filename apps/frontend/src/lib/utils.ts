import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Treaty } from '@elysiajs/eden'
import TreatyResponse = Treaty.TreatyResponse

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ServerFnType<Res extends Record<number, unknown>> = () => Promise<TreatyResponse<Res>>

/**
 * Provide type support for backend requests.
 * Use only if the server request results do not return the correct type.
 * @param serverFn
 */
export const getTypedServer = async <
  Res = unknown,
  Fn extends ServerFnType<Record<number, Res>> = ServerFnType<Record<200, Res>>,
>(
  serverFn: Fn,
) => {
  return serverFn()
}
